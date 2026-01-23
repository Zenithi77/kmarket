'use client';

import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/product/ProductCard';
import Button from '@/components/ui/Button';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';

// Mock product data with wishlist items
const mockProducts = [
  {
    id: '1',
    name: 'Dyson Airwrap Complete',
    slug: 'dyson-airwrap-complete',
    price: 2200000,
    originalPrice: 2500000,
    images: ['/products/dyson-airwrap.jpg'],
    category: { id: '4', name: 'Dyson', slug: 'dyson' },
    isNew: true,
    isOnSale: true,
    rating: 4.8,
    reviewCount: 156,
    sizes: [],
    stock: 15,
    description: ''
  },
  {
    id: '2',
    name: 'Nike Air Force 1 07',
    slug: 'nike-air-force-1-07',
    price: 450000,
    originalPrice: null,
    images: ['/products/nike-af1.jpg'],
    category: { id: '3', name: 'Гутал', slug: 'shoes' },
    isNew: false,
    isOnSale: false,
    rating: 4.9,
    reviewCount: 234,
    sizes: ['40', '41', '42', '43', '44'],
    stock: 42,
    description: ''
  },
  {
    id: '3',
    name: 'MAC Matte Lipstick - Ruby Woo',
    slug: 'mac-lipstick-ruby-woo',
    price: 95000,
    originalPrice: 120000,
    images: ['/products/mac-lipstick.jpg'],
    category: { id: '1', name: 'Гоо сайхан', slug: 'beauty' },
    isNew: false,
    isOnSale: true,
    rating: 4.7,
    reviewCount: 89,
    sizes: [],
    stock: 28,
    description: ''
  }
];

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  // Get wishlist products (in real app, fetch from API)
  const wishlistProducts = mockProducts.filter(p => items.includes(p.id));

  const handleAddAllToCart = () => {
    wishlistProducts.forEach(product => {
      addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        quantity: 1,
        size: product.sizes[0] || undefined
      });
    });
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Хадгалсан бараа байхгүй
          </h1>
          <p className="text-gray-500 mb-8">
            Таалагдсан бараагаа зүрхэн дээр дарж хадгалаарай
          </p>
          <Link href="/products">
            <Button size="lg">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Бараа үзэх
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Хадгалсан бараа</h1>
          <p className="text-gray-500 mt-1">{items.length} бараа</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={clearWishlist}>
            <Trash2 className="w-4 h-4 mr-2" />
            Бүгдийг устгах
          </Button>
          <Button onClick={handleAddAllToCart}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Бүгдийг сагсанд нэмэх
          </Button>
        </div>
      </div>

      {/* Wishlist Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
        {wishlistProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product as any}
          />
        ))}
      </div>
    </div>
  );
}
