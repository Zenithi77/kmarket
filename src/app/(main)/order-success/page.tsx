'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import confetti from 'canvas-confetti';

interface OrderSummary {
  order_number: string;
  final_amount: number;
  items: { name: string; quantity: number }[];
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState<OrderSummary | null>(null);

  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });

    if (!orderId) return;
    fetch(`/api/orders/${orderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setOrder(data);
      })
      .catch(() => {});
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

        {(order || orderId) && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">Захиалгын дугаар</p>
              <p className="font-mono font-bold">{order?.order_number || orderId}</p>
            </div>
            {order && (
              <>
                <div className="border-t border-gray-200 pt-3 space-y-1">
                  {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm text-gray-600">
                      <span className="truncate pr-2">{item.name}</span>
                      <span className="flex-shrink-0">x{item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-medium text-gray-900">Нийт дүн</span>
                  <span className="font-bold text-primary-600">{formatPrice(order.final_amount)}</span>
                </div>
              </>
            )}
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

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
