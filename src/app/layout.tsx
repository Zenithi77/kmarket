import type { Metadata } from 'next';
import { Inter, Pacifico, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

// Playful script used only for the "KMarket" wordmark, to give the brand logo
// more character than the sans-serif UI font used everywhere else.
const pacifico = Pacifico({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-pacifico',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KMarket - Монголын #1 Онлайн Дэлгүүр',
  description: 'Beauty, Fashion, Shoes болон бусад брэндүүдийн бүтээгдэхүүнийг хамгийн сайн үнээр худалдаж аваарай.',
  keywords: 'онлайн дэлгүүр, худалдаа, fashion, beauty, shoes, dyson, Mongolia, Монгол',
  openGraph: {
    title: 'KMarket - Монголын #1 Онлайн Дэлгүүр',
    description: 'Beauty, Fashion, Shoes болон бусад брэндүүдийн бүтээгдэхүүнийг хамгийн сайн үнээр худалдаж аваарай.',
    type: 'website',
    locale: 'mn_MN',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn" className={`${inter.variable} ${pacifico.variable} ${jetbrainsMono.variable}`}>
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
