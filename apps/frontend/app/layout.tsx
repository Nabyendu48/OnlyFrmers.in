import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OnlyFarmers.in - Direct-from-farm Marketplace',
  description: 'Connect directly with farmers. Better prices through live auctions and bargaining. Commission-free marketplace.',
  keywords: 'farmers, agriculture, marketplace, live auction, bargaining, crops, direct farm',
  authors: [{ name: 'OnlyFarmers.in' }],
  openGraph: {
    title: 'OnlyFarmers.in - Direct-from-farm Marketplace',
    description: 'Connect directly with farmers. Better prices through live auctions and bargaining.',
    url: 'https://onlyfarmers.in',
    siteName: 'OnlyFarmers.in',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OnlyFarmers.in - Direct-from-farm Marketplace',
    description: 'Connect directly with farmers. Better prices through live auctions and bargaining.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
