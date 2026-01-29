'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { ProductCard } from '@/components/product';
import { Product } from '@/types';

// Banner type
interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  bg_color: string;
  text_color: string;
}

// Category type
interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  order: number;
}

// Default Hero Banner Slides (fallback)
const defaultSlides: Banner[] = [
  {
    _id: '1',
    title: 'K-BEAUTY',
    subtitle: 'DEALS',
    description: 'Солонгос гоо сайхны бүтээгдэхүүн',
    link: '/products',
    bg_color: '#FCE7F3',
    text_color: '#C084FC',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
  },
  {
    _id: '2',
    title: 'NEW',
    subtitle: 'ARRIVALS',
    description: 'Шинэ ирсэн бүтээгдэхүүнүүд',
    link: '/products?new=true',
    bg_color: '#FEF3C7',
    text_color: '#F97316',
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
  const [banners, setBanners] = useState<Banner[]>(defaultSlides);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch banners and categories from API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch('/api/banners');
        const data = await res.json();
        if (data.banners && data.banners.length > 0) {
          setBanners(data.banners);
        }
      } catch (error) {
        console.log('Using default banners');
      }
    };
    
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        const data = await res.json();
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.log('Failed to fetch categories');
      }
    };
    
    fetchBanners();
    fetchCategories();
  }, []);

  // Auto-slide with transition
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const nextSlide = useCallback(() => {
    goToSlide((currentSlide + 1) % banners.length);
  }, [currentSlide, banners.length, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentSlide - 1 + banners.length) % banners.length);
  }, [currentSlide, banners.length, goToSlide]);

  useEffect(() => {
    if (isPaused || banners.length <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 4000);
    return () => clearInterval(timer);
  }, [isPaused, banners.length, nextSlide]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Banner Slider - Coupang Style */}
      <section 
        className="relative overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Slides Container */}
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div 
              key={banner._id} 
              className="w-full flex-shrink-0 relative"
              style={{ backgroundColor: banner.bg_color }}
            >
              <Link href={banner.link || '/products'} className="block">
                <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
                  <div className="flex items-center justify-between">
                    {/* Text Content */}
                    <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
                      {banner.subtitle && (
                        <p 
                          className="text-lg lg:text-xl font-medium mb-2 opacity-80"
                          style={{ color: banner.text_color }}
                        >
                          {banner.subtitle}
                        </p>
                      )}
                      <h1 
                        className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-4 tracking-wide"
                        style={{ color: banner.text_color }}
                      >
                        {banner.title}
                      </h1>
                      {banner.description && (
                        <p className="text-gray-600 text-lg mb-6">{banner.description}</p>
                      )}
                      <span 
                        className="inline-flex items-center font-medium hover:opacity-80 transition-opacity"
                        style={{ color: banner.text_color }}
                      >
                        SHOP NOW <ArrowRight className="ml-2 w-5 h-5" />
                      </span>
                    </div>
                    
                    {/* Image */}
                    <div className="hidden lg:block w-1/2 relative h-[350px]">
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        className="object-contain"
                        priority={index === 0}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Mobile Image */}
                <div className="lg:hidden relative h-[250px] mt-4">
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    fill
                    className="object-contain"
                    priority={index === 0}
                  />
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
              style={{ opacity: 1 }}
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20"
              style={{ opacity: 1 }}
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentSlide 
                    ? 'w-8 h-2 bg-orange-500' 
                    : 'w-2 h-2 bg-gray-400 hover:bg-gray-600'
                }`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Mobile Category Grid - Coupang Style */}
      {categories.length > 0 && (
        <section className="bg-white py-4 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2 md:gap-4">
              {categories.slice(0, 10).map((category) => (
                <Link
                  key={category._id}
                  href={`/category/${category.slug}`}
                  className="flex flex-col items-center group"
                >
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform shadow-sm overflow-hidden">
                    {category.icon ? (
                      <Image
                        src={category.icon}
                        alt={category.name}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-400 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {category.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-700 text-center line-clamp-1 group-hover:text-orange-500 transition-colors">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

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
