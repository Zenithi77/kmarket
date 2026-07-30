'use client';

import { Header, Footer, CartSidebar, IntroVideo } from '@/components/layout';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <IntroVideo />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartSidebar />
    </div>
  );
}
