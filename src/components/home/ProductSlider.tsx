'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, ShoppingCart, Heart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore, useWishlistStore } from '@/store';
import { formatPrice, calculateDiscountPercent } from '@/lib/constants';
import toast from 'react-hot-toast';

interface ProductSliderProps {
  title: string;
  subtitle?: string;
  products: Product[];
  viewAllLink?: string;
  badge?: string;
  badgeColor?: string;
}

export default function ProductSlider({ 
  title, 
  subtitle,
  products, 
  viewAllLink, 
  badge,
  badgeColor = 'bg-sale-500'
}: ProductSliderProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [mounted, setMounted] = useState(false);
  
  const addToCart = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  const checkScrollable = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScrollable();
    window.addEventListener('resize', checkScrollable);
    return () => window.removeEventListener('resize', checkScrollable);
  }, [products]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollable, 300);
    }
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) {
      toast.error('Бараа дууссан байна');
      return;
    }
    addToCart(product, 1);
    toast.success('Сагсанд нэмэгдлээ');
  };

  const handleToggleWishlist = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    if (mounted && isInWishlist(product.id)) {
      toast.success('Хүслийн жагсаалтаас хасагдлаа');
    } else {
      toast.success('Хүслийн жагсаалтад нэмэгдлээ');
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {badge && (
                <span className={`${badgeColor} text-white text-xs font-bold px-2 py-1 rounded`}>
                  {badge}
                </span>
              )}
              <span className="text-primary-500">{title.split(' ')[0]}</span>
              {title.split(' ').slice(1).join(' ')}
            </h2>
            {subtitle && <span className="text-sm text-gray-500">{subtitle}</span>}
          </div>
          {viewAllLink && (
            <Link href={viewAllLink} className="text-sm text-gray-500 hover:text-primary-500">
              Бүгдийг харах &gt;
            </Link>
          )}
        </div>

        {/* Products Slider Container */}
        <div className="relative group">
          {/* Left Arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
            >
              <ChevronLeft className="w-6 h-6 text-gray-700" />
            </button>
          )}

          {/* Products Scroll Container */}
          <div
            ref={scrollRef}
            onScroll={checkScrollable}
            className="flex gap-3 overflow-x-auto hide-scrollbar scroll-smooth pb-2"
          >
            {products.map((product) => {
              const discountPercent = calculateDiscountPercent(product.price, product.sale_price || 0);
              const isOnSale = discountPercent > 0;
              const isWishlisted = mounted && isInWishlist(product.id);

              return (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="flex-shrink-0 w-44 md:w-48 group/card"
                >
                  <div className="bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
                    {/* Image (1:1) */}
                    <div className="relative aspect-square bg-gray-50">
                      <Image
                        src={product.images[0] || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover group-hover/card:scale-105 transition-transform duration-300"
                      />
                      {/* Badge */}
                      {isOnSale && (
                        <span className="absolute top-2 left-2 bg-sale-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                          {discountPercent}%
                        </span>
                      )}
                      {/* Wishlist */}
                      <button
                        onClick={(e) => handleToggleWishlist(e, product)}
                        className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                          isWishlisted
                            ? 'bg-sale-500 text-white'
                            : 'bg-white/80 text-gray-500 hover:text-sale-500'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                      </button>
                      {/* Quick Add */}
                      <button
                        onClick={(e) => handleAddToCart(e, product)}
                        className="absolute bottom-2 right-2 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-primary-600"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Content — just price + name, then colors */}
                    <div className="p-3">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        {isOnSale && (
                          <span className="text-sale-500 font-bold text-sm">{discountPercent}%</span>
                        )}
                        <span className="text-base font-bold text-gray-900">
                          {formatPrice(product.sale_price || product.price)}
                        </span>
                      </div>
                      <h3 className="text-sm text-gray-600 line-clamp-1 mt-1">
                        {product.name}
                      </h3>
                      {product.colors && product.colors.length > 0 && (
                        <div className="flex items-center gap-1 mt-1.5">
                          {product.colors.slice(0, 5).map((c, i) => (
                            <span
                              key={`${c.hex}-${i}`}
                              className="w-3 h-3 rounded-full border border-gray-200"
                              style={{ backgroundColor: c.hex }}
                              title={c.name}
                            />
                          ))}
                          {product.colors.length > 5 && (
                            <span className="text-[10px] text-gray-400 ml-0.5">+{product.colors.length - 5}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Right Arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
            >
              <ChevronRight className="w-6 h-6 text-gray-700" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
