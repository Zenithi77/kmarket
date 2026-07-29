'use client';

import { useWishlistStore } from '@/store/wishlistStore';
import { useCartStore } from '@/store/cartStore';
import { ProductGrid } from '@/components/product';
import { Button } from '@/components/ui';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleAddAllToCart = () => {
    items.forEach((product) => {
      addItem(product, 1, product.sizes[0] || undefined);
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
      <ProductGrid products={items} columns={4} />
    </div>
  );
}
