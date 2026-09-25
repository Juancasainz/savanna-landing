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
      url: '/images/savanna-about-studio.jpg',
      width: 3642,
      height: 5692,
      alt: 'Savanna in her studio portrait',
    }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SAVANNA — Rooted in rhythm',
    description: 'Progressive journeys, tribal rhythms and a shared connection. Enter the world of Savanna: DJ, music and bookings.',
    images: ['/images/savanna-about-studio.jpg'],
  },
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
