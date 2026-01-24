'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, SlidersHorizontal, Grid, List } from 'lucide-react';
import { ProductCard, ProductGrid } from '@/components/product';
import { Button } from '@/components/ui';

// Mock category data
const mockCategories: Record<string, { name: string; description: string; subcategories: { name: string; slug: string }[] }> = {
  'beauty': {
    name: 'Гоо сайхан',
    description: 'Гоо сайхны бүтээгдэхүүнүүд - нүүр будалт, арьс арчилгаа, үс арчилгаа',
    subcategories: [
      { name: 'Нүүр будалт', slug: 'makeup' },
      { name: 'Арьс арчилгаа', slug: 'skincare' },
      { name: 'Үс арчилгаа', slug: 'haircare' },
    ]
  },
  'fashion': {
    name: 'Хувцас',
    description: 'Эмэгтэй, эрэгтэй загварлаг хувцас',
    subcategories: [
      { name: 'Эмэгтэй', slug: 'women' },
      { name: 'Эрэгтэй', slug: 'men' },
    ]
  },
  'shoes': {
    name: 'Гутал',
    description: 'Спорт болон энгийн гутал',
    subcategories: [
      { name: 'Спорт гутал', slug: 'sports' },
      { name: 'Энгийн гутал', slug: 'casual' },
    ]
  },
  'dyson': {
    name: 'Dyson',
    description: 'Dyson брэндийн бүтээгдэхүүнүүд',
    subcategories: [
      { name: 'Үс хатаагч', slug: 'hairdryer' },
      { name: 'Тоос сорогч', slug: 'vacuum' },
      { name: 'Агаар цэвэршүүлэгч', slug: 'airpurifier' },
    ]
  },
  'trendy': {
    name: 'Trend',
    description: 'Хамгийн эрэлттэй бараанууд',
    subcategories: []
  },
  'best': {
    name: 'Best',
    description: 'Шилдэг борлуулалттай бараанууд',
    subcategories: []
  }
};

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

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<typeof mockProducts>([]);

  const category = mockCategories[slug];

  useEffect(() => {
    // Simulate loading
    setLoading(true);
    setTimeout(() => {
      // Filter products by category
      const filtered = mockProducts.filter(p => 
        p.category.slug === slug || slug === 'trendy' || slug === 'best'
      );
      setProducts(filtered.length > 0 ? filtered : mockProducts);
      setLoading(false);
    }, 500);
  }, [slug]);

  if (!category) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Категори олдсонгүй</h1>
        <Link href="/products">
          <Button>Бүх бараа харах</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary-500">Нүүр</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        <p className="text-gray-500 mt-2">{category.description}</p>
      </div>

      {/* Subcategories */}
      {category.subcategories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href={`/category/${slug}`}
            className="px-4 py-2 bg-primary-500 text-white rounded-full text-sm font-medium"
          >
            Бүгд
          </Link>
          {category.subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/category/${slug}/${sub.slug}`}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium text-gray-700 transition-colors"
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      {/* Products */}
      <ProductGrid products={products as any} loading={loading} />
    </div>
  );
}
