'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/constants';
import { Order } from '@/types';
import confetti from 'canvas-confetti';

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    // Trigger confetti on mount
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Fetch order details
    if (orderId) {
      // In real app, fetch from API
      // For now, just show success message
    }
  }, [orderId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl card-shadow p-8 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Захиалга амжилттай!
        </h1>
        <p className="text-gray-600 mb-6">
          Таны захиалга баталгаажлаа. Удахгүй хүргэлт хийгдэнэ.
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-500 mb-1">Захиалгын дугаар</p>
            <p className="font-mono font-bold text-lg">{orderId}</p>
          </div>
        )}

        <div className="space-y-4 text-left mb-8">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-primary-600 font-bold text-sm">1</span>
            </div>
            <div>
              <p className="font-medium">Төлбөр баталгаажсан</p>
              <p className="text-sm text-gray-500">Таны төлбөр амжилттай хүлээн авагдлаа</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-400 font-bold text-sm">2</span>
            </div>
            <div>
              <p className="font-medium text-gray-400">Бэлтгэж байна</p>
              <p className="text-sm text-gray-400">Захиалгыг бэлтгэж байна</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-gray-400 font-bold text-sm">3</span>
            </div>
            <div>
              <p className="font-medium text-gray-400">Хүргэлт</p>
              <p className="text-sm text-gray-400">1-3 хоногт хүргэгдэнэ</p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <Link href="/profile/orders" className="btn-primary w-full flex items-center justify-center">
            Захиалга хянах
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
          <Link href="/products" className="btn-secondary w-full">
            Үргэлжлүүлэн худалдаа хийх
          </Link>
        </div>
      </div>
    </div>
  );
}
