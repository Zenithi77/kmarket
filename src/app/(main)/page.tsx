'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/product';
import { CategorySlider, ProductSlider } from '@/components/home';
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
    bg_color: '#E9D5FF',
    text_color: '#7C3AED',
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
                <div className="max-w-7xl mx-auto px-4 py-2 lg:py-4">
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
                    <div className="hidden lg:block w-1/2 relative h-[200px]">
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
                <div className="lg:hidden relative h-[120px] mt-2">
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
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg hidden md:flex items-center justify-center transition-all hover:scale-110 z-20"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full shadow-lg hidden md:flex items-center justify-center transition-all hover:scale-110 z-20"
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

      {/* Category Icons Slider - Coupang Style */}
      <CategorySlider categories={categories.length > 0 ? categories.map(c => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
        icon: c.icon,
        image: c.image
      })) : undefined} />

      {/* Today's Deal - Product Slider */}
      <ProductSlider
        title="Today's Deal"
        badge="On Sale"
        badgeColor="bg-red-500"
        products={mockProducts.slice(0, 8)}
        viewAllLink="/products?sale=true"
      />

      {/* Trending Products - Slider Style */}
      <ProductSlider
        title="Trending Now"
        subtitle="Одоо эрэлттэй байгаа"
        products={mockProducts.slice(0, 8)}
        viewAllLink="/products?featured=true"
      />

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

      {/* New Arrivals - Slider Style */}
      <ProductSlider
        title="New Arrivals"
        subtitle="Шинэ ирсэн"
        products={mockProducts.slice(0, 6)}
        viewAllLink="/products?new=true"
      />

      {/* Sale Banner */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="relative h-48 md:h-64 rounded-2xl overflow-hidden bg-gradient-to-r from-orange-500 to-pink-500">
            <div className="absolute inset-0 flex items-center justify-between px-6 md:px-12">
              <div className="text-white">
                <p className="text-xs font-medium mb-1">Limited Time Offer</p>
                <h2 className="text-3xl md:text-4xl font-bold mb-2">50% OFF</h2>
                <p className="text-sm opacity-90 mb-4">Сонгогдсон бараанууд дээр</p>
                <Link
                  href="/sale"
                  className="inline-flex items-center bg-white text-orange-500 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                >
                  SHOP SALE <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </div>
              <div className="hidden md:block relative w-48 h-48">
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
      <section className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Join Our Newsletter</h2>
          <p className="text-gray-400 mb-6 max-w-lg mx-auto text-sm">
            Шинэ бүтээгдэхүүн, хямдрал урамшууллын мэдээллийг хамгийн түрүүнд хүлээн аваарай
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="И-мэйл хаяг"
              className="flex-1 px-5 py-2.5 rounded-full bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:border-orange-500 focus:outline-none text-sm"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-colors text-sm"
            >
              Бүртгүүлэх
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
