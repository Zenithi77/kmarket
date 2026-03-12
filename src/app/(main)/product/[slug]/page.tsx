'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Heart, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Truck, 
  Shield, 
  RefreshCw,
  Share2,
  Loader2
} from 'lucide-react';
import { Product } from '@/types';
import { useCartStore, useWishlistStore } from '@/store';
import { formatPrice, calculateDiscountPercent, isVideoUrl } from '@/lib/constants';
import { ProductGrid } from '@/components/product';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';

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
    colors: p.colors || [],
    size_type: p.size_type || 'none',
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

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);

  // Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(`/api/products/${params.slug}`);
        if (!res.ok) {
          throw new Error('Бараа олдсонгүй');
        }
        const data = await res.json();
        const mapped = mapProduct(data);
        setProduct(mapped);

        // Fetch related products by same brand or category
        try {
          const categoryId = typeof data.category_id === 'object' ? data.category_id._id : data.category_id;
          const relRes = await fetch(`/api/products?limit=4&category=${categoryId}`);
          const relData = await relRes.json();
          if (relData.products) {
            setRelatedProducts(
              relData.products
                .filter((p: any) => (p._id || p.id) !== (data._id || data.id))
                .slice(0, 4)
                .map(mapProduct)
            );
          }
        } catch {
          // Ignore related products error
        }
      } catch (err: any) {
        setError(err.message || 'Алдаа гарлаа');
      } finally {
        setIsLoading(false);
      }
    };

    if (params.slug) {
      fetchProduct();
    }
  }, [params.slug]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setDragOffset(clientX - startX);
  };

  const handleDragEnd = () => {
    if (!isDragging || !product) return;
    setIsDragging(false);
    
    if (Math.abs(dragOffset) > 50) {
      if (dragOffset > 0) {
        setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length);
      } else {
        setSelectedImage((prev) => (prev + 1) % product.images.length);
      }
    }
    setDragOffset(0);
  };
  
  const addToCart = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = product ? isInWishlist(product.id) : false;

  const discountPercent = product ? calculateDiscountPercent(product.price, product.sale_price || 0) : 0;
  const isOnSale = discountPercent > 0;
  const isOutOfStock = product ? product.stock === 0 : true;

  const handleAddToCart = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error('Размер сонгоно уу');
      return;
    }
    
    addToCart(product, quantity, selectedSize);
    toast.success('Сагсанд нэмэгдлээ');
    openCart();
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error('Размер сонгоно уу');
      return;
    }
    
    addToCart(product, quantity, selectedSize);
    window.location.href = '/checkout';
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await navigator.share({
        title: product.name,
        url: window.location.href
      });
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Холбоос хуулагдлаа');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Бараа олдсонгүй'}</h2>
          <Link href="/products" className="text-primary-500 hover:underline">Бүтээгдэхүүн үзэх</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center text-sm">
            <Link href="/" className="text-gray-500 hover:text-primary-500">Нүүр</Link>
            <span className="mx-2 text-gray-400">/</span>
            <Link href="/products" className="text-gray-500 hover:text-primary-500">Бүтээгдэхүүн</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-4">
            {/* Main Image/Video */}
            <div 
              className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={handleDragStart}
              onTouchMove={handleDragMove}
              onTouchEnd={handleDragEnd}
            >
              {isVideoUrl(product.images[selectedImage]) ? (
                <video
                  src={product.images[selectedImage]}
                  className="w-full h-full object-cover pointer-events-none"
                  style={{ transform: `translateX(${dragOffset}px)` }}
                  autoPlay
                  muted
                  playsInline
                  loop
                  controls
                />
              ) : (
                <Image
                  src={product.images[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover pointer-events-none"
                  style={{ transform: `translateX(${dragOffset}px)` }}
                  priority
                  draggable={false}
                />
              )}
              
              {/* Badges */}
              {isOnSale && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discountPercent}%
                </div>
              )}

              {/* Image indicators */}
              {product.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        selectedImage === index ? 'bg-white' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto hide-scrollbar">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                    selectedImage === index ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  {isVideoUrl(image) ? (
                    <>
                      <video
                        src={image}
                        className="w-full h-full object-cover"
                        muted
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
                          <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-gray-800 border-b-[5px] border-b-transparent ml-0.5" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <Link href={`/products?brand=${encodeURIComponent(product.brand)}`} className="text-sm text-primary-500 font-medium uppercase tracking-wider hover:underline">
                {product.brand}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.sale_price || product.price)}
              </span>
              {isOnSale && (
                <span className="text-xl text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              {isOutOfStock ? (
                <span className="text-red-500 font-medium">Дууссан</span>
              ) : product.stock < 10 ? (
                <span className="text-orange-500 font-medium">
                  Зөвхөн {product.stock} үлдсэн
                </span>
              ) : (
                <span className="text-green-500 font-medium">Бэлэн байгаа</span>
              )}
            </div>

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Өнгө сонгох</h3>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color.hex}
                      onClick={() => setSelectedColor(color.hex)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border-2 font-medium transition-all ${
                        selectedColor === color.hex
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-400'
                      }`}
                      title={color.name}
                    >
                      <div
                        className={`w-5 h-5 rounded-full border ${color.hex === '#FFFFFF' ? 'border-gray-300' : 'border-transparent'}`}
                        style={{ backgroundColor: color.hex }}
                      />
                      <span className="text-sm">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Размер сонгох</h3>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 font-medium transition-colors ${
                        selectedSize === size
                          ? 'border-primary-500 bg-primary-50 text-primary-600'
                          : 'border-gray-200 hover:border-primary-500'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Тоо ширхэг</h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary-500 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center hover:border-primary-500 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                variant="outline"
                size="lg"
                className="flex-1"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Сагсанд нэмэх
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                size="lg"
                className="flex-1"
              >
                Одоо худалдаж авах
              </Button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex gap-3">
              <button
                onClick={() => toggleItem(product)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${
                  isWishlisted
                    ? 'bg-red-50 border-red-200 text-red-500'
                    : 'border-gray-200 hover:border-primary-500'
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                {isWishlisted ? 'Хүслийн жагсаалтад байна' : 'Хүслийн жагсаалтад нэмэх'}
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 hover:border-primary-500 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Хуваалцах
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-primary-500" />
                </div>
                <p className="text-sm font-medium">Түргэн хүргэлт</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-primary-500" />
                </div>
                <p className="text-sm font-medium">Баталгаат бараа</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <RefreshCw className="w-6 h-6 text-primary-500" />
                </div>
                <p className="text-sm font-medium">14 хоног буцаалт</p>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Тайлбар</h2>
          <div className="prose max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-600 leading-relaxed">
              {product.description}
            </pre>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Холбоотой бүтээгдэхүүн</h2>
          <ProductGrid products={relatedProducts} columns={4} />
        </div>
      </div>
    </div>
  );
}
