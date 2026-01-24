'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  Phone,
  Truck
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/constants';
import { Button, Modal } from '@/components/ui';

// Mock orders data
const mockOrders = [
  {
    id: 'KM-ABC12',
    customer: {
      name: 'Батболд Ганзориг',
      email: 'batbold@gmail.com',
      phone: '99112233'
    },
    items: [
      { name: 'Dyson Airwrap', quantity: 1, price: 2200000 },
      { name: 'MAC Lipstick', quantity: 2, price: 95000 }
    ],
    total: 2390000,
    status: 'Pending',
    paymentRef: 'KM-ABC12',
    delivery: 'city',
    address: 'БЗД, 3-р хороо, 45-р байр, 304 тоот',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'KM-DEF34',
    customer: {
      name: 'Сарнай Батсүх',
      email: 'sarnai@gmail.com',
      phone: '88001122'
    },
    items: [
      { name: 'Nike Air Force 1', quantity: 1, price: 450000 },
      { name: 'Adidas Ultraboost', quantity: 1, price: 450000 }
    ],
    total: 905000,
    status: 'Paid',
    paymentRef: 'KM-DEF34',
    delivery: 'city',
    address: 'СХД, 11-р хороо, Нуурын 2 гудамж',
    createdAt: '2024-01-15T09:15:00Z'
  },
  {
    id: 'KM-GHI56',
    customer: {
      name: 'Тэмүүжин Болд',
      email: 'temuujin@gmail.com',
      phone: '95556677'
    },
    items: [
      { name: 'Zara Blazer', quantity: 1, price: 380000 }
    ],
    total: 385000,
    status: 'Processing',
    paymentRef: 'KM-GHI56',
    delivery: 'province',
    address: 'Дархан-Уул аймаг, Дархан сум',
    createdAt: '2024-01-14T14:20:00Z'
  },
  {
    id: 'KM-JKL78',
    customer: {
      name: 'Болормаа Эрдэнэ',
      email: 'bolormaa@gmail.com',
      phone: '99887766'
    },
    items: [
      { name: 'Dyson V15', quantity: 1, price: 1850000 }
    ],
    total: 1855000,
    status: 'Shipped',
    paymentRef: 'KM-JKL78',
    delivery: 'city',
    address: 'ХУД, 15-р хороо, Ривер гарден',
    createdAt: '2024-01-14T11:00:00Z'
  },
  {
    id: 'KM-MNO90',
    customer: {
      name: 'Ганболд Сүхбат',
      email: 'ganbold@gmail.com',
      phone: '99445566'
    },
    items: [
      { name: 'Nike Dunk Low', quantity: 2, price: 350000 }
    ],
    total: 705000,
    status: 'Delivered',
    paymentRef: 'KM-MNO90',
    delivery: 'pickup',
    address: 'Оффисоос авна',
    createdAt: '2024-01-13T16:45:00Z'
  }
];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-green-100 text-green-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700'
};

const statusLabels: Record<string, string> = {
  Pending: 'Хүлээгдэж байна',
  Paid: 'Төлбөр хийгдсэн',
  Processing: 'Бэлтгэж байна',
  Shipped: 'Хүргэлтэнд гарсан',
  Delivered: 'Хүргэгдсэн',
  Cancelled: 'Цуцлагдсан'
};

const allStatuses = ['Pending', 'Paid', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<typeof mockOrders[0] | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.phone.includes(searchQuery);
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId: string, newStatus: string) => {
    console.log('Update order', orderId, 'to', newStatus);
    // API call here
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Захиалгууд</h1>
          <p className="text-gray-500 mt-1">Нийт {mockOrders.length} захиалга</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedStatus === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Бүгд ({mockOrders.length})
        </button>
        {allStatuses.map(status => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === status
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {statusLabels[status]} ({mockOrders.filter(o => o.status === status).length})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl card-shadow p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Захиалгын дугаар, нэр, утас хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Захиалга
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Захиалагч
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Бараа
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Дүн
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Огноо
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-mono font-medium text-primary-500">
                      {order.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                    <p className="text-sm text-gray-500">{order.customer.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-900">
                      {order.items.length} бараа
                    </p>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <p className="text-sm text-gray-500">
            1-5 / {filteredOrders.length} захиалга
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium">1</span>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
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
            {/* Status Update */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.status]}`}>
                {statusLabels[selectedOrder.status]}
              </span>
              <select
                value={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none text-sm"
              >
                {allStatuses.map(status => (
                  <option key={status} value={status}>{statusLabels[status]}</option>
                ))}
              </select>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Захиалагчийн мэдээлэл</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-gray-500">Нэр:</span>
                  <span className="font-medium">{selectedOrder.customer.name}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedOrder.customer.phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedOrder.address}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span>
                    {selectedOrder.delivery === 'city' ? 'Улаанбаатар хот' :
                     selectedOrder.delivery === 'province' ? 'Орон нутаг' : 'Оффисоос авна'}
                  </span>
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-semibold mb-3">Захиалсан бараа</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                        <Package className="w-5 h-5 text-gray-400" />
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

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Нийт дүн:</span>
                <span className="text-primary-500">{formatPrice(selectedOrder.total)}</span>
              </div>
            </div>

            {/* Payment Ref */}
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
