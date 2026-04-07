'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, ChevronDown, ChevronRight, Filter } from 'lucide-react';
import { ProductGrid } from '@/components/product';
import { Product } from '@/types';
import { CATEGORY_FILTERS, BRANDS } from '@/lib/constants';

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
    category: p.category_id && typeof p.category_id === 'object'
      ? { id: p.category_id._id, name: p.category_id.name, slug: p.category_id.slug, is_active: true, created_at: '' }
      : undefined,
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

interface ApiCategory {
  _id: string;
  name: string;
  slug: string;
  filters?: { key: string; label: string; type: string; options: string[] }[];
  subcategories?: { _id: string; name: string; slug: string }[];
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

  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get('category') || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('');
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get('brand') || '');
  const [attributeFilters, setAttributeFilters] = useState<Record<string, string>>({});
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) setCategories(await res.json());
      } catch {}
    };
    fetchCats();
  }, []);

  const selectedCategoryObj = categories.find(c => c.slug === selectedCategory);

  const activeCategoryFilters = selectedCategoryObj
    ? selectedCategoryObj.filters && selectedCategoryObj.filters.length > 0
      ? selectedCategoryObj.filters
      : CATEGORY_FILTERS[selectedCategoryObj.slug] || []
    : [];

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedSubcategory) params.set('subcategory', selectedSubcategory);
      if (selectedBrand) params.set('brand', selectedBrand);
      if (priceRange[0] > 0) params.set('min_price', priceRange[0].toString());
      if (priceRange[1] < 5000000) params.set('max_price', priceRange[1].toString());

      Object.entries(attributeFilters).forEach(([key, value]) => {
        if (value) params.set(`attr_${key}`, value);
      });

      switch (sortBy) {
        case 'price_asc': params.set('sort', 'price'); params.set('order', 'asc'); break;
        case 'price_desc': params.set('sort', 'price'); params.set('order', 'desc'); break;
        case 'popular': params.set('sort', 'review_count'); params.set('order', 'desc'); break;
        case 'rating': params.set('sort', 'rating'); params.set('order', 'desc'); break;
        default: params.set('sort', 'created_at'); params.set('order', 'desc');
      }

      if (searchParams.get('featured') === 'true') params.set('featured', 'true');
      if (searchParams.get('new') === 'true') params.set('new', 'true');
      if (searchParams.get('sale') === 'true') params.set('sale', 'true');
      if (searchParams.get('search')) params.set('search', searchParams.get('search')!);

      params.set('limit', '40');

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      if (data.products) {
        setProducts(data.products.map(mapProduct));
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, selectedSubcategory, selectedBrand, attributeFilters, priceRange, sortBy, searchParams]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleCategoryChange = (slug: string) => {
    if (selectedCategory === slug) {
      setSelectedCategory('');
    } else {
      setSelectedCategory(slug);
    }
    setSelectedSubcategory('');
    setAttributeFilters({});
  };

  const handleAttributeChange = (key: string, value: string) => {
    setAttributeFilters(prev => {
      const next = { ...prev };
      if (next[key] === value) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedSubcategory('');
    setSelectedBrand('');
    setAttributeFilters({});
    setPriceRange([0, 5000000]);
    setSortBy('newest');
  };

  const activeFilterCount = [
    selectedCategory, selectedSubcategory, selectedBrand,
    priceRange[0] > 0 || priceRange[1] < 5000000 ? 'price' : '',
    ...Object.values(attributeFilters),
  ].filter(Boolean).length;

  const FilterSidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={`space-y-6 ${mobile ? '' : 'sticky top-24'}`}>
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-gray-900">Шүүлтүүр</h2>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-sm text-orange-500 hover:text-orange-600">
            Цэвэрлэх
          </button>
        )}
      </div>

      {/* Categories */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Ангилал</h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <div key={cat._id}>
              <button
                onClick={() => handleCategoryChange(cat.slug)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${
                  selectedCategory === cat.slug
                    ? 'bg-orange-50 text-orange-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.name}</span>
                {selectedCategory === cat.slug && cat.subcategories && cat.subcategories.length > 0 && (
                  <ChevronDown className="w-4 h-4" />
                )}
                {selectedCategory !== cat.slug && cat.subcategories && cat.subcategories.length > 0 && (
                  <ChevronRight className="w-3 h-3 text-gray-400" />
                )}
              </button>

              {selectedCategory === cat.slug && cat.subcategories && cat.subcategories.length > 0 && (
                <div className="ml-3 mt-1 space-y-0.5 border-l-2 border-orange-200 pl-3">
                  <button
                    onClick={() => setSelectedSubcategory('')}
                    className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                      !selectedSubcategory ? 'text-orange-600 font-medium bg-orange-50' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Бүгд
                  </button>
                  {cat.subcategories.map((sub) => (
                    <button
                      key={sub._id}
                      onClick={() => setSelectedSubcategory(selectedSubcategory === sub.slug ? '' : sub.slug)}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                        selectedSubcategory === sub.slug
                          ? 'text-orange-600 font-medium bg-orange-50'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Category Filters */}
      {selectedCategory && activeCategoryFilters.length > 0 && (
        <div className="border-t pt-4">
          <div className="flex items-center gap-1.5 mb-3">
            <Filter className="w-4 h-4 text-orange-500" />
            <h3 className="font-medium text-gray-900 text-sm">{selectedCategoryObj?.name} фильтер</h3>
          </div>
          {activeCategoryFilters.map((filter: { key: string; label: string; type: string; options: string[] }) => (
            <div key={filter.key} className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">{filter.label}</h4>
              <div className="flex flex-wrap gap-1.5">
                {filter.options.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => handleAttributeChange(filter.key, opt)}
                    className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                      attributeFilters[filter.key] === opt
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-400'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Brands */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Брэнд</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {BRANDS.map((brand) => (
            <label key={brand} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name={`brand${mobile ? '-m' : ''}`}
                checked={selectedBrand === brand}
                onChange={() => setSelectedBrand(selectedBrand === brand ? '' : brand)}
                className="w-4 h-4 text-orange-500 border-gray-300 focus:ring-orange-500"
              />
              <span className="ml-2 text-sm text-gray-600">{brand}</span>
            </label>
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
            className="w-full accent-orange-500"
          />
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>₮0</span>
            <span>₮{priceRange[1].toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900">Бүтээгдэхүүн</h1>
          <p className="text-gray-500 mt-2">
            {products.length} бүтээгдэхүүн олдлоо
            {selectedCategory && selectedCategoryObj && (
              <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-700 text-sm rounded-full">
                {selectedCategoryObj.name}
                {selectedSubcategory && (() => {
                  const sub = selectedCategoryObj.subcategories?.find(s => s.slug === selectedSubcategory);
                  return sub ? ` / ${sub.name}` : '';
                })()}
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-xl p-6 card-shadow">
              <FilterSidebar />
            </div>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg border card-shadow"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Шүүлтүүр
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="relative ml-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:border-orange-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Active filter tags */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCategory && selectedCategoryObj && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                    {selectedCategoryObj.name}
                    <button onClick={() => handleCategoryChange(selectedCategory)}><X className="w-3 h-3" /></button>
                  </span>
                )}
                {selectedSubcategory && (() => {
                  const sub = selectedCategoryObj?.subcategories?.find(s => s.slug === selectedSubcategory);
                  return sub ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      {sub.name}
                      <button onClick={() => setSelectedSubcategory('')}><X className="w-3 h-3" /></button>
                    </span>
                  ) : null;
                })()}
                {Object.entries(attributeFilters).map(([key, value]) => {
                  const filterDef = activeCategoryFilters.find((f: { key: string }) => f.key === key);
                  return (
                    <span key={key} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                      {filterDef ? `${filterDef.label}: ` : ''}{value}
                      <button onClick={() => handleAttributeChange(key, value)}><X className="w-3 h-3" /></button>
                    </span>
                  );
                })}
                {selectedBrand && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                    {selectedBrand}
                    <button onClick={() => setSelectedBrand('')}><X className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}

            <ProductGrid products={products} loading={loading} columns={3} />
          </main>
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 bg-black/50 z-50 lg:hidden">
          <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white overflow-y-auto animate-slide-left">
            <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between z-10">
              <h2 className="font-semibold">Шүүлтүүр</h2>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              <FilterSidebar mobile />
              <div className="pt-4 mt-4 border-t">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors"
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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
