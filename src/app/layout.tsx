import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';

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
    <html lang="mn">
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