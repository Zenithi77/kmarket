'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { ProductCard } from '@/components/product';
import { Product } from '@/types';

// Hero Banner Slides
const heroSlides = [
  {
    id: 1,
    title: 'K-BEAUTY',
    subtitle: 'DEALS',
    description: 'Солонгос гоо сайхны бүтээгдэхүүн',
    cta: 'SHOP NOW',
    bgColor: 'bg-pink-100',
    textColor: 'text-purple-300',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
  },
  {
    id: 2,
    title: 'NEW',
    subtitle: 'ARRIVALS',
    description: 'Шинэ ирсэн бүтээгдэхүүнүүд',
    cta: 'SHOP NOW',
    bgColor: 'bg-orange-50',
    textColor: 'text-orange-200',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800',
  },
];

// Categories Grid
const categoryGrid = [
  {
    id: 1,
    name: 'Skincare',
    image: 'https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400',
    link: '/category/beauty',
    span: 'col-span-1 row-span-2',
  },
  {
    id: 2,
    name: 'Makeup',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
    link: '/category/beauty',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 3,
    name: 'Hair Care',
    image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?w=400',
    link: '/category/beauty',
    span: 'col-span-1 row-span-1',
  },
  {
    id: 4,
    name: 'Fashion',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
    link: '/category/women',
    span: 'col-span-1 row-span-2',
  },
];

// Mock Products
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'MARY&MAY Vegan Peptide Bakuchiol Sun Stick',
    slug: 'mary-may-sun-stick',
    description: 'SPF50+ PA++++ нарны хамгаалалттай',
    price: 85000,
    sale_price: 68000,
    sku: 'MM-001',
    brand: 'MARY&MAY',
    category_id: 'beauty',
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400'],
    sizes: [],
    stock: 50,
    is_active: true,
    is_featured: true,
    rating: 4.8,
    review_count: 124,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    name: 'manyo Bifida Cica Herb Toner',
    slug: 'manyo-bifida-toner',
    description: 'Арьс тайвшруулах тонер',
    price: 125000,
    sku: 'MN-001',
    brand: 'manyo',
    category_id: 'beauty',
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
    sizes: [],
    stock: 30,
    is_active: true,
    is_featured: true,
    rating: 4.9,
    review_count: 89,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    name: 'AHA BHA PHA 30 Days Miracle Serum',
    slug: 'some-by-mi-serum',
    description: 'Арьсыг цэвэрлэх сэрүм',
    price: 95000,
    sale_price: 75000,
    sku: 'SBM-001',
    brand: 'SOME BY MI',
    category_id: 'beauty',
    images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'],
    sizes: [],
    stock: 45,
    is_active: true,
    is_featured: false,
    rating: 4.7,
    review_count: 156,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Innisfree Green Tea Seed Serum',
    slug: 'innisfree-green-tea-serum',
    description: 'Ногоон цайны сэрүм',
    price: 115000,
    sku: 'INF-001',
    brand: 'Innisfree',
    category_id: 'beauty',
    images: ['https://images.unsplash.com/photo-1617897903246-719242758050?w=400'],
    sizes: [],
    stock: 35,
    is_active: true,
    is_featured: true,
    rating: 4.6,
    review_count: 78,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    name: 'COSRX Advanced Snail Mucin Essence',
    slug: 'cosrx-snail-essence',
    description: 'Мэлхийн шүүсний эссенс',
    price: 89000,
    sale_price: 72000,
    sku: 'CRX-001',
    brand: 'COSRX',
    category_id: 'beauty',
    images: ['https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=400'],
    sizes: [],
    stock: 60,
    is_active: true,
    is_featured: true,
    rating: 4.9,
    review_count: 312,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '6',
    name: 'Laneige Water Sleeping Mask',
    slug: 'laneige-sleeping-mask',
    description: 'Шөнийн чийгшүүлэгч маск',
    price: 135000,
    sku: 'LNG-001',
    brand: 'Laneige',
    category_id: 'beauty',
    images: ['https://images.unsplash.com/photo-1570194065650-d99fb4b38b15?w=400'],
    sizes: [],
    stock: 25,
    is_active: true,
    is_featured: false,
    rating: 4.8,
    review_count: 198,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '7',
    name: 'Etude House SoonJung 2x Barrier',
    slug: 'etude-soonjung-barrier',
    description: 'Мэдрэмтгий арьсанд зориулсан крем',
    price: 78000,
    sale_price: 62000,
    sku: 'ETD-001',
    brand: 'Etude House',
    category_id: 'beauty',
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'],
    sizes: [],
    stock: 40,
    is_active: true,
    is_featured: true,
    rating: 4.7,
    review_count: 145,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '8',
    name: 'Klairs Supple Preparation Toner',
    slug: 'klairs-supple-toner',
    description: 'Чийгшүүлэгч тонер',
    price: 98000,
    sku: 'KLR-001',
    brand: 'Klairs',
    category_id: 'beauty',
    images: ['https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'],
    sizes: [],
    stock: 55,
    is_active: true,
    is_featured: false,
    rating: 4.8,
    review_count: 267,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
];

