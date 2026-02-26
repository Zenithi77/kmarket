import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KMarket - Удахгүй нээгдэж байна',
  description: 'KMarket удахгүй нээгдэж байна. Монголын шилдэг онлайн дэлгүүрийг хүлээнэ үү!',
};

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
