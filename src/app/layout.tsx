import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://savannasound.com'),
  title: { default: 'SAVANNA — Rooted in rhythm', template: '%s · SAVANNA' },
  description: 'Progressive journeys, tribal rhythms and a shared connection. Enter the world of Savanna: DJ, music and bookings.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: 'https://savannasound.com/',
    siteName: 'SAVANNA',
    title: 'SAVANNA — Rooted in rhythm',
    description: 'Progressive journeys, tribal rhythms and a shared connection. Enter the world of Savanna: DJ, music and bookings.',
    images: [{
      url: '/images/savanna-hero-cosmic.png',
      width: 1672,
      height: 941,
      alt: 'Savanna performing beneath a cosmic sky',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAVANNA — Rooted in rhythm',
    description: 'Progressive journeys, tribal rhythms and a shared connection. Enter the world of Savanna: DJ, music and bookings.',
    images: ['/images/savanna-hero-cosmic.png'],
  },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
