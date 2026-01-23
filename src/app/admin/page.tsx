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
  Clock
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';

// Mock data for dashboard
const stats = [
  {
    label: 'Нийт орлого',
    value: 45680000,
    change: 12.5,
    isPositive: true,
    icon: DollarSign,
    format: 'currency'
  },
  {
    label: 'Захиалга',
    value: 156,
    change: 8.2,
    isPositive: true,
    icon: ShoppingCart,
    format: 'number'
  },
  {
    label: 'Бүтээгдэхүүн',
    value: 324,
    change: 3.1,
    isPositive: true,
    icon: Package,
    format: 'number'
  },
  {
    label: 'Хэрэглэгч',
    value: 1250,
    change: 15.3,
    isPositive: true,
    icon: Users,
    format: 'number'
  }
];

const recentOrders = [
  { id: 'KM-ABC12', customer: 'Батболд', total: 450000, status: 'Pending', date: '2024-01-15' },
  { id: 'KM-DEF34', customer: 'Сарнай', total: 780000, status: 'Paid', date: '2024-01-15' },
  { id: 'KM-GHI56', customer: 'Тэмүүжин', total: 320000, status: 'Processing', date: '2024-01-14' },
  { id: 'KM-JKL78', customer: 'Болормаа', total: 1250000, status: 'Shipped', date: '2024-01-14' },
  { id: 'KM-MNO90', customer: 'Ганболд', total: 560000, status: 'Delivered', date: '2024-01-13' },
];

const topProducts = [
  { name: 'Dyson Airwrap', sold: 45, revenue: 99000000 },
  { name: 'Nike Air Force 1', sold: 89, revenue: 40050000 },
  { name: 'MAC Lipstick Ruby Woo', sold: 156, revenue: 14820000 },
  { name: 'Adidas Ultraboost', sold: 67, revenue: 30150000 },
];

const statusColors: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-green-100 text-green-700',
  Processing: 'bg-blue-100 text-blue-700',
  Shipped: 'bg-purple-100 text-purple-700',
  Delivered: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700'
};

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Хяналтын самбар</h1>
        <p className="text-gray-500 mt-1">Тавтай морил! Өнөөдрийн мэдээлэл.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl p-6 card-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary-500" />
                </div>
                <div className={`flex items-center gap-1 text-sm ${
                  stat.isPositive ? 'text-green-500' : 'text-red-500'
                }`}>
                  {stat.isPositive ? (
                    <ArrowUp className="w-4 h-4" />
                  ) : (
                    <ArrowDown className="w-4 h-4" />
                  )}
                  {stat.change}%
                </div>
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
                      <Link href={`/admin/orders/${order.id}`} className="font-mono text-primary-500 hover:underline">
                        {order.id}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{order.customer}</td>
                    <td className="px-6 py-4 font-medium">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl card-shadow">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Шилдэг бүтээгдэхүүн</h2>
          </div>
          <div className="p-6 space-y-4">
            {topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-bold text-gray-500">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.sold} борлуулсан</p>
                  </div>
                </div>
                <p className="font-medium text-gray-900">
                  {formatPrice(product.revenue)}
                </p>
              </div>
            ))}
          </div>
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
