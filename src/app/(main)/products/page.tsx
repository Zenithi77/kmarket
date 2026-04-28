'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import {
  ProductGrid,
  FilterSidebar,
  DEFAULT_FILTER_STATE,
  type FilterState,
  type ApiCategory,
} from '@/components/product';
import { Product } from '@/types';

function mapProduct(p: any): Product {
  return {
    id: p._id || p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: p.price,
    sale_price: p.sale_price,
    sku: p.sku || '',
    brand: p.brand,
    weight: p.weight,
    category_id: typeof p.category_id === 'object' ? p.category_id._id : p.category_id,
    category:
      p.category_id && typeof p.category_id === 'object'
        ? {
            id: p.category_id._id,
            name: p.category_id.name,
            slug: p.category_id.slug,
            is_active: true,
            created_at: '',
          }
        : undefined,
    images: p.images || [],
    colors: p.colors || [],
    sizes: p.sizes || [],
    stock: p.stock ?? 0,
    is_active: p.is_active ?? true,
    is_featured: p.is_featured ?? false,
    rating: p.rating ?? 0,
    review_count: p.review_count ?? 0,
    created_at: p.created_at || '',
    updated_at: p.updated_at || '',
  };
}

const sortOptions = [
  { value: 'newest', label: 'Шинэ нь эхэнд' },
  { value: 'price_asc', label: 'Үнэ: Бага нь эхэнд' },
  { value: 'price_desc', label: 'Үнэ: Их нь эхэнд' },
  { value: 'popular', label: 'Эрэлттэй' },
  { value: 'rating', label: 'Үнэлгээ' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  const [filters, setFilters] = useState<FilterState>({
    ...DEFAULT_FILTER_STATE,
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
  });
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) setCategories(await res.json());
      } catch {}
    })();
  }, []);

  const selectedCategoryObj = categories.find((c) => c.slug === filters.category);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.category) params.set('category', filters.category);
      if (filters.subcategory) params.set('subcategory', filters.subcategory);
      if (filters.brand) params.set('brand', filters.brand);
      if (filters.color) params.set('color', filters.color);
      if (filters.size) params.set('size', filters.size);
      if (filters.priceRange[0] > 0) params.set('min_price', filters.priceRange[0].toString());
      if (filters.priceRange[1] < 5000000) params.set('max_price', filters.priceRange[1].toString());

      Object.entries(filters.attributes).forEach(([key, value]) => {
        if (value) params.set(`attr_${key}`, value);
      });

      switch (sortBy) {
        case 'price_asc':
          params.set('sort', 'price');
          params.set('order', 'asc');
          break;
        case 'price_desc':
          params.set('sort', 'price');
          params.set('order', 'desc');
          break;
        case 'popular':
          params.set('sort', 'review_count');
          params.set('order', 'desc');
          break;
        case 'rating':
          params.set('sort', 'rating');
          params.set('order', 'desc');
          break;
        default:
          params.set('sort', 'created_at');
          params.set('order', 'desc');
      }

      if (searchParams.get('featured') === 'true') params.set('featured', 'true');
      if (searchParams.get('new') === 'true') params.set('new', 'true');
      if (searchParams.get('sale') === 'true') params.set('sale', 'true');
      if (searchParams.get('search')) params.set('search', searchParams.get('search')!);

      params.set('limit', '40');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.products) setProducts(data.products.map(mapProduct));
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Active chips
  const chips: { key: string; label: string; onRemove: () => void; tone: string }[] = [];
  if (filters.category && selectedCategoryObj) {
    chips.push({
      key: 'cat',
      label: selectedCategoryObj.name,
      tone: 'from-orange-100 to-orange-50 text-orange-700 ring-orange-200',
      onRemove: () => setFilters({ ...filters, category: '', subcategory: '', attributes: {} }),
    });
  }
  if (filters.subcategory) {
    const sub = selectedCategoryObj?.subcategories?.find((s) => s.slug === filters.subcategory);
    if (sub)
      chips.push({
        key: 'sub',
        label: sub.name,
        tone: 'from-blue-100 to-blue-50 text-blue-700 ring-blue-200',
        onRemove: () => setFilters({ ...filters, subcategory: '' }),
      });
  }
  if (filters.color)
    chips.push({
      key: 'color',
      label: `Өнгө: ${filters.color}`,
      tone: 'from-pink-100 to-pink-50 text-pink-700 ring-pink-200',
      onRemove: () => setFilters({ ...filters, color: '' }),
    });
  if (filters.size)
    chips.push({
      key: 'size',
      label: `Хэмжээ: ${filters.size}`,
      tone: 'from-gray-100 to-gray-50 text-gray-700 ring-gray-200',
      onRemove: () => setFilters({ ...filters, size: '' }),
    });
  if (filters.brand)
    chips.push({
      key: 'brand',
      label: filters.brand,
      tone: 'from-green-100 to-green-50 text-green-700 ring-green-200',
      onRemove: () => setFilters({ ...filters, brand: '' }),
    });
  Object.entries(filters.attributes).forEach(([k, v]) => {
    chips.push({
      key: `attr-${k}`,
      label: v,
      tone: 'from-purple-100 to-purple-50 text-purple-700 ring-purple-200',
      onRemove: () => {
        const next = { ...filters.attributes };
        delete next[k];
        setFilters({ ...filters, attributes: next });
      },
    });
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="relative overflow-hidden bg-white border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 via-transparent to-pink-50/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-orange-700 bg-clip-text text-transparent">
            Бүтээгдэхүүн
          </h1>
          <p className="text-gray-500 mt-2 flex items-center flex-wrap gap-2">
            <span>{products.length} бүтээгдэхүүн олдлоо</span>
            {filters.category && selectedCategoryObj && (
              <span className="px-2.5 py-0.5 bg-orange-100 text-orange-700 text-sm rounded-full font-medium">
                {selectedCategoryObj.name}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
                <FilterSidebar
                  state={filters}
                  onChange={setFilters}
                  categories={categories}
                  products={products}
                />
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-5 gap-3">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all active:scale-95"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="font-medium text-sm">Шүүлтүүр</span>
                {chips.length > 0 && (
                  <span className="w-5 h-5 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                    {chips.length}
                  </span>
                )}
              </button>

              <div className="relative ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-medium hover:border-orange-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all cursor-pointer"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <AnimatePresence initial={false}>
              {chips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-wrap gap-2 mb-5">
                    <AnimatePresence initial={false}>
                      {chips.map((chip) => (
                        <motion.span
                          key={chip.key}
                          layout
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.18 }}
                          className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 bg-gradient-to-r text-sm rounded-full ring-1 ${chip.tone}`}
                        >
                          {chip.label}
                          <button
                            onClick={chip.onRemove}
                            className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white/60 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.span>
                      ))}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <ProductGrid products={products} loading={loading} columns={3} />
          </main>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            onClick={() => setShowFilters(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-white overflow-y-auto"
            >
              <div className="sticky top-0 bg-white/90 backdrop-blur border-b px-5 py-4 flex items-center justify-between z-10">
                <h2 className="font-bold text-gray-900">Шүүлтүүр</h2>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-5">
                <FilterSidebar
                  state={filters}
                  onChange={setFilters}
                  categories={categories}
                  products={products}
                />
                <div className="pt-5 mt-4 border-t">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
                  >
                    Хэрэглэх ({products.length} бараа)
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
