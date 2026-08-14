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
      <div className="product-card group bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-cardHover transition-shadow duration-300 h-full flex flex-col">
        {/* Image/Video Container */}
        <div className="relative aspect-square bg-gray-50 flex-shrink-0 overflow-hidden">
          {isFirstMediaVideo ? (
            <video
              src={firstMedia}
              className="w-full h-full object-cover product-image"
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
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="product-image object-cover"
            />
          )}
          <div className="product-overlay" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
            {isOnSale && (
              <span className="bg-sale-500 text-white text-xs font-bold px-2 py-1 rounded-md">
                {discountPercent}%
              </span>
            )}
            {!isOnSale && product.is_featured && (
              <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-md">
                BEST
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-400 text-white text-xs font-bold px-2 py-1 rounded-md">
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
            className="absolute bottom-3 right-3 w-9 h-9 bg-primary-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed shadow-brand"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3.5 flex flex-col flex-grow">
          {/* Brand */}
          {product.brand && (
            <p className="text-[11px] text-gray-400 font-medium mb-0.5 truncate">
              {product.brand}
            </p>
          )}

          {/* Name */}
          <h3 className="text-sm font-medium text-on-surface line-clamp-2 group-hover:text-primary-600 transition-colors leading-snug">
            {product.name}
          </h3>

          {/* Color/variant name */}
          {product.colors && product.colors.length > 0 && (
            <p className="text-xs text-gray-400 mt-0.5 truncate">
              {product.colors[0].name}
            </p>
          )}

          {/* Price row — Korean-style: red % + bold price + strikethrough */}
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {isOnSale && (
              <span className="text-sale-500 font-bold text-base tabular">{discountPercent}%</span>
            )}
            <span className="text-base font-bold text-on-surface tabular">
              {formatPrice(product.sale_price || product.price)}
            </span>
            {isOnSale && (
              <span className="price-strike text-xs block w-full basis-full">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Color swatches */}
          {product.colors && product.colors.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {product.colors.slice(0, 5).map((c, i) => (
                <span
                  key={`${c.hex}-${i}`}
                  className="w-3.5 h-3.5 rounded-full border border-gray-200"
                  style={{ backgroundColor: c.hex }}
                  title={c.name}
                />
              ))}
              {product.colors.length > 5 && (
                <span className="text-[11px] text-gray-400 ml-0.5">+{product.colors.length - 5}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
