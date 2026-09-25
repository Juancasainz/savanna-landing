'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Orbit, Disc3, AudioLines, Mail, Menu, X } from 'lucide-react';

export function Header({contact = false}: {contact?: boolean}) {
  const [open, setOpen] = useState(false);
  useEffect(() => { const close = (event: KeyboardEvent) => { if(event.key === 'Escape') setOpen(false); }; window.addEventListener('keydown', close); return () => window.removeEventListener('keydown', close); }, []);
  const root = contact ? '/' : '';
  return <header className="site-header"><Link className="wordmark" href="/" aria-label="Savanna home">SΛVΛNNΛ</Link>
    <button className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="main-nav" aria-label={open ? 'Close menu' : 'Open menu'}>{open ? <X/> : <Menu/>}</button>
    <nav id="main-nav" className={open ? 'nav-open' : ''} aria-label="Main navigation">
      <Link href={`${root}#about`} onClick={() => setOpen(false)}><Orbit/>About me</Link>
      <Link href={`${root}#music`} onClick={() => setOpen(false)}><Disc3/>My music</Link>
      <Link href={`${root}#sets`} onClick={() => setOpen(false)}><AudioLines/>My DJ sets</Link>
      <Link href="/contact" className="nav-contact" aria-current={contact ? 'page' : undefined} onClick={() => setOpen(false)}><Mail/>Contact me</Link>
    </nav>
  </header>;
}
