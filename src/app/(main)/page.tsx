'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Shirt, Footprints, Wind, TrendingUp, Award, Package, Tag, LucideIcon } from 'lucide-react';
import { ProductCard } from '@/components/product';
import { CategorySlider, ProductSlider } from '@/components/home';
import { Product } from '@/types';

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

// Slug-to-icon/style config for category cards
const CAT_CONFIG: Record<string, { icon: LucideIcon; gradient: string; light: string; iconColor: string }> = {
  beauty:  { icon: Sparkles,   gradient: 'from-pink-400 to-rose-500',     light: 'bg-pink-50',   iconColor: 'text-pink-500' },
  fashion: { icon: Shirt,      gradient: 'from-purple-400 to-violet-500',  light: 'bg-purple-50', iconColor: 'text-purple-500' },
  shoes:   { icon: Footprints, gradient: 'from-blue-400 to-cyan-500',      light: 'bg-blue-50',   iconColor: 'text-blue-500' },
  dyson:   { icon: Wind,       gradient: 'from-cyan-400 to-teal-500',      light: 'bg-cyan-50',   iconColor: 'text-cyan-500' },
  trendy:  { icon: TrendingUp, gradient: 'from-rose-400 to-orange-500',    light: 'bg-rose-50',   iconColor: 'text-rose-500' },
  best:    { icon: Award,      gradient: 'from-amber-400 to-yellow-500',   light: 'bg-amber-50',  iconColor: 'text-amber-500' },
  sale:    { icon: Tag,        gradient: 'from-red-400 to-rose-500',       light: 'bg-red-50',    iconColor: 'text-red-500' },
};

const FALLBACK_GRADIENTS = [
  { gradient: 'from-orange-400 to-amber-500', light: 'bg-orange-50', iconColor: 'text-orange-500' },
  { gradient: 'from-teal-400 to-green-500',   light: 'bg-teal-50',   iconColor: 'text-teal-500' },
  { gradient: 'from-violet-400 to-purple-500',light: 'bg-violet-50', iconColor: 'text-violet-500' },
  { gradient: 'from-sky-400 to-blue-500',     light: 'bg-sky-50',    iconColor: 'text-sky-500' },
];

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



