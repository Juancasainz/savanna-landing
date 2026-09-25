import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Download } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { ContactForm } from '@/components/contact-form';
import { getContactConfig } from '@/lib/contact-config';
export const metadata: Metadata = { title: 'Contact me' };
export const dynamic = 'force-dynamic';

export default function ContactPage() {
 const configured = Boolean(getContactConfig());
 return <><Header contact/><main id="main" className="contact-main"><Link className="contact-back" href="/"><ArrowLeft size={16}/>Back to my world</Link><div className="contact-layout"><div className="contact-intro"><p className="eyebrow">Bookings & collaborations</p><h1>Good things<br/>start with<br/><em>a connection.</em></h1><p>A dance floor, a new idea, a place to meet. Tell me what you have in mind.</p><a className="presskit-download presskit-download--desktop" href="/savanna-presskit-2026.pdf" download><Download size={18} strokeWidth={1.6} aria-hidden="true"/>Download press kit</a></div><ContactForm configured={configured}/></div></main><Footer/></>;
}
