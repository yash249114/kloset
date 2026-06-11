import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'sonner';
import SupportWidget from '@/components/support/SupportWidget';
import GoogleProvider from '@/components/providers/GoogleProvider';
import { CSPostHogProvider } from '@/components/providers/PostHogProvider';

export const metadata: Metadata = {
  title: 'Kloset — Rent Designer Outfits',
  description:
    'Rent designer Indian outfits for weddings, parties, and festivals. Browse lehengas, sarees, sherwanis, and more from verified owners across India.',
  keywords: [
    'fashion rental',
    'rent outfits',
    'designer wear',
    'lehenga rental',
    'saree rental',
    'wedding outfits',
    'Indian fashion',
    'Kloset',
  ],
  openGraph: {
    title: 'Kloset — Rent Designer Outfits',
    description: 'Rent designer Indian outfits for any occasion.',
    type: 'website',
    url: 'https://kloset.in',
    siteName: 'Kloset',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CSPostHogProvider>
          <GoogleProvider>
            <Navbar />
            <main style={{ paddingTop: 'var(--nav-height)' }}>
              {children}
            </main>
            <Footer />
            <Toaster
              position="top-right"
              toastOptions={{
                style: { fontFamily: 'var(--font-body)' },
              }}
            />
            <SupportWidget />
          </GoogleProvider>
        </CSPostHogProvider>
      </body>
    </html>
  );
}

