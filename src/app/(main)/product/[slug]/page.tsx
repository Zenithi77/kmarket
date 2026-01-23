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
  Star, 
  Truck, 
  Shield, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Share2
} from 'lucide-react';
import { Product } from '@/types';
import { useCartStore, useWishlistStore } from '@/store';
import { formatPrice, calculateDiscountPercent } from '@/lib/constants';
import { ProductGrid } from '@/components/product';
import { Button } from '@/components/ui';
import toast from 'react-hot-toast';

// Mock product data
const mockProduct: Product = {
  id: '1',
  name: 'Dyson Airwrap Complete Long',
  slug: 'dyson-airwrap-complete-long',
  description: `Dyson Airwrap™ стайлер нь агаарын урсгалыг ашиглан үсийг гэмтээхгүйгээр загварчлах боломжтой. 

Онцлог шинж чанарууд:
• Coanda эффект технологи
• Олон төрлийн хавсралтууд
• Бүх үсний төрөлд тохиромжтой
• Өндөр температураас хамгаална

Багц агу|улга:
- 30mm Airwrap барал
- 40mm Airwrap барал  
- Soft smoothing brush
- Firm smoothing brush
- Round volumizing brush
- Pre-styling dryer
- Storage case`,
  price: 2500000,
  sale_price: 2200000,
  sku: 'DYS-001',
  brand: 'Dyson',
  weight: 500,
  category_id: 'dyson',
  images: [
    'https://images.unsplash.com/photo-1522338140262-f46f5913618a?w=800',
    'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800',
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800',
    'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800'
  ],
  sizes: [],
  stock: 10,
  is_active: true,
  is_featured: true,
  rating: 4.8,
  review_count: 124,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const relatedProducts: Product[] = [
  {
    id: '8',
    name: 'Dyson V15 Detect',
    slug: 'dyson-v15-detect',
    description: 'Лазер технологитой тоос сорогч',
    price: 3500000,
    sale_price: 3200000,
    sku: 'DYS-002',
    brand: 'Dyson',
    weight: 3000,
    category_id: 'dyson',
    images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'],
    sizes: [],
    stock: 8,
    is_active: true,
    is_featured: true,
    rating: 4.8,
    review_count: 76,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product>(mockProduct);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  const addToCart = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const discountPercent = calculateDiscountPercent(product.price, product.sale_price || 0);
  const isOnSale = discountPercent > 0;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error('Размер сонгоно уу');
      return;
    }
    
    addToCart(product, quantity, selectedSize);
    toast.success('Сагсанд нэмэгдлээ');
    openCart();
  };

  const handleBuyNow = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      toast.error('Размер сонгоно уу');
      return;
    }
    
    addToCart(product, quantity, selectedSize);
    window.location.href = '/checkout';
  };

  const handleShare = async () => {
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
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
              
              {/* Badges */}
              {isOnSale && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                  -{discountPercent}%
                </div>
              )}

              {/* Navigation */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedImage((prev) => (prev + 1) % product.images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
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
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Brand */}
            {product.brand && (
              <Link href={`/brand/${product.brand}`} className="text-sm text-primary-500 font-medium uppercase tracking-wider hover:underline">
                {product.brand}
              </Link>
            )}

            {/* Name */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {product.rating} ({product.review_count} үнэлгээ)
              </span>
            </div>

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
