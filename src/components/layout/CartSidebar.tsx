'use client';

import { Fragment } from 'react';
import { X, Plus, Minus, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store';
import { formatPrice } from '@/lib/constants';

export default function CartSidebar() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, getTotalPrice } = useCartStore();

  if (!isOpen) return null;

  return (
    <Fragment>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 flex flex-col animate-slide-left">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold">Таны сагс</h2>
            <span className="bg-primary-100 text-primary-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {items.length}
            </span>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-6">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium mb-2">Таны сагс хоосон байна</p>
              <p className="text-gray-400 text-sm mb-6">
                Бүтээгдэхүүн нэмж худалдан авалт хийнэ үү
              </p>
              <button
                onClick={closeCart}
                className="btn-primary"
              >
                Дэлгүүр үзэх
              </button>
            </div>
          ) : (
            <div className="space-y-4 px-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 bg-gray-50 rounded-xl p-3"
                >
                  {/* Product Image */}
                  <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white">
                    <Image
                      src={item.product.images[0] || '/placeholder.svg'}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {item.product.name}
                    </h3>
                    {item.size && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Размер: {item.size}
                      </p>
                    )}
                    <p className="text-primary-600 font-semibold mt-1">
                      {formatPrice(item.product.sale_price || item.product.price)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg border hover:border-primary-500 transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center bg-white rounded-lg border hover:border-primary-500 transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t px-6 py-4 space-y-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Дүн:</span>
              <span className="text-xl font-bold text-gray-900">
                {formatPrice(getTotalPrice())}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Хүргэлтийн төлбөр тооцоолоогүй
            </p>

            {/* Actions */}
            <div className="space-y-2">
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary w-full flex items-center justify-center"
              >
                Худалдан авах
              </Link>
              <button
                onClick={closeCart}
                className="btn-secondary w-full"
              >
                Үргэлжлүүлэн худалдаа хийх
              </button>
            </div>
          </div>
        )}
      </div>
    </Fragment>
  );
}
