'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/product';
import { Button, LoadingSpinner } from '@/components/ui';

// Mock products
const mockProducts = [
  {
    id: '1',
    name: 'Dyson Airwrap Complete',
    slug: 'dyson-airwrap-complete',
    price: 2200000,
    originalPrice: 2500000,
    images: ['/products/dyson-airwrap.jpg'],
    category: { id: '4', name: 'Dyson', slug: 'dyson' },
    isNew: true,
    isOnSale: true,
    rating: 4.8,
    reviewCount: 156,
    sizes: [],
    stock: 15,
    description: ''
  },
  {
    id: '2',
    name: 'Nike Air Force 1 07',
    slug: 'nike-air-force-1-07',
    price: 450000,
    originalPrice: null,
    images: ['/products/nike-af1.jpg'],
    category: { id: '3', name: 'Гутал', slug: 'shoes' },
    isNew: false,
    isOnSale: false,
    rating: 4.9,
    reviewCount: 234,
    sizes: ['40', '41', '42', '43', '44'],
    stock: 42,
    description: ''
  },
  {
    id: '3',
    name: 'MAC Matte Lipstick - Ruby Woo',
    slug: 'mac-lipstick-ruby-woo',
    price: 95000,
    originalPrice: 120000,
    images: ['/products/mac-lipstick.jpg'],
    category: { id: '1', name: 'Гоо сайхан', slug: 'beauty' },
    isNew: false,
    isOnSale: true,
    rating: 4.7,
    reviewCount: 89,
    sizes: [],
    stock: 28,
    description: ''
  },
  {
    id: '4',
    name: 'Adidas Ultraboost 22',
    slug: 'adidas-ultraboost-22',
    price: 450000,
    originalPrice: 520000,
    images: ['/products/adidas-ultraboost.jpg'],
    category: { id: '3', name: 'Гутал', slug: 'shoes' },
    isNew: true,
    isOnSale: true,
    rating: 4.6,
    reviewCount: 178,
    sizes: ['40', '41', '42', '43', '44', '45'],
    stock: 35,
    description: ''
  }
];

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchQuery, setSearchQuery] = useState(query);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<typeof mockProducts>([]);

  useEffect(() => {
    setSearchQuery(query);
    // Simulate search
    setLoading(true);
    setTimeout(() => {
      if (query) {
        const filtered = mockProducts.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.category.name.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } else {
        setResults([]);
      }
      setLoading(false);
    }, 500);
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <form action="/search" method="GET" className="relative max-w-2xl mx-auto">
          <input
            type="text"
            name="q"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Бараа хайх..."
            className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none text-lg"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </form>
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      ) : query ? (
        <>
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              "{query}" хайлтын үр дүн
            </h1>
            <p className="text-gray-500 mt-1">
              {results.length} бараа олдлоо
            </p>
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
              {results.map((product) => (
                <ProductCard key={product.id} product={product as any} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Хайлтын үр дүн олдсонгүй
              </h2>
              <p className="text-gray-500 mb-6">
                Өөр түлхүүр үг ашиглан дахин хайна уу
              </p>
              <Link href="/products">
                <Button>Бүх барааг харах</Button>
              </Link>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Юу хайж байна?
          </h2>
          <p className="text-gray-500">
            Дээрх хайлтын талбарт бараа, брэнд, категорийн нэр бичнэ үү
          </p>
        </div>
      )}

      {/* Popular Searches */}
      {!query && (
        <div className="max-w-2xl mx-auto mt-8">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Түгээмэл хайлтууд</h3>
          <div className="flex flex-wrap gap-2">
            {['Dyson', 'Nike', 'MAC', 'Adidas', 'Zara', 'Гутал', 'Хувцас'].map((term) => (
              <Link
                key={term}
                href={`/search?q=${encodeURIComponent(term)}`}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <LoadingSpinner size="lg" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
