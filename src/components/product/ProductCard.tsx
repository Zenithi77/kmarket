'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/types';
import { useCartStore, useWishlistStore } from '@/store';
import { formatPrice, calculateDiscountPercent } from '@/lib/constants';
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
      <div className="product-card group bg-white rounded-2xl overflow-hidden card-shadow hover:card-shadow-hover transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square bg-gray-50 flex-shrink-0">
          <Image
            src={product.images[0] || '/placeholder.svg'}
            alt={product.name}
            fill
            className="product-image object-cover"
          />
          <div className="product-overlay" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {isOnSale && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                -{discountPercent}%
              </span>
            )}
            {product.is_featured && (
              <span className="bg-primary-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                HOT
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded-full">
                Дууссан
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleToggleWishlist}
            className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
              mounted && isWishlisted
                ? 'bg-red-500 text-white'
                : 'bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${mounted && isWishlisted ? 'fill-current' : ''}`} />
          </button>

          {/* Quick Add to Cart */}
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className="absolute bottom-3 right-3 w-10 h-10 bg-primary-500 text-white rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Brand */}
          <div className="h-4 mb-1">
            {product.brand && (
              <p className="text-xs text-gray-500 uppercase tracking-wider truncate">
                {product.brand}
              </p>
            )}
          </div>

          {/* Name */}
          <h3 className="font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-primary-500 transition-colors h-12">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-center gap-2 h-7 mt-auto">
            <span className="text-lg font-bold text-gray-900">
              {formatPrice(product.sale_price || product.price)}
            </span>
            {isOnSale && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Sizes */}
          <div className="h-7 mt-2">
            {product.sizes && product.sizes.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap overflow-hidden">
                {product.sizes.slice(0, 4).map((size) => (
                  <span
                    key={size}
                    className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded"
                  >
                    {size}
                  </span>
                ))}
                {product.sizes.length > 4 && (
                  <span className="text-xs text-gray-400">
                    +{product.sizes.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
