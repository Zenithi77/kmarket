import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'KMarket - Coming Soon',
  description: 'KMarket Online Shop is launching soon. Stay tuned for an amazing shopping experience!',
};

export default function ComingSoonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
