import type { Metadata, Viewport } from 'next';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Analytics from '@/components/Analytics';

export const metadata: Metadata = {
  title: {
    template: '%s | Techzim Startups',
    default: 'Techzim Startups — Discover & Rank African Startups',
  },
  description:
    'Discover, test, and rank the best Zimbabwean and African startups. Community-powered leaderboard by Techzim.',
  keywords: ['zimbabwe startups', 'african tech', 'techzim', 'startup leaderboard', 'fintech africa'],
  openGraph: {
    siteName: 'Techzim Startups',
    type: 'website',
  },
};

export const viewport: Viewport = {
  themeColor: '#E85D04',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a href="#main" className="sr-only">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
