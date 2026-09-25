import { NextResponse } from 'next/server';
import { isRateLimited, validateContact } from '@/lib/contact';
import { getContactConfig } from '@/lib/contact-config';

export const runtime = 'nodejs';
export const maxDuration = 60;
const recipient = 'djsavanna.bookings@gmail.com';
const deliveryError = 'We could not confirm your message was sent. Please try again or email ' + recipient + '.';

export async function POST(request: Request) {
  try {
    if (!request.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json({error: 'Please send a JSON request.'}, {status: 415});
    }
    const text = await request.text();
    if (text.length > 16000) return NextResponse.json({error: 'Your message is too long.'}, {status: 413});
    let raw: unknown;
    try { raw = JSON.parse(text); }
    catch { return NextResponse.json({error: 'Invalid request.'}, {status: 400}); }

    const parsed = validateContact(raw);
    if ('error' in parsed) return NextResponse.json({error: parsed.error}, {status: 400});
    const value = parsed.value;
    const config = getContactConfig();
    if (!config) {
      return NextResponse.json({error: 'The form is not available yet. Please email ' + recipient + '.', sent: false}, {status: 503});
    }
    const {webhook, secret, captchaSecret} = config;
    if (isRateLimited(value.email)) {
      return NextResponse.json({error: 'Too many attempts. Please try again later or email me directly.'}, {status: 429, headers: {'Retry-After': '3600'}});
    }
    const check = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({secret: captchaSecret, response: value.captchaToken}),
      signal: AbortSignal.timeout(8000),
    });
    const verification = await check.json();
    if (!check.ok || verification.success !== true) {
      return NextResponse.json({error: 'The security check expired or failed. Please complete it again.'}, {status: 400});
    }

    const contact = {
      id: value.id, name: value.name, email: value.email.toLowerCase(),
      inquiryType: value.inquiryType, message: value.message, privacyConsent: true,
    };
    const result = await fetch(webhook, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({secret, type: 'contact', contact}),
      redirect: 'follow',
      // Apps Script can start slowly, then redirect to Google to return its JSON.
      // Keep this below the route budget and the browser's 65-second timeout.
      signal: AbortSignal.timeout(45000),
    });
    const data = await result.json();
    if (!result.ok || data?.ok !== true || data?.sent !== true) {
      const knownCodes = ['unauthorized', 'invalid_contact', 'busy', 'quota_exceeded', 'delivery_failed'];
      console.error('[contact] Google did not confirm sending', {status: result.status, code: knownCodes.includes(data?.code) ? data.code : 'unexpected_response'});
      return NextResponse.json({error: deliveryError, sent: false}, {status: 502});
    }
    // MailApp accepted the message; actual inbox delivery still needs verification.
    return NextResponse.json({ok: true, sent: true});
  } catch (error) {
    const cause = error instanceof Error ? (error as Error & {cause?: {code?: string}}).cause : undefined;
    console.error('[contact] Confirmation request failed', {name: error instanceof Error ? error.name : 'UnknownError', code: cause?.code});
    if (error instanceof Error && error.name === 'TimeoutError') {
      return NextResponse.json({error: 'Google is taking longer than expected to confirm your message. It may already be on its way. Please wait a moment before trying again, or email ' + recipient + '.', sent: false}, {status: 504});
    }
    return NextResponse.json({error: deliveryError, sent: false}, {status: 502});
  }
}
