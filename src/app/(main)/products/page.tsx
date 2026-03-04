'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { ProductGrid } from '@/components/product';
import { Product } from '@/types';
import { CATEGORIES, BRANDS, SIZES } from '@/lib/constants';

// Helper to map API response (_id) to frontend Product type (id)
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
    category: p.category_id && typeof p.category_id === 'object' ? { id: p.category_id._id, name: p.category_id.name, slug: p.category_id.slug, is_active: true, created_at: '' } : undefined,
    images: p.images || [],
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
  { value: 'price_asc', label: 'Үнэ: Багаас их' },
  { value: 'price_desc', label: 'Үнэ: Ихээс бага' },
  { value: 'popular', label: 'Эрэлттэй' },
  { value: 'rating', label: 'Үнэлгээ' },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || '');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [sortBy, setSortBy] = useState('newest');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedBrand) params.set('brand', selectedBrand);
      if (priceRange[0] > 0) params.set('min_price', priceRange[0].toString());
      if (priceRange[1] < 5000000) params.set('max_price', priceRange[1].toString());
      
      // Map sort options to API params
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

      // Check URL search params for special filters
      if (searchParams.get('featured') === 'true') params.set('featured', 'true');
      if (searchParams.get('new') === 'true') params.set('new', 'true');
      if (searchParams.get('sale') === 'true') params.set('sale', 'true');
      if (searchParams.get('search')) params.set('search', searchParams.get('search')!);

      params.set('limit', '40');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (data.products) {
        let mapped = data.products.map(mapProduct);
        
        // Client-side size filter (API doesn't support it)
        if (selectedSize) {
          mapped = mapped.filter((p: Product) => p.sizes.includes(selectedSize));
        }
        
        setProducts(mapped);
        setTotalProducts(data.pagination?.total || mapped.length);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedBrand, selectedSize, priceRange, sortBy, searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedBrand('');
    setSelectedSize('');
    setPriceRange([0, 5000000]);
    setSortBy('newest');
  };

  const hasActiveFilters = selectedCategory || selectedBrand || selectedSize || priceRange[0] > 0 || priceRange[1] < 5000000;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Бүтээгдэхүүн</h1>
          <p className="text-gray-500 mt-2">{products.length} бүтээгдэхүүн олдлоо</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 card-shadow sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-semibold text-gray-900">Шүүлтүүр</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-500 hover:text-primary-600"
                  >
                    Цэвэрлэх
                  </button>
                )}
              </div>

              {/* Categories */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Категори</h3>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                        className="w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Брэнд</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {BRANDS.map((brand) => (
                    <label key={brand} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === brand}
                        onChange={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                        className="w-4 h-4 text-primary-500 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Sizes */}
              <div className="mb-6">
                <h3 className="font-medium text-gray-900 mb-3">Размер</h3>
                <div className="flex flex-wrap gap-2">
                  {SIZES.slice(0, 10).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(selectedSize === size ? '' : size)}
                      className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                        selectedSize === size
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Үнийн хязгаар</h3>
                <div className="space-y-3">
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="50000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>₮0</span>
                    <span>₮{priceRange[1].toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Mobile Filter Button & Sort */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg border card-shadow"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Шүүлтүүр
                {hasActiveFilters && (
                  <span className="w-5 h-5 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center">
                    !
                  </span>
                )}
              </button>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:border-primary-500"
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

            {/* Product Grid */}
            <ProductGrid products={products} loading={loading} columns={3} />
          </main>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white overflow-y-auto animate-slide-left">
            <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between">
              <h2 className="font-semibold">Шүүлтүүр</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {/* Same filter content as desktop */}
              {/* Categories */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Категори</h3>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label key={cat.id} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category-mobile"
                        checked={selectedCategory === cat.id}
                        onChange={() => setSelectedCategory(selectedCategory === cat.id ? '' : cat.id)}
                        className="w-4 h-4 text-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Brands */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Брэнд</h3>
                <div className="space-y-2">
                  {BRANDS.map((brand) => (
                    <label key={brand} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="brand-mobile"
                        checked={selectedBrand === brand}
                        onChange={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                        className="w-4 h-4 text-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">{brand}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Apply Button */}
              <div className="pt-4 border-t">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full btn-primary"
                >
                  Хэрэглэх ({products.length} бараа)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