const features = [
  { icon: Truck, title: 'Үнэгүй хүргэлт', desc: '100,000₮-с дээш' },
  { icon: Shield, title: '100% Жинхэнэ', desc: 'Баталгаат бараа' },
  { icon: RefreshCw, title: 'Буцаалт', desc: '14 хоногийн дотор' },
  { icon: Headphones, title: '24/7 Дэмжлэг', desc: 'Тусламж үзүүлнэ' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - KOODING Style */}
      <section className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0">
          {/* Left Images */}
          <div className="hidden lg:grid grid-rows-2 gap-0">
            <div className="relative h-[250px] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600"
                alt="Beauty Product 1"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative h-[250px] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600"
                alt="Beauty Product 2"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>

          {/* Center Banner */}
          <div className="lg:col-span-2 relative h-[400px] lg:h-[500px] bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center overflow-hidden">
            <div className="text-center z-10 px-8">
              <h1 className="text-6xl lg:text-8xl font-bold text-purple-200 tracking-wider mb-2">
                K-BEAUTY
              </h1>
              <h2 className="text-5xl lg:text-7xl font-bold text-purple-300 tracking-wider mb-8">
                DEALS
              </h2>
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 mx-auto mb-8">
                <Image
                  src="https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400"
                  alt="Featured Product"
                  fill
                  className="object-contain"
                />
              </div>
              <Link
                href="/products"
                className="inline-flex items-center text-gray-700 font-medium hover:text-orange-500 transition-colors"
              >
                SHOP NOW <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            {/* Decorative Elements */}
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-200 rounded-full opacity-30" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-pink-200 rounded-full opacity-40" />
          </div>

          {/* Right Images */}
          <div className="hidden lg:grid grid-rows-2 gap-0">
            <div className="relative h-[250px] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=600"
                alt="Beauty Product 3"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="relative h-[250px] overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1617897903246-719242758050?w=600"
                alt="Beauty Product 4"
                fill
                className="object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Bar */}
      <section className="bg-gray-50 py-6 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center justify-center space-x-3">
                <feature.icon className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{feature.title}</p>
                  <p className="text-xs text-gray-500">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
              <p className="text-gray-500 text-sm mt-1">Одоо эрэлттэй байгаа бүтээгдэхүүн</p>
            </div>
            <Link
              href="/products?featured=true"
              className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center"
            >
              Бүгдийг харах <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {mockProducts.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Category Banners */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Beauty Banner */}
            <Link href="/category/beauty" className="group relative h-80 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800"
                alt="Beauty"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Beauty</h3>
                <p className="text-sm opacity-90">Гоо сайхны бүтээгдэхүүн</p>
              </div>
            </Link>

            {/* Fashion Banner */}
            <Link href="/category/women" className="group relative h-80 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"
                alt="Fashion"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Fashion</h3>
                <p className="text-sm opacity-90">Загварлаг хувцас</p>
              </div>
            </Link>

            {/* Lifestyle Banner */}
            <Link href="/category/lifestyle" className="group relative h-80 rounded-2xl overflow-hidden">
              <Image
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"
                alt="Lifestyle"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-6 left-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Lifestyle</h3>
                <p className="text-sm opacity-90">Амьдралын хэв маяг</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">New Arrivals</h2>
              <p className="text-gray-500 text-sm mt-1">Шинэ ирсэн бүтээгдэхүүн</p>
            </div>
            <Link
              href="/products?new=true"
              className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center"
            >
              Бүгдийг харах <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {mockProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Sale Banner */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative h-64 md:h-80 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-pink-500">
            <div className="absolute inset-0 flex items-center justify-between px-8 md:px-16">
              <div className="text-white">
                <p className="text-sm font-medium mb-2">Limited Time Offer</p>
                <h2 className="text-4xl md:text-5xl font-bold mb-4">50% OFF</h2>
                <p className="text-lg opacity-90 mb-6">Сонгогдсон бараанууд дээр</p>
                <Link
                  href="/sale"
                  className="inline-flex items-center bg-white text-orange-500 px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
                >
                  SHOP SALE <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </div>
              <div className="hidden md:block relative w-64 h-64">
                <Image
                  src="https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400"
                  alt="Sale"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">Popular Brands</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
            {['COSRX', 'Innisfree', 'Laneige', 'Etude', 'SOME BY MI', 'Klairs'].map((brand) => (
              <Link
                key={brand}
                href={`/products?brand=${brand}`}
                className="flex items-center justify-center h-20 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="text-gray-700 font-medium">{brand}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Newsletter</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Шинэ бүтээгдэхүүн, хямдрал урамшууллын мэдээллийг хамгийн түрүүнд хүлээн аваарай
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="И-мэйл хаяг"
              className="flex-1 px-6 py-3 rounded-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-orange-500 focus:outline-none"
            />
            <button
              type="submit"
              className="px-8 py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors"
            >
              Бүртгүүлэх
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
