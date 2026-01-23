'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

// Mock products data
const mockProducts = [
  {
    id: '1',
    name: 'Dyson Airwrap Complete',
    slug: 'dyson-airwrap-complete',
    category: 'Dyson',
    price: 2200000,
    originalPrice: 2500000,
    stock: 15,
    status: 'Active',
    image: '/products/dyson-airwrap.jpg'
  },
  {
    id: '2',
    name: 'Nike Air Force 1 07',
    slug: 'nike-air-force-1-07',
    category: 'Гутал',
    price: 450000,
    originalPrice: null,
    stock: 42,
    status: 'Active',
    image: '/products/nike-af1.jpg'
  },
  {
    id: '3',
    name: 'MAC Matte Lipstick - Ruby Woo',
    slug: 'mac-lipstick-ruby-woo',
    category: 'Гоо сайхан',
    price: 95000,
    originalPrice: 120000,
    stock: 0,
    status: 'Out of Stock',
    image: '/products/mac-lipstick.jpg'
  },
  {
    id: '4',
    name: 'Adidas Ultraboost 22',
    slug: 'adidas-ultraboost-22',
    category: 'Гутал',
    price: 450000,
    originalPrice: 520000,
    stock: 28,
    status: 'Active',
    image: '/products/adidas-ultraboost.jpg'
  },
  {
    id: '5',
    name: 'Zara Oversized Blazer',
    slug: 'zara-oversized-blazer',
    category: 'Хувцас',
    price: 380000,
    originalPrice: null,
    stock: 12,
    status: 'Active',
    image: '/products/zara-blazer.jpg'
  }
];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [deleteModal, setDeleteModal] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ['all', 'Гоо сайхан', 'Хувцас', 'Гутал', 'Dyson', 'Trend'];
  const statuses = ['all', 'Active', 'Out of Stock', 'Draft'];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleDelete = (id: string) => {
    // Delete logic here
    console.log('Delete product:', id);
    setDeleteModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бүтээгдэхүүн</h1>
          <p className="text-gray-500 mt-1">Нийт {mockProducts.length} бүтээгдэхүүн</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Бараа нэмэх
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl card-shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Бараа хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          >
            <option value="all">Бүх категори</option>
            {categories.slice(1).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          >
            <option value="all">Бүх статус</option>
            <option value="Active">Идэвхтэй</option>
            <option value="Out of Stock">Дууссан</option>
            <option value="Draft">Ноорог</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Бүтээгдэхүүн
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Категори
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Үнэ
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Нөөц
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Статус
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{product.category}</td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{formatPrice(product.price)}</p>
                    {product.originalPrice && (
                      <p className="text-sm text-gray-400 line-through">
                        {formatPrice(product.originalPrice)}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${
                      product.stock === 0 ? 'text-red-500' : 
                      product.stock < 10 ? 'text-yellow-500' : 'text-green-500'
                    }`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.status === 'Active' 
                        ? 'bg-green-100 text-green-700'
                        : product.status === 'Out of Stock'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {product.status === 'Active' ? 'Идэвхтэй' : 
                       product.status === 'Out of Stock' ? 'Дууссан' : 'Ноорог'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/product/${product.slug}`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-500" />
                      </Link>
                      <Link
                        href={`/admin/products/${product.id}/edit`}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4 text-gray-500" />
                      </Link>
                      <button
                        onClick={() => setDeleteModal(product.id)}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
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
            1-5 / {filteredProducts.length} бараа
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage === 1}
              className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium">
              1
            </span>
            <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium">
              2
            </button>
            <button className="px-4 py-2 hover:bg-gray-100 rounded-lg text-sm font-medium">
              3
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Бараа устгах"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Та энэ барааг устгахдаа итгэлтэй байна уу? Энэ үйлдлийг буцаах боломжгүй.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteModal(null)}>
              Болих
            </Button>
            <Button 
              onClick={() => handleDelete(deleteModal!)}
              className="bg-red-500 hover:bg-red-600"
            >
              Устгах
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
