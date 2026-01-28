'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Search, ShoppingCart, Heart, User, ChevronDown, Menu, X } from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore } from '@/store';

const CATEGORIES = [
  { id: '1', name: 'Beauty', slug: 'beauty', color: '' },
  { id: '2', name: 'Fashion', slug: 'fashion', color: '' },
  { id: '3', name: 'Shoes', slug: 'shoes', color: '' },
  { id: '4', name: 'Dyson', slug: 'dyson', color: '' },
  { id: '5', name: 'Trendy', slug: 'trendy', color: 'text-pink-500' },
  { id: '6', name: 'Best', slug: 'best', color: 'text-orange-500' },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  const cartItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.getTotalItems());
  const { isAuthenticated: zustandAuth } = useAuthStore();
  const openCart = useCartStore((state) => state.openCart);
  
  // Prevent hydration mismatch by only rendering auth state after mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Check both NextAuth session and Zustand store (only after mounted)
  const isAuthenticated = mounted && (!!session || zustandAuth);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white">
      {/* Top Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-3xl font-black bg-gradient-to-r from-orange-500 to-amber-400 bg-clip-text text-transparent" style={{ fontFamily: 'system-ui' }}>
                K
              </span>
              <span className="text-2xl font-bold text-gray-800 tracking-tight">
                market
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="w-full flex">
                <div className="relative">
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="h-10 pl-3 pr-8 border border-r-0 border-gray-300 rounded-l-md bg-white text-sm text-gray-600 focus:outline-none focus:border-gray-400 appearance-none cursor-pointer"
                  >
                    <option value="All">Бүгд</option>
                    <option value="Women">Эмэгтэй</option>
                    <option value="Men">Эрэгтэй</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Kids">Хүүхэд</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Хайх..."
                  className="flex-1 h-10 px-4 border border-gray-300 text-sm focus:outline-none focus:border-gray-400"
                />
                <button
                  type="submit"
                  className="h-10 px-4 bg-white border border-l-0 border-gray-300 rounded-r-md hover:bg-gray-50"
                >
                  <Search className="w-5 h-5 text-gray-500" />
                </button>
              </form>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-4">
              {/* Sign In / Profile */}
              <Link 
                href={isAuthenticated ? "/profile" : "/auth/login"}
                className="hidden sm:flex items-center p-2 text-gray-600 hover:text-gray-900"
              >
                <User className="w-6 h-6" />
              </Link>

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-gray-900">
                <Heart className="w-6 h-6" />
                {mounted && wishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2 text-gray-600 hover:text-gray-900"
              >
                <ShoppingCart className="w-6 h-6" />
                {mounted && cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-b border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-8 h-12">
            {CATEGORIES.map((category) => (
              <div
                key={category.id}
                className="relative group"
                onMouseEnter={() => setActiveDropdown(category.slug)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={`/category/${category.slug}`}
                  className={`text-sm font-medium transition-colors py-3 ${
                    category.color || 'text-gray-700 hover:text-orange-500'
                  }`}
                >
                  {category.name}
                </Link>
                
                {/* Dropdown indicator line */}
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500 transform transition-transform origin-left ${
                  activeDropdown === category.slug ? 'scale-x-100' : 'scale-x-0'
                }`} />
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200">
          {/* Mobile Search */}
          <div className="p-4 border-b border-gray-100">
            <form onSubmit={handleSearch} className="flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Хайх..."
                className="flex-1 h-10 px-4 border border-gray-300 rounded-l-md text-sm focus:outline-none"
              />
              <button
                type="submit"
                className="h-10 px-4 bg-orange-500 text-white rounded-r-md"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>

          {/* Mobile Categories */}
          <div className="py-2">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className={`block px-4 py-3 text-sm font-medium border-b border-gray-50 ${
                  category.color || 'text-gray-700'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </div>

          {/* Mobile Auth */}
          <div className="p-4 border-t border-gray-100">
            <Link
              href={isAuthenticated ? "/profile" : "/auth/login"}
              className="block w-full py-2 text-center text-sm font-medium text-orange-500"
              onClick={() => setIsMenuOpen(false)}
            >
              {isAuthenticated ? 'Профайл' : 'Нэвтрэх / Бүртгүүлэх'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
