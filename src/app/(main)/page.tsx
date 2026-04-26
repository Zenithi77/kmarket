'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight, Package, Flame, Crown, Truck, ShieldCheck, RotateCcw, Headphones } from 'lucide-react';
import { CategorySlider, ProductSlider } from '@/components/home';
import { Product } from '@/types';
import { formatPrice, calculateDiscountPercent } from '@/lib/constants';

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
    // ── Hydrate categories instantly from localStorage cache (instant icons on revisit) ──
    try {
      const cached = localStorage.getItem('km:categories');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed?.data) && Date.now() - parsed.t < 24 * 3600 * 1000) {
          setCategories(parsed.data);
        }
      }
    } catch {}

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
          try {
            localStorage.setItem('km:categories', JSON.stringify({ t: Date.now(), data }));
          } catch {}
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

  // ── Time-deal countdown (resets every 6h) ──
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const next = new Date(now);
      const slot = Math.ceil((now.getHours() + 1) / 6) * 6;
      next.setHours(slot, 0, 0, 0);
      const diff = Math.max(0, next.getTime() - now.getTime());
      setTimeLeft({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Top ranking list (sale > featured > all, top 5) ──
  const rankingProducts = useMemo(() => {
    const pool = [...saleProducts, ...featuredProducts, ...allProducts];
    const seen = new Set<string>();
    const unique: Product[] = [];
    for (const p of pool) {
      if (!seen.has(p.id)) { seen.add(p.id); unique.push(p); }
      if (unique.length >= 8) break;
    }
    return unique;
  }, [saleProducts, featuredProducts, allProducts]);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── HERO BANNER SLIDER (rounded card style) ── */}
      <section className="bg-white pb-2">
        <div className="max-w-7xl mx-auto px-3 pt-3">
          <div
            className="relative overflow-hidden rounded-2xl shadow-sm"
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
                    <div className="px-6 lg:px-12 py-6 lg:py-10">
                      <div className="flex items-center justify-between gap-4">
                        <div className="w-full lg:w-1/2 z-10">
                          {banner.subtitle && (
                            <p className="text-sm lg:text-base font-medium mb-2 opacity-80" style={{ color: banner.text_color }}>
                              {banner.subtitle}
                            </p>
                          )}
                          <h1 className="text-3xl lg:text-5xl xl:text-6xl font-extrabold mb-3 tracking-tight leading-tight" style={{ color: banner.text_color }}>
                            {banner.title}
                          </h1>
                          {banner.description && (
                            <p className="text-gray-700/80 text-sm lg:text-base mb-5 line-clamp-2">{banner.description}</p>
                          )}
                          <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur text-gray-900 text-sm font-semibold hover:bg-white transition-all">
                            SHOP NOW <ArrowRight className="w-4 h-4" />
                          </span>
                        </div>
                        <div className="hidden lg:block w-1/2 relative h-[220px]">
                          <Image src={banner.image} alt={banner.title} fill className="object-contain" priority={index === 0} />
                        </div>
                      </div>
                    </div>
                    <div className="lg:hidden relative h-[120px]">
                      <Image src={banner.image} alt={banner.title} fill className="object-contain" priority={index === 0} />
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {banners.length > 1 && (
              <>
                <button onClick={prevSlide} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow-md hidden md:flex items-center justify-center hover:scale-110 transition-all z-20">
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
                <button onClick={nextSlide} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 hover:bg-white rounded-full shadow-md hidden md:flex items-center justify-center hover:scale-110 transition-all z-20">
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
                <div className="absolute bottom-3 right-4 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white text-[11px] font-medium z-20">
                  {currentSlide + 1} / {banners.length}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── CATEGORY QUICK-NAV (single horizontal row) ── */}
      <CategorySlider categories={categories.length > 0 ? categories.map(c => ({ id: c._id, name: c.name, slug: c.slug, icon: c.icon, image: c.image })) : undefined} />

      {/* ── TIME DEAL (Korean-style flash deal w/ countdown) ── */}
      {saleProducts.length > 0 && (
        <section className="mt-2 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex items-end justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-bold">
                  <Flame className="w-3.5 h-3.5" /> TIME DEAL
                </div>
                <h2 className="text-lg md:text-xl font-extrabold text-gray-900">Цагийн онцгой хямдрал</h2>
              </div>
              <div className="flex items-center gap-1 font-mono text-sm">
                {(['h','m','s'] as const).map((k, i) => (
                  <span key={k} className="contents">
                    <span className="px-2 py-1 rounded-md bg-gray-900 text-white font-bold tabular-nums min-w-[34px] text-center">
                      {String((timeLeft as any)[k]).padStart(2, '0')}
                    </span>
                    {i < 2 && <span className="text-gray-400 font-bold">:</span>}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-4 px-4 pb-1">
              {saleProducts.slice(0, 10).map((product) => {
                const discount = calculateDiscountPercent(product.price, product.sale_price || 0);
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="flex-shrink-0 w-40 md:w-44 group"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                      <Image
                        src={product.images[0] || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {discount > 0 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-red-500 text-white text-[11px] font-bold">
                          -{discount}%
                        </div>
                      )}
                    </div>
                    <h3 className="text-xs md:text-sm text-gray-800 mt-2 line-clamp-2 leading-snug min-h-[34px]">
                      {product.name}
                    </h3>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      {discount > 0 && (
                        <span className="text-red-500 font-extrabold text-sm">{discount}%</span>
                      )}
                      <span className="text-base font-extrabold text-gray-900">
                        {formatPrice(product.sale_price || product.price)}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── TOP RANKING (Korean weekly best style) ── */}
      {rankingProducts.length > 0 && (
        <section className="mt-2 bg-white">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg md:text-xl font-extrabold text-gray-900">Шилдэг рэнкинг</h2>
                <span className="text-xs text-gray-400">7 хоногийн шилдэг</span>
              </div>
              <Link href="/products?featured=true" className="text-xs text-gray-500 hover:text-orange-500 font-medium">
                Бүгд &gt;
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {rankingProducts.slice(0, 8).map((product, idx) => {
                const discount = calculateDiscountPercent(product.price, product.sale_price || 0);
                return (
                  <Link
                    key={product.id}
                    href={`/product/${product.slug}`}
                    className="flex gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={product.images[0] || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className={`absolute top-1 left-1 w-6 h-6 rounded-md flex items-center justify-center text-xs font-extrabold text-white ${idx < 3 ? 'bg-red-500' : 'bg-gray-800/80'}`}>
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="text-sm text-gray-800 line-clamp-2 leading-snug">{product.name}</h3>
                      <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                        {discount > 0 && (
                          <span className="text-red-500 font-extrabold text-sm">{discount}%</span>
                        )}
                        <span className="text-sm font-extrabold text-gray-900">
                          {formatPrice(product.sale_price || product.price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED / TRENDING ── */}
      {featuredProducts.length > 0 && (
        <div className="mt-2">
          <ProductSlider
            title="Trending Now"
            subtitle="Одоо эрэлттэй байгаа"
            products={featuredProducts}
            viewAllLink="/products?featured=true"
          />
        </div>
      )}

      {/* ── PROMO STRIP ── */}
      <section className="mt-2 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Link href="/products?new=true" className="relative h-32 md:h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-orange-50 p-5 flex items-center justify-between group">
              <div>
                <p className="text-xs font-bold text-rose-500 mb-1">NEW IN</p>
                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">Шинэ ирсэн</h3>
                <p className="text-xs text-gray-500 mt-1">Энэ долоо хоногийн шинэлэг</p>
              </div>
              <ArrowRight className="w-6 h-6 text-rose-500 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/products?sale=true" className="relative h-32 md:h-36 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 p-5 flex items-center justify-between group">
              <div>
                <p className="text-xs font-bold text-orange-600 mb-1">UP TO 70% OFF</p>
                <h3 className="text-xl md:text-2xl font-extrabold text-gray-900">Хямдралын зах</h3>
                <p className="text-xs text-gray-500 mt-1">Хязгаарлагдмал тоо</p>
              </div>
              <ArrowRight className="w-6 h-6 text-orange-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── NEW ARRIVALS ── */}
      {newProducts.length > 0 && (
        <div className="mt-2">
          <ProductSlider
            title="New Arrivals"
            subtitle="Шинэ ирсэн"
            products={newProducts}
            viewAllLink="/products?new=true"
          />
        </div>
      )}

      {/* ── ALL PRODUCTS FALLBACK ── */}
      {featuredProducts.length === 0 && saleProducts.length === 0 && allProducts.length > 0 && (
        <div className="mt-2">
          <ProductSlider
            title="Бүтээгдэхүүн"
            subtitle="Бүх бараанууд"
            products={allProducts}
            viewAllLink="/products"
          />
        </div>
      )}

      {/* ── TRUST / SERVICE BAR (Korean shop footer feature row) ── */}
      <section className="mt-2 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { Icon: Truck,        title: 'Хурдан хүргэлт', desc: 'УБ дотор 24 цагт' },
              { Icon: ShieldCheck,  title: 'Баталгаат',       desc: '100% эх барааны' },
              { Icon: RotateCcw,    title: 'Буцаалт',         desc: '7 хоногийн дотор' },
              { Icon: Headphones,   title: '24/7 Тусламж',    desc: 'Хэзээ ч холбогдоорой' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{title}</p>
                  <p className="text-[11px] text-gray-500 truncate">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
