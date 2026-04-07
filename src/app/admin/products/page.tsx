'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Package,
  Loader2,
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { Button, Modal } from '@/components/ui';
import toast from 'react-hot-toast';

interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  stock: number;
  is_active: boolean;
  images: string[];
  category_id?: { _id: string; name: string; slug: string };
  subcategory_id?: { _id: string; name: string; slug: string };
  brand?: string;
}

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [deleteModal, setDeleteModal] = useState<Product | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 20;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(limit));
      if (searchQuery) params.set('search', searchQuery);
      if (selectedCategory) params.set('category', selectedCategory);

      const res = await fetch(`/api/products?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch {
      toast.error('Бараа ачаалахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch {}
    };
    fetchCategories();
  }, []);

  const handleDelete = async () => {
    if (!deleteModal) return;
    try {
      const res = await fetch(`/api/products/${deleteModal._id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Бараа устгагдлаа');
        fetchProducts();
      } else {
        toast.error('Устгахад алдаа гарлаа');
      }
    } catch {
      toast.error('Алдаа гарлаа');
    }
    setDeleteModal(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchProducts();
  };

  const getStatusBadge = (product: Product) => {
    if (product.stock === 0) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Дууссан</span>;
    }
    if (!product.is_active) {
      return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Идэвхгүй</span>;
    }
    return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">Идэвхтэй</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Бүтээгдэхүүн</h1>
          <p className="text-gray-500 mt-1">Нийт {totalCount} бүтээгдэхүүн</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Бараа нэмэх
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl card-shadow p-4">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Бараа хайх..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
          >
            <option value="">Бүх категори</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>

          <Button type="submit">
            <Search className="w-4 h-4 mr-1" />
            Хайх
          </Button>
        </form>
      </div>

      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Бараа олдсонгүй</h3>
            <p className="text-gray-500 mb-4">Одоогоор бараа бүртгэгдээгүй байна. Шинэ бараа нэмнэ үү.</p>
            <Link href="/admin/products/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Бараа нэмэх
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Бүтээгдэхүүн</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Ангилал</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Үнэ</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Нөөц</th>
                  <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                          {product.images?.[0] ? (
                            <Image src={product.images[0]} alt={product.name} width={48} height={48} className="object-cover w-full h-full" />
                          ) : (
                            <Package className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 line-clamp-1">{product.name}</p>
                          <p className="text-xs text-gray-400">{product.brand || product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-gray-700">{product.category_id?.name || '-'}</p>
                        {product.subcategory_id && (
                          <p className="text-xs text-gray-400">{product.subcategory_id.name}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium">{formatPrice(product.price)}</p>
                      {product.sale_price && product.sale_price > product.price && (
                        <p className="text-sm text-gray-400 line-through">{formatPrice(product.sale_price)}</p>
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
                      {getStatusBadge(product)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/product/${product.slug}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Eye className="w-4 h-4 text-gray-500" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal(product)}
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
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <p className="text-sm text-gray-500">
              {(currentPage - 1) * limit + 1}-{Math.min(currentPage * limit, totalCount)} / {totalCount}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                      currentPage === page ? 'bg-orange-500 text-white' : 'hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Бараа устгах">
        {deleteModal && (
          <div className="space-y-4">
            <p className="text-gray-600">
              <strong>{deleteModal.name}</strong> барааг устгахдаа итгэлтэй байна уу?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteModal(null)}>Болих</Button>
              <Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Устгах</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
