'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Search, ShoppingCart, Heart, User, ChevronDown, Menu, X, Shield, Sparkles, Shirt, Footprints, Wind, TrendingUp, Award, Package, Percent } from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore } from '@/store';

const CATEGORIES = [
  { id: '1', name: 'Beauty', slug: 'beauty', color: '', icon: Sparkles },
  { id: '2', name: 'Fashion', slug: 'fashion', color: '', icon: Shirt },
  { id: '3', name: 'Shoes', slug: 'shoes', color: '', icon: Footprints },
  { id: '4', name: 'Dyson', slug: 'dyson', color: '', icon: Wind },
  { id: '5', name: 'Trendy', slug: 'trendy', color: 'text-pink-500', icon: TrendingUp },
  { id: '6', name: 'Best', slug: 'best', color: 'text-orange-500', icon: Award },
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
  const { isAuthenticated: zustandAuth, user } = useAuthStore();
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
      {/* Main Header - Coupang Style with 2 rows */}
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Row 1: Logo and Icons */}
          <div className="flex items-center justify-between h-12">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-1">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-700 hover:text-orange-500 transition-colors"
              >
                {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
              </button>

              {/* Logo - Coupang Style with Orange */}
              <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl md:text-3xl font-black text-orange-500" style={{ fontFamily: 'system-ui' }}>
                K
              </span>
              <span className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight">
                market
              </span>
              </Link>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-1 md:space-x-3">
              {/* Admin Button */}
              {mounted && isAuthenticated && user?.role === 'admin' && (
                <Link 
                  href="/admin"
                  className="flex items-center p-2 text-orange-500 hover:text-orange-600"
                  title="Админ"
                >
                  <Shield className="w-6 h-6" />
                </Link>
              )}

              {/* Login/Register or Profile */}
              {mounted && isAuthenticated ? (
                <Link 
                  href="/profile"
                  className="flex items-center p-2 text-gray-600 hover:text-orange-500"
                  title="Профайл"
                >
                  <User className="w-6 h-6" />
                </Link>
              ) : (
                <>
                  <Link 
                    href="/auth/login"
                    className="flex items-center p-2 text-gray-600 hover:text-orange-500"
                    title="Нэвтрэх"
                  >
                    <User className="w-6 h-6" />
                  </Link>
                </>
              )}

              {/* Wishlist */}
              <Link href="/wishlist" className="relative p-2 text-gray-600 hover:text-orange-500">
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
                className="relative p-2 text-gray-600 hover:text-orange-500"
              >
                <ShoppingCart className="w-6 h-6" />
                {mounted && cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Search Bar - Full Width */}
          <div className="pb-3">
            <form onSubmit={handleSearch} className="w-full flex items-center">
              {/* Category Dropdown */}
              <div className="relative hidden sm:block">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="h-10 pl-3 pr-8 border-2 border-r-0 border-orange-500 rounded-l-lg bg-white text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer font-medium"
                >
                  <option value="All">All</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Home">Home</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
              
              {/* Search Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Хайх бүтээгдэхүүний нэрийг оруулна уу!"
                  className="w-full h-10 px-4 pr-4 border-2 border-orange-500 sm:border-l-0 sm:rounded-l-none rounded-l-lg text-sm focus:outline-none placeholder:text-gray-400"
                />
              </div>
              
              {/* Search Button */}
              <button
                type="submit"
                className="h-10 px-5 bg-orange-500 text-white rounded-r-lg hover:bg-orange-600 transition-colors flex items-center justify-center"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Category Navigation - Hidden for cleaner Coupang look, keeping mobile menu */}
      <div className="border-b border-gray-100 hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center space-x-8 h-11">
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

      {/* Mobile Menu - Coupang Style with Icons */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[104px] z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel - Half screen width */}
          <div className="absolute left-0 top-0 bottom-0 bg-white w-[70%] max-w-[280px] shadow-2xl overflow-y-auto">
            {/* Categories with Icons */}
            <div className="py-3">
              {CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className={`flex items-center gap-4 px-5 py-3.5 text-sm font-medium transition-colors hover:bg-gray-50 ${
                      category.color || 'text-gray-800'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <IconComponent className="w-5 h-5 text-gray-500" />
                    <span>{category.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 ml-auto" />
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Quick Links with Icons */}
            <div className="py-3">
              <Link
                href="/products"
                className="flex items-center gap-4 px-5 py-3.5 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Package className="w-5 h-5 text-gray-500" />
                <span>Бүх бараа</span>
              </Link>
              <Link
                href="/products?sale=true"
                className="flex items-center gap-4 px-5 py-3.5 text-sm text-red-500 font-medium hover:bg-red-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <Percent className="w-5 h-5" />
                <span>Хямдрал</span>
              </Link>
              {mounted && isAuthenticated && user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-4 px-5 py-3.5 text-sm text-orange-600 font-medium hover:bg-orange-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Shield className="w-5 h-5" />
                  <span>Админ хэсэг</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
