import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'SAVANNA — Rooted in rhythm', template: '%s · SAVANNA' },
  description: 'Progressive journeys, tribal rhythms and a shared connection. Enter the world of Savanna: DJ, music and bookings.',
};
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
