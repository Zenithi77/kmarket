'use client';

import { useState, useEffect } from 'react';
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  Phone,
  Truck,
  RefreshCw
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/constants';
import { Modal } from '@/components/ui';

interface OrderItem {
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
}

interface Order {
  _id: string;
  order_number: string;
  user_id?: {
    _id: string;
    email: string;
    full_name: string;
    phone?: string;
  };
  items: OrderItem[];
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  final_amount: number;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district: string;
  status: string;
  payment_status: string;
  notes?: string;
  created_at: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

const statusLabels: Record<string, string> = {
  pending: 'Хүлээгдэж байна',
  confirmed: 'Баталгаажсан',
  processing: 'Бэлтгэж байна',
  shipped: 'Хүргэлтэнд гарсан',
  delivered: 'Хүргэгдсэн',
  cancelled: 'Цуцлагдсан'
};

const paymentStatusLabels: Record<string, string> = {
  pending: 'Төлөгдөөгүй',
  paid: 'Төлсөн',
  failed: 'Амжилтгүй',
  refunded: 'Буцаагдсан'
};

const allStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      });
      if (selectedStatus !== 'all') {
        params.append('status', selectedStatus);
      }

      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();

      if (res.ok) {
        setOrders(data.orders || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalOrders(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, selectedStatus]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.order_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.shipping_phone.includes(searchQuery);
    return matchesSearch;
  });

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      setUpdating(true);
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Update local state
        setOrders(prev => prev.map(order =>
          order._id === orderId ? { ...order, status: newStatus } : order
        ));
        if (selectedOrder?._id === orderId) {
          setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch (error) {
      console.error('Failed to update order:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Захиалгууд</h1>
          <p className="text-gray-500 mt-1">Нийт {totalOrders} захиалга</p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Шинэчлэх
        </button>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => { setSelectedStatus('all'); setCurrentPage(1); }}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedStatus === 'all'
              ? 'bg-primary-500 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-50'
          }`}
        >
          Бүгд
        </button>
        {allStatuses.map(status => (
          <button
            key={status}
            onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedStatus === status
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {statusLabels[status]}
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
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>Захиалга олдсонгүй</p>
          </div>
        ) : (
          <>
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
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono font-medium text-primary-500">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{order.shipping_name}</p>
                        <p className="text-sm text-gray-500">{order.shipping_phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-900">
                          {order.items.length} бараа
                        </p>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatPrice(order.final_amount)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {formatDate(order.created_at)}
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
                Хуудас {currentPage} / {totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium">
                  {currentPage}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Захиалга ${selectedOrder?.order_number}`}
        size="lg"
      >
        {selectedOrder && (
          <div className="space-y-6">
            {/* Status Update */}
            <div className="flex items-center justify-between">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[selectedOrder.status] || 'bg-gray-100 text-gray-700'}`}>
                {statusLabels[selectedOrder.status] || selectedOrder.status}
              </span>
              <select
                value={selectedOrder.status}
                onChange={(e) => updateOrderStatus(selectedOrder._id, e.target.value)}
                disabled={updating}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 outline-none text-sm disabled:opacity-50"
              >
                {allStatuses.map(status => (
                  <option key={status} value={status}>{statusLabels[status]}</option>
                ))}
              </select>
            </div>

            {/* Payment Status */}
            <div className="bg-gray-50 rounded-lg p-3">
              <span className="text-sm text-gray-500">Төлбөрийн төлөв: </span>
              <span className="font-medium">
                {paymentStatusLabels[selectedOrder.payment_status] || selectedOrder.payment_status}
              </span>
            </div>

            {/* Customer Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Захиалагчийн мэдээлэл</h3>
              <div className="space-y-2 text-sm">
                <p className="flex items-center gap-2">
                  <span className="text-gray-500">Нэр:</span>
                  <span className="font-medium">{selectedOrder.shipping_name}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span>{selectedOrder.shipping_phone}</span>
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span>{selectedOrder.shipping_address}</span>
                </p>
                <p className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span>{selectedOrder.shipping_city}, {selectedOrder.shipping_district}</span>
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
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="w-5 h-5 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          x{item.quantity} {item.size && `• ${item.size}`}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Барааны дүн:</span>
                <span>{formatPrice(selectedOrder.total_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Хүргэлт:</span>
                <span>{formatPrice(selectedOrder.shipping_fee)}</span>
              </div>
              {selectedOrder.discount_amount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Хөнгөлөлт:</span>
                  <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Нийт дүн:</span>
                <span className="text-primary-500">{formatPrice(selectedOrder.final_amount)}</span>
              </div>
            </div>

            {/* Notes */}
            {selectedOrder.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Тэмдэглэл:</strong> {selectedOrder.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
