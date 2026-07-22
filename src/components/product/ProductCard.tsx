'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore, useWishlistStore } from '@/store';
import { formatPrice, calculateDiscountPercent, isVideoUrl } from '@/lib/constants';
import toast from 'react-hot-toast';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);
  const { toggleItem, isInWishlist } = useWishlistStore();
  
  // Prevent hydration mismatch by only checking wishlist after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const isWishlisted = mounted && isInWishlist(product.id);
  
  const discountPercent = calculateDiscountPercent(product.price, product.sale_price || 0);
  const isOnSale = discountPercent > 0;
  const isOutOfStock = product.stock === 0;
  const firstMedia = product.images[0] || '/placeholder.svg';
  const isFirstMediaVideo = isVideoUrl(firstMedia);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) {
      toast.error('Бараа дууссан байна');
      return;
    }
    
    addToCart(product, 1);
    toast.success('Сагсанд нэмэгдлээ');
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
    
    if (isWishlisted) {
      toast.success('Хүслийн жагсаалтаас хасагдлаа');
    } else {
      toast.success('Хүслийн жагсаалтад нэмэгдлээ');
    }
  };

  return (
    <Link href={`/product/${product.slug}`}>
      <div className="product-card group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-cardHover transition-shadow duration-300 h-full flex flex-col">
        {/* Image/Video Container */}
        <div className="relative aspect-square bg-white flex-shrink-0 overflow-hidden p-6">
          {isFirstMediaVideo ? (
            <video
              src={firstMedia}
              className="w-full h-full object-contain product-image"
              muted
              playsInline
              loop
              onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
              onMouseLeave={(e) => {
                const v = e.target as HTMLVideoElement;
                v.pause();
                v.currentTime = 0;
              }}
            />
          ) : (
            <Image
              src={firstMedia}
              alt={product.name}
              fill
              className="product-image object-contain p-4"
            />
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {isOnSale && (
              <span className="bg-sale-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                -{discountPercent}%
              </span>
            )}
            {!isOnSale && product.is_featured && (
              <span className="bg-gray-100 text-on-surface text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                Bestseller
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-100 text-on-surface-variant text-[11px] font-semibold px-2.5 py-1 rounded-full uppercase tracking-wide">
                Дууссан
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              mounted && isWishlisted
                ? 'bg-sale-500 text-white'
                : 'bg-white/90 text-gray-500 hover:text-sale-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${mounted && isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="absolute bottom-3 right-3 w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-4 pb-4 flex flex-col flex-grow">
          {/* Name */}
          <h3 className="text-xs font-bold uppercase tracking-wide text-on-surface line-clamp-1 group-hover:text-black transition-colors">
            {product.name}
          </h3>

          {/* Color/variant name */}
          <div className="h-5 mt-0.5">
            {product.colors && product.colors.length > 0 && (
              <p className="text-xs text-on-surface-variant truncate">
                {product.colors[0].name}
              </p>
            )}
          </div>

          {/* Bottom row: color swatches + price */}
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="flex items-center gap-1">
              {product.colors && product.colors.length > 0 ? (
                <>
                  {product.colors.slice(0, 4).map((c, i) => (
                    <span
                      key={`${c.hex}-${i}`}
                      className="w-4 h-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                  {product.colors.length > 4 && (
                    <span className="text-[11px] text-gray-400 ml-0.5">+{product.colors.length - 4}</span>
                  )}
                </>
              ) : <span />}
            </div>
            <div className="flex items-center gap-1.5">
              {isOnSale && (
                <span className="price-strike text-xs">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className="text-sm font-bold text-on-surface tabular">
                {formatPrice(product.sale_price || product.price)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
