'use client';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, CheckCircle2, Download, LoaderCircle, Mail } from 'lucide-react';

declare global {interface Window {turnstile?: {render: (element: HTMLElement, options: {sitekey: string; callback: (token: string) => void; 'expired-callback': () => void; 'error-callback': () => void; theme: 'dark'}) => string; reset: (id: string) => void; remove: (id: string) => void}}}
const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
export function ContactForm({configured}: {configured: boolean}) {
 const [kind, setKind] = useState('Booking');
 const [status, setStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');
 const [error, setError] = useState('');
 const [token, setToken] = useState('');
 const [captchaReady, setCaptchaReady] = useState(false);
 const [captchaError, setCaptchaError] = useState(false);
 const widget = useRef<HTMLDivElement>(null);
 const widgetId = useRef<string | null>(null);
 const startedAt = useRef(Date.now());
 const submissionId = useRef<string>('');
 useEffect(() => {
   if (!captchaReady || !widget.current || !window.turnstile || !siteKey) return;
   widgetId.current = window.turnstile.render(widget.current, {sitekey: siteKey, theme:'dark', callback: value => {setToken(value);setCaptchaError(false);}, 'expired-callback': () => setToken(''), 'error-callback': () => {setToken('');setCaptchaError(true);}});
   return () => {if(widgetId.current) window.turnstile?.remove(widgetId.current);widgetId.current=null;};
 }, [captchaReady]);
 async function submit(event: React.FormEvent<HTMLFormElement>) {
   event.preventDefault();
   if(status === 'sending') return;
   setError('');
   if(!configured) {setStatus('error');setError('The contact form is not available yet. Please email djsavanna.bookings@gmail.com.');return;}
   if(!token) {setStatus('error');setError('Please complete the security check before sending.');return;}
   const form = event.currentTarget;
   const values = new FormData(form);
   if (!submissionId.current) submissionId.current = crypto.randomUUID();
   setStatus('sending');
   try {
     const response = await fetch('/api/contact', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:values.get('name'),email:values.get('email'),inquiryType:kind,message:values.get('message'),privacyConsent:values.get('privacyConsent') === 'on',website:values.get('website'),captchaToken:token,startedAt:startedAt.current,id:submissionId.current}),signal:AbortSignal.timeout(65000)});
     const data = await response.json();
     if(!response.ok || data.sent !== true) throw new Error(data.error || 'Your message could not be sent. Please try again or email me directly.');
     setStatus('success');form.reset();setKind('Booking');submissionId.current='';startedAt.current=Date.now();
   } catch(err) {setStatus('error');setError(err instanceof Error && err.name !== 'TimeoutError' ? err.message : 'Confirmation is taking longer than expected. Your message may already be on its way. Please wait a moment before trying again, or email me directly.');}
   finally {setToken('');if(widgetId.current) window.turnstile?.reset(widgetId.current);}
 }
 return <div>{configured && siteKey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" onReady={() => setCaptchaReady(true)} onError={() => setCaptchaError(true)}/>}
 <form className="contact-form" onSubmit={submit} aria-label="Contact Savanna" aria-busy={status === 'sending'}><div className="email-address"><Mail size={22} strokeWidth={1.5} aria-hidden="true"/><span>djsavanna.bookings@gmail.com</span></div><div className="form-grid"><div className="field"><label htmlFor="name">Name</label><input id="name" name="name" autoComplete="name" required minLength={2} maxLength={80} placeholder="Your name"/></div><div className="field"><label htmlFor="email">Email</label><input id="email" name="email" autoComplete="email" type="email" required maxLength={120} placeholder="you@example.com"/></div><div className="field full"><label htmlFor="inquiryType">Inquiry type</label><select id="inquiryType" name="inquiryType" value={kind} onChange={e => setKind(e.target.value)}><option>Booking</option><option>Collaboration</option><option>Press & media</option><option>Other</option></select></div><div className="field full"><label htmlFor="message">Message</label><textarea id="message" name="message" required minLength={10} maxLength={3000} rows={5} placeholder="Tell me a little about your event or idea…"/></div></div><div className="honeypot" aria-hidden="true"><label htmlFor="website">Website</label><input id="website" name="website" tabIndex={-1} autoComplete="off"/></div><label className="consent"><input type="checkbox" name="privacyConsent" required/><span>I agree that my details may be used to respond to this inquiry.</span></label>
 {configured ? <><div className="captcha-container" ref={widget}/>{captchaError && <p className="captcha-message">The security check could not load. Refresh this page or <a className="text-link" href="mailto:djsavanna.bookings@gmail.com">email me directly</a>.</p>}</> : <p className="form-status">The form is opening soon. In the meantime, <a className="text-link" href="mailto:djsavanna.bookings@gmail.com">send me an email <ArrowUpRight size={15}/></a>.</p>}
 {status === 'error' && <p className="form-status error" role="alert">{error}</p>}{status === 'success' && <p className="form-status success" role="status"><CheckCircle2 size={18} style={{verticalAlign:'middle',marginRight:8}}/>Your message is on its way to Savanna. Thank you for reaching out.</p>}
 <button className="button button-rust form-submit" type="submit" disabled={status === 'sending' || !configured}><span aria-live="polite">{status === 'sending' ? 'Sending…' : 'Send inquiry'}</span>{status === 'sending' ? <LoaderCircle className="submit-spinner" size={18} aria-hidden="true"/> : <ArrowUpRight size={18} aria-hidden="true"/>}</button><a className="presskit-download presskit-download--mobile" href="/savanna-presskit-2026.pdf" download><Download size={18} strokeWidth={1.6} aria-hidden="true"/>Download press kit</a>
 <p className="privacy-note">Your details are used only to handle your inquiry and follow up with you. When you send this form, your message is sent by email using Google Apps Script; Cloudflare Turnstile helps prevent spam. To ask about or request deletion of your information, email djsavanna.bookings@gmail.com.</p></form></div>;
}
