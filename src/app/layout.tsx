import type { Metadata } from 'next';
import { Providers } from './providers';
import './globals.css';
import { redirect } from 'next/navigation';

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
  // Check if coming soon mode is enabled
  const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === 'true';

  return (
    <html lang="mn">
      <body className="antialiased">
        <Providers>
          {isComingSoon ? (
            // Show coming soon page
            <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 flex items-center justify-center px-4">
              <div className="text-center max-w-2xl">
                <div className="mb-12">
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-4">
                    KMarket
                  </h1>
                  <div className="h-1 w-24 bg-white mx-auto rounded-full"></div>
                </div>
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                  Удахгүй нээгдэж байна
                </h2>
                <p className="text-xl md:text-2xl text-blue-100 mb-12">
                  Манай вэбсайт удахгүй нээгдэж байна. Хүлээнэ үү!
                </p>
              </div>
            </div>
          ) : (
            // Show full website
            children
          )}
        </Providers>
      </body>
    </html>
  );
}