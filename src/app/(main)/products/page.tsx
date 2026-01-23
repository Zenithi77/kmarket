'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { ProductGrid } from '@/components/product';
import { Product } from '@/types';
import { CATEGORIES, BRANDS, SIZES } from '@/lib/constants';

// Mock products (same as home page for demo)
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Dyson Airwrap Complete Long',
    slug: 'dyson-airwrap-complete-long',
    description: 'Олон төрлийн үсний загвар хийх боломжтой Dyson Airwrap',
    price: 2500000,
    sale_price: 2200000,
    sku: 'DYS-001',
    brand: 'Dyson',
    weight: 500,
    category_id: 'dyson',
    images: ['https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=400'],
    sizes: [],
    stock: 10,
    is_active: true,
    is_featured: true,
    rating: 4.8,
    review_count: 124,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Nike Air Force 1 White',
    slug: 'nike-air-force-1-white',
    description: 'Классик Nike Air Force 1 цагаан өнгө',
    price: 450000,
    sku: 'NIKE-001',
    brand: 'Nike',
    weight: 400,
    category_id: 'shoes',
    images: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
    sizes: ['38', '39', '40', '41', '42', '43', '44'],
    stock: 25,
    is_active: true,
    is_featured: true,
    rating: 4.9,
    review_count: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Зуны загварлаг даашинз',
    slug: 'summer-fashion-dress',
    description: 'Зуны улирлын загварлаг даашинз',
    price: 180000,
    sale_price: 129000,
    sku: 'DRESS-001',
    brand: 'Zara',
    weight: 200,
    category_id: 'fashion',
    images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 15,
    is_active: true,
    is_featured: false,
    rating: 4.5,
    review_count: 45,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'MAC Lipstick Ruby Woo',
    slug: 'mac-lipstick-ruby-woo',
    description: 'MAC-ийн хамгийн алдартай улаан уруулын будаг',
    price: 95000,
    sku: 'MAC-001',
    brand: 'MAC',
    weight: 50,
    category_id: 'beauty',
    images: ['https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'],
    sizes: [],
    stock: 50,
    is_active: true,
    is_featured: true,
    rating: 4.7,
    review_count: 234,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Adidas Ultraboost 22',
    slug: 'adidas-ultraboost-22',
    description: 'Гүйлтийн хамгийн тав тухтай пүүз',
    price: 520000,
    sale_price: 450000,
    sku: 'ADI-001',
    brand: 'Adidas',
    weight: 350,
    category_id: 'shoes',
    images: ['https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400'],
    sizes: ['39', '40', '41', '42', '43', '44', '45'],
    stock: 20,
    is_active: true,
    is_featured: true,
    rating: 4.6,
    review_count: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Дулаан цамц Oversize',
    slug: 'warm-oversize-hoodie',
    description: 'Өвлийн улиралд тохирсон дулаан oversize цамц',
    price: 150000,
    sku: 'HOOD-001',
    brand: 'H&M',
    weight: 400,
    category_id: 'fashion',
    images: ['https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400'],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 30,
    is_active: true,
    is_featured: false,
    rating: 4.4,
    review_count: 67,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Charlotte Tilbury Pillow Talk',
    slug: 'charlotte-tilbury-pillow-talk',
    description: 'Алдартай Pillow Talk өнгө уруулын будаг',
    price: 120000,
    sku: 'CT-001',
    brand: 'Charlotte Tilbury',
    weight: 50,
    category_id: 'beauty',
    images: ['https://images.unsplash.com/photo-1631214503567-1e75fba3d673?w=400'],
    sizes: [],
    stock: 40,
    is_active: true,
    is_featured: true,
    rating: 4.9,
    review_count: 189,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Dyson V15 Detect',
    slug: 'dyson-v15-detect',
    description: 'Лазер технологитой тоос сорогч',
    price: 3500000,
    sale_price: 3200000,
    sku: 'DYS-002',
    brand: 'Dyson',
    weight: 3000,
    category_id: 'dyson',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    sizes: [],
    stock: 8,
    is_active: true,
    is_featured: true,
    rating: 4.8,
    review_count: 76,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const sortOptions = [
  { value: 'newest', label: 'Шинэ нь эхэнд' },
  { value: 'price_asc', label: 'Үнэ: Багаас их' },
  { value: 'price_desc', label: 'Үнэ: Ихээс бага' },
  { value: 'popular', label: 'Эрэлттэй' },
  { value: 'rating', label: 'Үнэлгээ' },
];

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters state
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    // Filter products based on selected filters
    let filtered = [...mockProducts];

    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    if (selectedBrand) {
      filtered = filtered.filter(p => p.brand === selectedBrand);
    }

    if (selectedSize) {
      filtered = filtered.filter(p => p.sizes.includes(selectedSize));
    }

    filtered = filtered.filter(p => {
      const price = p.sale_price || p.price;
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Sort
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => (a.sale_price || a.price) - (b.sale_price || b.price));
        break;
      case 'price_desc':
        filtered.sort((a, b) => (b.sale_price || b.price) - (a.sale_price || a.price));
        break;
      case 'popular':
        filtered.sort((a, b) => b.review_count - a.review_count);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setProducts(filtered);
  }, [selectedCategory, selectedBrand, selectedSize, priceRange, sortBy]);

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
