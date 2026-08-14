'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { ProductGrid } from '@/components/product';
import { Button, LoadingSpinner } from '@/components/ui';
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
    category: p.category_id && typeof p.category_id === 'object' ? { id: p.category_id._id, name: p.category_id.name, slug: p.category_id.slug, is_active: true, created_at: '' } : undefined,
    images: p.images || [],
    colors: p.colors || [],
    size_type: p.size_type || 'none',
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

const POPULAR_SEARCHES = ['Dyson', 'Nike', 'MAC', 'Adidas', 'Гутал', 'Хувцас'];

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Product[]>([]);

  const runSearch = useCallback(async (q: string, cat: string) => {
    if (!q) {
      setResults([]);
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams({ search: q, limit: '40' });
      if (cat) params.set('category', cat);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      setResults(data.products ? data.products.map(mapProduct) : []);
    } catch (error) {
      console.error('Search failed:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    runSearch(query, category);
  }, [query, category, runSearch]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Results */}
      {query ? (
        <>
          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              &quot;{query}&quot; хайлтын үр дүн
            </h1>
            {!loading && (
              <p className="text-gray-500 mt-1">
                {results.length} бараа олдлоо
              </p>
            )}
          </div>

          {loading ? (
            <ProductGrid products={[]} loading columns={4} />
          ) : results.length > 0 ? (
            <ProductGrid products={results} columns={4} />
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
            {POPULAR_SEARCHES.map((term) => (
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
