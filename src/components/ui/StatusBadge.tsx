'use client';

import type { OrderStatus, PaymentStatus } from '@/types';

type Kind = 'order' | 'payment';

interface StatusBadgeProps {
  kind: Kind;
  status: OrderStatus | PaymentStatus | string;
  size?: 'sm' | 'md';
}

export const ORDER_LABELS: Record<OrderStatus, string> = {
  Pending: 'Хүлээгдэж буй',
  Processing: 'Бэлтгэж буй',
  Shipped: 'Хүргэлтэд гарсан',
  Delivered: 'Хүргэгдсэн',
  Cancelled: 'Цуцлагдсан',
};

const ORDER_COLORS: Record<OrderStatus, string> = {
  Pending: 'bg-gray-100 text-gray-700',
  Processing: 'bg-blue-50 text-blue-700',
  Shipped: 'bg-purple-50 text-purple-700',
  Delivered: 'bg-green-50 text-green-700',
  Cancelled: 'bg-sale-50 text-sale-700',
};

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  Pending: 'Төлбөр хүлээгдэж буй',
  Paid: 'Төлөгдсөн',
  PendingReview: 'Шалгагдаж буй',
  Failed: 'Амжилтгүй',
  Refunded: 'Буцаагдсан',
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  Pending: 'bg-gray-100 text-gray-700',
  Paid: 'bg-green-50 text-green-700',
  PendingReview: 'bg-amber-50 text-amber-700',
  Failed: 'bg-sale-50 text-sale-700',
  Refunded: 'bg-gray-100 text-gray-700',
};

export function StatusBadge({ kind, status, size = 'sm' }: StatusBadgeProps) {
  const labels = kind === 'order' ? ORDER_LABELS : PAYMENT_LABELS;
  const colors = kind === 'order' ? ORDER_COLORS : PAYMENT_COLORS;
  const label = labels[status as keyof typeof labels] || status;
  const color = colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  const sizeClasses = size === 'md' ? 'h-7 px-3 text-xs' : 'h-6 px-2.5 text-xs';

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap ${sizeClasses} ${color}`}
    >
      {label}
    </span>
  );
}

export const ORDER_STATUS_OPTIONS: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
