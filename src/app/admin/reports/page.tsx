'use client';

import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { Button } from '@/components/ui';

// Mock data
const summaryData = {
  revenue: { value: 45680000, change: 12.5, isPositive: true },
  orders: { value: 156, change: 8.2, isPositive: true },
  products: { value: 324, change: 3.1, isPositive: true },
  customers: { value: 1250, change: 15.3, isPositive: true }
};

const monthlyData = [
  { month: '1-р сар', revenue: 38500000, orders: 128 },
  { month: '2-р сар', revenue: 42300000, orders: 145 },
  { month: '3-р сар', revenue: 45680000, orders: 156 },
];

const topCategories = [
  { name: 'Гоо сайхан', revenue: 15680000, percentage: 34 },
  { name: 'Гутал', revenue: 12450000, percentage: 27 },
  { name: 'Хувцас', revenue: 9870000, percentage: 22 },
  { name: 'Dyson', revenue: 7680000, percentage: 17 },
];

const topProducts = [
  { name: 'Dyson Airwrap Complete', sold: 45, revenue: 99000000 },
  { name: 'Nike Air Force 1', sold: 89, revenue: 40050000 },
  { name: 'MAC Lipstick Ruby Woo', sold: 156, revenue: 14820000 },
  { name: 'Adidas Ultraboost', sold: 67, revenue: 30150000 },
  { name: 'Zara Blazer', sold: 52, revenue: 19760000 },
];

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const exportReport = (type: 'pdf' | 'excel') => {
    console.log('Export as', type);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тайлан</h1>
          <p className="text-gray-500 mt-1">Борлуулалт болон статистик мэдээлэл</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportReport('excel')}>
            <Download className="w-4 h-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => exportReport('pdf')}>
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl card-shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['week', 'month', 'quarter', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-white shadow text-gray-900'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range === 'week' ? '7 хоног' :
                 range === 'month' ? 'Сар' :
                 range === 'quarter' ? 'Улирал' : 'Жил'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-500" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              summaryData.revenue.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {summaryData.revenue.isPositive ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {summaryData.revenue.change}%
            </div>
          </div>
          <p className="text-2xl font-bold">{formatPrice(summaryData.revenue.value)}</p>
          <p className="text-gray-500 text-sm mt-1">Нийт орлого</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-500" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              summaryData.orders.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {summaryData.orders.isPositive ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {summaryData.orders.change}%
            </div>
          </div>
          <p className="text-2xl font-bold">{summaryData.orders.value}</p>
          <p className="text-gray-500 text-sm mt-1">Захиалга</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-purple-500" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              summaryData.products.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {summaryData.products.isPositive ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {summaryData.products.change}%
            </div>
          </div>
          <p className="text-2xl font-bold">{summaryData.products.value}</p>
          <p className="text-gray-500 text-sm mt-1">Бүтээгдэхүүн</p>
        </div>

        <div className="bg-white rounded-xl p-6 card-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-primary-500" />
            </div>
            <div className={`flex items-center gap-1 text-sm ${
              summaryData.customers.isPositive ? 'text-green-500' : 'text-red-500'
            }`}>
              {summaryData.customers.isPositive ? (
                <ArrowUp className="w-4 h-4" />
              ) : (
                <ArrowDown className="w-4 h-4" />
              )}
              {summaryData.customers.change}%
            </div>
          </div>
          <p className="text-2xl font-bold">{summaryData.customers.value}</p>
          <p className="text-gray-500 text-sm mt-1">Хэрэглэгч</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white rounded-xl card-shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Сарын орлого</h2>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="w-20 text-sm text-gray-500">{data.month}</div>
                <div className="flex-1 h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full"
                    style={{ width: `${(data.revenue / 50000000) * 100}%` }}
                  />
                </div>
                <div className="w-28 text-right">
                  <p className="font-medium">{formatPrice(data.revenue)}</p>
                  <p className="text-xs text-gray-500">{data.orders} захиалга</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl card-shadow p-6">
          <h2 className="text-lg font-semibold mb-6">Категорийн хуваарилалт</h2>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{category.name}</span>
                  <span className="text-sm text-gray-500">{category.percentage}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Шилдэг бүтээгдэхүүнүүд</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">#</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Бүтээгдэхүүн</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Борлуулсан</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Орлого</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.map((product, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-gray-50 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-gray-600">{product.sold} ширхэг</td>
                  <td className="px-6 py-4 font-medium text-primary-500">{formatPrice(product.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
