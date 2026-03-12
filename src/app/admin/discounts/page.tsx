'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Percent,
  Tag,
  Package,
  Save,
  X,
  Check,
  BadgeDollarSign,
  Undo2,
} from 'lucide-react';
import { formatPrice } from '@/lib/constants';
import { Button, LoadingSpinner } from '@/components/ui';

interface ProductDiscount {
  _id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number | null;
  images: string[];
  stock: number;
  brand?: string;
  category_id?: {
    _id: string;
    name: string;
    slug: string;
  };
}

interface Stats {
  total: number;
  onSale: number;
  noSale: number;
}

type FilterType = 'all' | 'on_sale' | 'no_sale';

export default function DiscountsPage() {
  const [products, setProducts] = useState<ProductDiscount[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, onSale: 0, noSale: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [changes, setChanges] = useState<Record<string, number | null>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filter !== 'all') params.set('filter', filter);

      const res = await fetch(`/api/admin/discounts?${params.toString()}`);
      const data = await res.json();

      if (data.products) {
        setProducts(data.products);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [search, filter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(debounce);
  }, [fetchProducts]);

  const setSalePrice = (productId: string, value: string) => {
    const numValue = value === '' ? null : parseInt(value);
    setChanges(prev => ({
      ...prev,
      [productId]: numValue,
    }));
  };

  const removeSalePrice = (productId: string) => {
    setChanges(prev => ({
      ...prev,
      [productId]: null,
    }));
  };

  const undoChange = (productId: string) => {
    setChanges(prev => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const getDisplaySalePrice = (product: ProductDiscount): number | null => {
    if (product._id in changes) {
      return changes[product._id];
    }
    return product.sale_price ?? null;
  };

  const hasChanges = Object.keys(changes).length > 0;

  const getDiscountPercent = (price: number, salePrice: number | null): number => {
    if (!salePrice || salePrice <= 0 || salePrice >= price) return 0;
    return Math.round(((price - salePrice) / price) * 100);
  };

  const handleSaveAll = async () => {
    if (!hasChanges) return;

    try {
      setSaving(true);
      const updates = Object.entries(changes).map(([productId, salePrice]) => ({
        productId,
        salePrice,
      }));

      const res = await fetch('/api/admin/discounts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updates }),
      });

      const data = await res.json();

      if (res.ok) {
        setChanges({});
        setSuccessMessage(`${data.modified} бүтээгдэхүүний хямдрал шинэчлэгдлээ`);
        setTimeout(() => setSuccessMessage(''), 3000);
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving discounts:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in-up">
          <Check className="w-5 h-5" />
          {successMessage}
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Хямдрал удирдах</h1>
          <p className="text-gray-500 mt-1">Бүтээгдэхүүнүүдийн хямдралын үнийг тохируулах</p>
        </div>
        {hasChanges && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-amber-600 font-medium">
              {Object.keys(changes).length} өөрчлөлт хадгалаагүй
            </span>
            <Button
              variant="outline"
              onClick={() => setChanges({})}
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Буцаах
            </Button>
            <Button onClick={handleSaveAll} disabled={saving}>
              {saving ? (
                <LoadingSpinner />
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Хадгалах
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Нийт бараа</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <BadgeDollarSign className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Хямдралтай</p>
              <p className="text-xl font-bold text-red-600">{stats.onSale}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl card-shadow p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Хямдралгүй</p>
              <p className="text-xl font-bold text-gray-900">{stats.noSale}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl card-shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Бараа хайх..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
            />
          </div>
          <div className="flex gap-2">
            {(['all', 'on_sale', 'no_sale'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filter === f
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {f === 'all' ? 'Бүгд' : f === 'on_sale' ? 'Хямдралтай' : 'Хямдралгүй'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <LoadingSpinner />
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl card-shadow p-12 text-center">
          <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Бараа олдсонгүй</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl card-shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Бараа</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Ангилал</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Үнэ</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-48">Хямдралын үнэ</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-32">Хувь %</th>
                  <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase w-24">Үйлдэл</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => {
                  const currentSalePrice = getDisplaySalePrice(product);
                  const discountPct = getDiscountPercent(product.price, currentSalePrice);
                  const isChanged = product._id in changes;
                  const hasDiscount = currentSalePrice !== null && currentSalePrice > 0 && currentSalePrice < product.price;

                  return (
                    <tr
                      key={product._id}
                      className={`hover:bg-gray-50 transition-colors ${
                        isChanged ? 'bg-amber-50' : ''
                      }`}
                    >
                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate max-w-[200px]">
                              {product.name}
                            </p>
                            {product.brand && (
                              <p className="text-xs text-gray-400">{product.brand}</p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {product.category_id?.name || '-'}
                        </span>
                      </td>

                      {/* Original Price */}
                      <td className="px-6 py-4 text-right">
                        <span className={`font-medium ${hasDiscount ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                          {formatPrice(product.price)}
                        </span>
                      </td>

                      {/* Sale Price Input */}
                      <td className="px-6 py-4 text-right">
                        <input
                          type="number"
                          placeholder="Хямдралын үнэ"
                          value={
                            product._id in changes
                              ? (changes[product._id] ?? '')
                              : (product.sale_price ?? '')
                          }
                          onChange={(e) => setSalePrice(product._id, e.target.value)}
                          className={`w-full max-w-[160px] px-3 py-1.5 text-right rounded-lg border text-sm ${
                            isChanged
                              ? 'border-amber-400 bg-amber-50'
                              : hasDiscount
                              ? 'border-red-200 bg-red-50'
                              : 'border-gray-200'
                          } focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none`}
                          min={0}
                          max={product.price - 1}
                        />
                      </td>

                      {/* Discount Percent */}
                      <td className="px-6 py-4 text-right">
                        {hasDiscount ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-bold">
                            <Percent className="w-3 h-3" />
                            {discountPct}%
                          </span>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {isChanged && (
                            <button
                              onClick={() => undoChange(product._id)}
                              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Буцаах"
                            >
                              <Undo2 className="w-4 h-4 text-gray-500" />
                            </button>
                          )}
                          {(hasDiscount || (product.sale_price && product.sale_price > 0)) && (
                            <button
                              onClick={() => removeSalePrice(product._id)}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                              title="Хямдрал арилгах"
                            >
                              <X className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Quick Discount Actions */}
          <div className="border-t px-6 py-4 bg-gray-50">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="font-medium">Түргэн хямдрал:</span>
              {[10, 20, 30, 50].map((pct) => (
                <button
                  key={pct}
                  onClick={() => {
                    const newChanges: Record<string, number | null> = { ...changes };
                    products.forEach((p) => {
                      if (!p.sale_price && !(p._id in changes)) {
                        newChanges[p._id] = Math.round(p.price * (1 - pct / 100));
                      }
                    });
                    setChanges(newChanges);
                  }}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-lg hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 transition-colors font-medium"
                >
                  -{pct}%
                </button>
              ))}
              <button
                onClick={() => {
                  const newChanges: Record<string, number | null> = { ...changes };
                  products.forEach((p) => {
                    if (p.sale_price || p._id in changes) {
                      newChanges[p._id] = null;
                    }
                  });
                  setChanges(newChanges);
                }}
                className="px-3 py-1 bg-white border border-red-200 rounded-lg hover:bg-red-50 text-red-500 transition-colors font-medium"
              >
                Бүгдийг арилгах
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Save Bar */}
      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-bold text-amber-600">{Object.keys(changes).length}</span> бүтээгдэхүүний хямдрал өөрчлөгдсөн
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setChanges({})}>
                Буцаах
              </Button>
              <Button onClick={handleSaveAll} disabled={saving}>
                {saving ? (
                  <LoadingSpinner />
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Бүгдийг хадгалах
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