export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<Banner[]>(defaultSlides);
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newProducts, setNewProducts] = useState<Product[]>([]);
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Fetch banners, categories, and products from API
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

    const fetchProducts = async () => {
      try {
        // Fetch featured products
        const [featuredRes, newRes, saleRes, allRes] = await Promise.all([
          fetch('/api/products?featured=true&limit=8'),
          fetch('/api/products?new=true&limit=6'),
          fetch('/api/products?sale=true&limit=8'),
          fetch('/api/products?limit=12'),
        ]);

        const [featuredData, newData, saleData, allData] = await Promise.all([
          featuredRes.json(),
          newRes.json(),
          saleRes.json(),
          allRes.json(),
        ]);

        if (featuredData.products) setFeaturedProducts(featuredData.products.map(mapProduct));
        if (newData.products) setNewProducts(newData.products.map(mapProduct));
        if (saleData.products) setSaleProducts(saleData.products.map(mapProduct));
        if (allData.products) setAllProducts(allData.products.map(mapProduct));
      } catch (error) {
        console.log('Failed to fetch products');
      }
    };
    
    fetchBanners();
    fetchCategories();
    fetchProducts();
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
    <div className="min-h-screen bg-gray-50">
      {/* ── HERO BANNER SLIDER ── */}
      <section
        className="relative overflow-hidden bg-white"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
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
                <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
                  <div className="flex items-center justify-between">
                    <div className="w-full lg:w-1/2 text-center lg:text-left z-10">
                      {banner.subtitle && (
                        <p className="text-lg lg:text-xl font-medium mb-2 opacity-80" style={{ color: banner.text_color }}>
                          {banner.subtitle}
                        </p>
                      )}
                      <h1 className="text-4xl lg:text-6xl xl:text-7xl font-bold mb-4 tracking-wide" style={{ color: banner.text_color }}>
                        {banner.title}
                      </h1>
                      {banner.description && (
                        <p className="text-gray-600 text-lg mb-6">{banner.description}</p>
                      )}
                      <span className="inline-flex items-center font-medium hover:opacity-80 transition-opacity" style={{ color: banner.text_color }}>
                        SHOP NOW <ArrowRight className="ml-2 w-5 h-5" />
                      </span>
                    </div>
                    <div className="hidden lg:block w-1/2 relative h-[220px]">
                      <Image src={banner.image} alt={banner.title} fill className="object-contain" priority={index === 0} />
                    </div>
                  </div>
                </div>
                <div className="lg:hidden relative h-[110px] mt-2">
                  <Image src={banner.image} alt={banner.title} fill className="object-contain" priority={index === 0} />
                </div>
              </Link>
            </div>
          ))}
        </div>

        {banners.length > 1 && (
          <>
            <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow-lg hidden md:flex items-center justify-center hover:scale-110 transition-all z-20">
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow-lg hidden md:flex items-center justify-center hover:scale-110 transition-all z-20">
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {banners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${index === currentSlide ? 'w-6 h-2 bg-orange-500' : 'w-2 h-2 bg-gray-300 hover:bg-gray-500'}`}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* ── CATEGORY QUICK-NAV ICONS ── */}
      <CategorySlider categories={categories.length > 0 ? categories.map(c => ({ id: c._id, name: c.name, slug: c.slug, icon: c.icon, image: c.image })) : undefined} />

      {/* ── CATEGORY SHOWCASE CARDS ── */}
      {categories.length > 0 && (
        <section className="bg-white py-8 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Ангилалаар үзэх</h2>
              <Link href="/products" className="text-sm text-orange-500 hover:text-orange-600 font-medium flex items-center gap-1">
                Бүгд <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {categories.slice(0, 6).map((cat, i) => {
                const slugKey = cat.slug?.split('-')[0]?.toLowerCase() || '';
                const cfg = CAT_CONFIG[slugKey] || { ...FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length], icon: Package };
                const Icon = cfg.icon;
                return (
                  <Link
                    key={cat._id}
                    href={`/category/${cat.slug}`}
                    className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 hover:border-transparent hover:shadow-lg transition-all duration-300"
                  >
                    {/* Top colored strip */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${cfg.gradient}`} />

                    <div className="p-4 flex flex-col items-center text-center gap-3">
                      {/* Icon circle */}
                      <div className={`w-12 h-12 rounded-xl ${cfg.light} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                        {cat.image ? (
                          <img src={cat.image} alt={cat.name} className="w-10 h-10 object-cover rounded-lg" />
                        ) : (
                          <Icon className={`w-6 h-6 ${cfg.iconColor}`} />
                        )}
                      </div>

                      <span className="text-sm font-semibold text-gray-800 group-hover:text-orange-500 transition-colors leading-tight">
                        {cat.name}
                      </span>

                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r ${cfg.gradient} text-white opacity-0 group-hover:opacity-100 transition-opacity`}>
                        Үзэх →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── SALE PRODUCTS ── */}
      {saleProducts.length > 0 && (
        <ProductSlider
          title="Today's Deal"
          badge="Sale"
          badgeColor="bg-red-500"
          products={saleProducts}
          viewAllLink="/products?sale=true"
        />
      )}

      {/* ── FEATURED / TRENDING ── */}
      {featuredProducts.length > 0 && (
        <ProductSlider
          title="Trending Now"
          subtitle="Одоо эрэлттэй байгаа"
          products={featuredProducts}
          viewAllLink="/products?featured=true"
        />
      )}

      {/* ── NEW ARRIVALS ── */}
      {newProducts.length > 0 && (
        <ProductSlider
          title="New Arrivals"
          subtitle="Шинэ ирсэн"
          products={newProducts}
          viewAllLink="/products?new=true"
        />
      )}

      {/* ── ALL PRODUCTS FALLBACK ── */}
      {featuredProducts.length === 0 && saleProducts.length === 0 && allProducts.length > 0 && (
        <ProductSlider
          title="Бүтээгдэхүүн"
          subtitle="Бүх бараанууд"
          products={allProducts}
          viewAllLink="/products"
        />
      )}

      {/* ── EMPTY STATE (no products at all) ── */}
      {featuredProducts.length === 0 && saleProducts.length === 0 && allProducts.length === 0 && categories.length === 0 && (
        <section className="py-24 bg-white">
          <div className="max-w-md mx-auto text-center px-4">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="w-10 h-10 text-orange-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-3">Бараа байхгүй байна</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Дэлгүүр одоохондоо хоосон байна.<br />Админ хэсгээс ангилал болон бараа нэмнэ үү.
            </p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-200"
            >
              <Package className="w-5 h-5" />
              Бараа нэмэх
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
