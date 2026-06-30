import type { Metadata } from 'next';
import { Playfair_Display, Poppins } from 'next/font/google';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FloatingElements from '@/components/layout/FloatingElements';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

const poppins = Poppins({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Glow Beauty Studio – Where Beauty Meets Perfection',
    template: '%s | Glow Beauty Studio',
  },
  description:
    'Glow Beauty Studio offers premium beauty services including hair, skin, nails, makeup, bridal packages, and luxury spa treatments in a world-class salon.',
  keywords: [
    'beauty salon', 'hair salon', 'bridal makeup', 'facial', 'spa',
    'nail art', 'makeup artist', 'hair spa', 'Glow Beauty Studio',
  ],
  authors: [{ name: 'Glow Beauty Studio' }],
  openGraph: {
    type: 'website',
    siteName: 'Glow Beauty Studio',
    title: 'Glow Beauty Studio – Where Beauty Meets Perfection',
    description: 'Premium beauty services for every occasion. Book your appointment today.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Glow Beauty Studio – Where Beauty Meets Perfection',
    description: 'Premium beauty services for every occasion.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${poppins.variable}`}>
      <head>
        <meta name="theme-color" content="#E91E63" />
        <link rel="canonical" href={process.env.NEXT_PUBLIC_APP_URL} />
      </head>
      <body className="font-body bg-background text-foreground antialiased">
        <AuthProvider>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <FloatingElements />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontFamily: 'Poppins, sans-serif',
                borderRadius: '12px',
                border: '1px solid rgba(233,30,99,0.15)',
                boxShadow: '0 8px 32px rgba(233,30,99,0.12)',
              },
              success: {
                iconTheme: { primary: '#E91E63', secondary: '#fff' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
