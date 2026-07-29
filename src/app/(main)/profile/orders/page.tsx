'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, ChevronRight } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/constants';
import { Modal, StatusBadge, ORDER_STATUS_OPTIONS, ORDER_LABELS } from '@/components/ui';
import type { OrderStatus } from '@/types';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentRef: string;
  delivery: string;
  address: string;
  createdAt: string;
  deliveredAt?: string;
}

const PROGRESS_STEPS: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered'];

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [mounted, status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchOrders();
    }
  }, [session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders/my-orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (!mounted || status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl card-shadow p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Миний захиалгууд</h2>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none text-sm"
          >
            <option value="all">Бүх статус</option>
            {ORDER_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === 'Pending' ? 'Хүлээгдэж байна'
                  : s === 'Processing' ? 'Бэлтгэж байна'
                  : s === 'Shipped' ? 'Хүргэлтэнд гарсан'
                  : s === 'Delivered' ? 'Хүргэгдсэн'
                  : 'Цуцлагдсан'}
              </option>
            ))}
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Захиалга байхгүй байна</p>
            <button
              onClick={() => router.push('/products')}
              className="text-primary-500 hover:text-primary-600 font-medium"
            >
              Бараа үзэх
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="border rounded-xl p-4 hover:border-primary-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-medium text-primary-500">
                      #{order._id.slice(-8).toUpperCase()}
                    </span>
                    <StatusBadge kind="order" status={order.status} />
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-white flex items-center justify-center overflow-hidden"
                      >
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-white flex items-center justify-center text-sm font-medium text-gray-500">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {order.items.length} бараа
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {order.items.map(i => i.name).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="font-bold text-lg">{formatPrice(order.total)}</p>
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="flex items-center gap-2 text-primary-500 hover:text-primary-600 font-medium text-sm"
                  >
                    Дэлгэрэнгүй
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Захиалга #${selectedOrder?._id.slice(-8).toUpperCase()}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <StatusBadge kind="order" status={selectedOrder.status} size="md" />
              <span className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</span>
            </div>

            {/* Status Progress */}
            {selectedOrder.status !== 'Cancelled' && (
              <div className="relative">
                <div className="flex justify-between mb-2">
                  {PROGRESS_STEPS.map((status, index) => {
                    const statusIndex = PROGRESS_STEPS.indexOf(selectedOrder.status);
                    const isCompleted = index <= statusIndex;

                    return (
                      <div key={status} className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'
                        }`}>
                          {index + 1}
                        </div>
                        <span className="text-xs text-gray-500 mt-1 text-center max-w-[60px]">
                          {ORDER_LABELS[status]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                  <div
                    className="h-full bg-primary-500"
                    style={{
                      width: `${(PROGRESS_STEPS.indexOf(selectedOrder.status) / 3) * 100}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* Items */}
            <div>
              <h4 className="font-semibold mb-3">Захиалсан бараа</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">x{item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-2">Хүргэлтийн мэдээлэл</h4>
              <p className="text-gray-600">{selectedOrder.address}</p>
              <p className="text-sm text-gray-500 mt-1">
                {selectedOrder.delivery === 'city' ? 'Улаанбаатар хот' :
                 selectedOrder.delivery === 'province' ? 'Орон нутаг' : 'Оффисоос авна'}
              </p>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Нийт дүн:</span>
                <span className="text-xl font-bold text-primary-500">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
