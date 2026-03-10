'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  ArrowUp,
  ArrowDown,
  DollarSign,
  Eye,
  Loader2
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';

interface DashboardStats {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalProducts: number;
  totalUsers: number;
  usersChange: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
  payment_status: string;
  date: string;
}

interface TopProduct {
  _id: string;
  name: string;
  sold: number;
  revenue: number;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const statusLabels: Record<string, string> = {
  pending: 'Хүлээгдэж буй',
  confirmed: 'Баталгаажсан',
  processing: 'Бэлтгэж буй',
  shipped: 'Илгээсэн',
  delivered: 'Хүргэгдсэн',
  cancelled: 'Цуцлагдсан',
};

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
        setRecentOrders(data.recentOrders || []);
        setTopProducts(data.topProducts || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      label: 'Нийт орлого',
      value: stats?.totalRevenue || 0,
      change: stats?.revenueChange || 0,
      icon: DollarSign,
      format: 'currency' as const,
    },
    {
      label: 'Захиалга',
      value: stats?.totalOrders || 0,
      change: stats?.ordersChange || 0,
      icon: ShoppingCart,
      format: 'number' as const,
    },
    {
      label: 'Бүтээгдэхүүн',
      value: stats?.totalProducts || 0,
      change: 0,
      icon: Package,
      format: 'number' as const,
    },
    {
      label: 'Хэрэглэгч',
      value: stats?.totalUsers || 0,
      change: stats?.usersChange || 0,
      icon: Users,
      format: 'number' as const,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Хяналтын самбар</h1>
        <p className="text-gray-500 mt-1">Тавтай морил! Өнөөдрийн мэдээлэл.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.change >= 0;
          return (
            <div key={index} className="bg-white rounded-xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
                {stat.change !== 0 && (
                  <div className={`flex items-center gap-1 text-sm ${
                    isPositive ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {isPositive ? (
                      <ArrowUp className="w-4 h-4" />
                    ) : (
                      <ArrowDown className="w-4 h-4" />
                    )}
                    {Math.abs(stat.change)}%
                  </div>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">
                {stat.format === 'currency' 
                  ? formatPrice(stat.value)
                  : stat.value.toLocaleString()
                }
              </p>
              <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white rounded-xl card-shadow">
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-lg font-semibold">Сүүлийн захиалгууд</h2>
            <Link href="/admin/orders" className="text-primary-500 text-sm hover:underline">
              Бүгдийг харах
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Одоогоор захиалга байхгүй</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Дугаар
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Захиалагч
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Дүн
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Статус
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">
                      Огноо
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="font-mono text-primary-500">
                          {order.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                      <td className="px-6 py-4 font-medium">{formatPrice(order.total)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabels[order.status] || order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(order.date).toLocaleDateString('mn-MN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl card-shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Шилдэг бүтээгдэхүүн</h2>
          </div>
          {topProducts.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p>Одоогоор борлуулалт байхгүй</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {topProducts.map((product, index) => (
                <div key={product._id || index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sold} борлуулсан</p>
                    </div>
                  </div>
                  <p className="font-medium text-gray-900 text-sm">
                    {formatPrice(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          href="/admin/products/new"
          className="bg-white rounded-xl p-6 card-shadow hover:card-shadow-hover transition-shadow text-center"
        >
          <Package className="w-8 h-8 text-primary-500 mx-auto mb-3" />
          <p className="font-medium">Бараа нэмэх</p>
        </Link>
        <Link
          href="/admin/orders"
          className="bg-white rounded-xl p-6 card-shadow hover:card-shadow-hover transition-shadow text-center"
        >
          <ShoppingCart className="w-8 h-8 text-primary-500 mx-auto mb-3" />
          <p className="font-medium">Захиалга</p>
        </Link>
        <Link
          href="/admin/discounts/new"
          className="bg-white rounded-xl p-6 card-shadow hover:card-shadow-hover transition-shadow text-center"
        >
          <TrendingUp className="w-8 h-8 text-primary-500 mx-auto mb-3" />
          <p className="font-medium">Хямдрал нэмэх</p>
        </Link>
        <Link
          href="/admin/reports"
          className="bg-white rounded-xl p-6 card-shadow hover:card-shadow-hover transition-shadow text-center"
        >
          <Eye className="w-8 h-8 text-primary-500 mx-auto mb-3" />
          <p className="font-medium">Тайлан</p>
        </Link>
      </div>
    </div>
  );
}
