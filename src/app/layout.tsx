import type { Metadata } from 'next';
import { Inter, Hanken_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-hanken',
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
    <html lang="mn" className={`${inter.variable} ${hanken.variable} ${jetbrainsMono.variable}`}>
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
