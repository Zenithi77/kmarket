'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Package, Eye, ChevronRight, Search, Filter } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/constants';
import { Modal } from '@/components/ui';

// Mock orders data
const mockOrders = [
  {
    id: 'KM-ABC12',
    items: [
      { name: 'Dyson Airwrap', quantity: 1, price: 2200000, image: '/products/dyson.jpg' },
      { name: 'MAC Lipstick', quantity: 2, price: 95000, image: '/products/mac.jpg' }
    ],
    total: 2395000,
    status: 'Delivered',
    paymentRef: 'KM-ABC12',
    delivery: 'city',
    address: 'БЗД, 3-р хороо, 45-р байр, 304 тоот',
    createdAt: '2024-01-15T10:30:00Z',
    deliveredAt: '2024-01-18T14:00:00Z'
  },
  {
    id: 'KM-DEF34',
    items: [
      { name: 'Nike Air Force 1', quantity: 1, price: 450000, image: '/products/nike.jpg' }
    ],
    total: 455000,
    status: 'Shipped',
    paymentRef: 'KM-DEF34',
    delivery: 'city',
    address: 'БЗД, 3-р хороо, 45-р байр, 304 тоот',
    createdAt: '2024-01-14T09:15:00Z',
    deliveredAt: null
  },
  {
    id: 'KM-GHI56',
    items: [
      { name: 'Zara Blazer', quantity: 1, price: 380000, image: '/products/zara.jpg' }
    ],
    total: 390000,
    status: 'Processing',
    paymentRef: 'KM-GHI56',
    delivery: 'province',
    address: 'Дархан-Уул аймаг',
    createdAt: '2024-01-13T14:20:00Z',
    deliveredAt: null
  },
  {
    id: 'KM-JKL78',
    items: [
      { name: 'Adidas Ultraboost', quantity: 1, price: 450000, image: '/products/adidas.jpg' }
    ],
    total: 455000,
    status: 'Pending',
    paymentRef: 'KM-JKL78',
    delivery: 'pickup',
    address: 'Оффисоос авна',
    createdAt: '2024-01-12T11:00:00Z',
    deliveredAt: null
  }
];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-blue-100 text-blue-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700'
};

const statusLabels: Record<string, string> = {
  Pending: 'Төлбөр хүлээж байна',
  Paid: 'Төлбөр хийгдсэн',
  Processing: 'Бэлтгэж байна',
  Shipped: 'Хүргэлтэнд гарсан',
  Delivered: 'Хүргэгдсэн',
  Cancelled: 'Цуцлагдсан'
};

export default function OrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = statusFilter === 'all' 
    ? mockOrders 
    : mockOrders.filter(order => order.status === statusFilter);

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
            <option value="Pending">Хүлээгдэж байна</option>
            <option value="Processing">Бэлтгэж байна</option>
            <option value="Shipped">Хүргэлтэнд гарсан</option>
            <option value="Delivered">Хүргэгдсэн</option>
          </select>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Захиалга байхгүй байна</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="border rounded-xl p-4 hover:border-primary-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <span className="font-mono font-medium text-primary-500">{order.id}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">{formatDate(order.createdAt)}</span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex -space-x-2">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div
                        key={index}
                        className="w-12 h-12 bg-gray-100 rounded-lg border-2 border-white flex items-center justify-center"
                      >
                        <Package className="w-5 h-5 text-gray-400" />
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
                    <p className="text-sm text-gray-500">
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
        title={`Захиалга ${selectedOrder?.id}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.status]}`}>
                {statusLabels[selectedOrder.status]}
              </span>
              <span className="text-sm text-gray-500">{formatDate(selectedOrder.createdAt)}</span>
            </div>

            {/* Status Progress */}
            <div className="relative">
              <div className="flex justify-between mb-2">
                {['Pending', 'Processing', 'Shipped', 'Delivered'].map((status, index) => {
                  const statusIndex = ['Pending', 'Processing', 'Shipped', 'Delivered'].indexOf(selectedOrder.status);
                  const isCompleted = index <= statusIndex;
                  
                  return (
                    <div key={status} className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isCompleted ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-400'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{statusLabels[status]}</span>
                    </div>
                  );
                })}
              </div>
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-10">
                <div 
                  className="h-full bg-primary-500"
                  style={{ 
                    width: `${(['Pending', 'Processing', 'Shipped', 'Delivered'].indexOf(selectedOrder.status) / 3) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Items */}
            <div>
              <h4 className="font-semibold mb-3">Захиалсан бараа</h4>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
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

            {/* Payment Reference */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Төлбөрийн лавлах код:</strong> {selectedOrder.paymentRef}
              </p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
