import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { SocialLinks } from '@/components/social-links';
export function Footer() {
 return <footer className="footer"><div className="footer-brand"><Link href="/" className="wordmark">SΛVΛNNΛ</Link><SocialLinks label="Savanna social media — footer"/></div><div className="footer-links"><a href="/savanna-presskit-2026.pdf" target="_blank" rel="noreferrer">Press kit <ArrowUpRight size={16}/></a><span className="footer-email">djsavanna.bookings@gmail.com</span></div><span className="copyright">© {new Date().getFullYear()} Savanna</span></footer>;
}
