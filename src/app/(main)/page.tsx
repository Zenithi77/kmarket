'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
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
                <div className="lg:hidden relative h-[100px] mt-2">
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
      {saleProducts.length > 0 && (
        <ProductSlider
          title="Today's Deal"
          badge="On Sale"
          badgeColor="bg-red-500"
          products={saleProducts}
          viewAllLink="/products?sale=true"
        />
      )}

      {/* Trending Products - Slider Style */}
      {featuredProducts.length > 0 && (
        <ProductSlider
          title="Trending Now"
          subtitle="Одоо эрэлттэй байгаа"
          products={featuredProducts}
          viewAllLink="/products?featured=true"
        />
      )}

      {/* New Arrivals - Slider Style */}
      {newProducts.length > 0 && (
        <ProductSlider
          title="New Arrivals"
          subtitle="Шинэ ирсэн"
          products={newProducts}
          viewAllLink="/products?new=true"
        />
      )}

      {/* All Products fallback - shows when other sections are empty */}
      {featuredProducts.length === 0 && saleProducts.length === 0 && allProducts.length > 0 && (
        <ProductSlider
          title="Бүтээгдэхүүн"
          subtitle="Бүх бараанууд"
          products={allProducts}
          viewAllLink="/products"
        />
      )}

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
