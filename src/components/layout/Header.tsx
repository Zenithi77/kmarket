'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Search, ShoppingCart, Heart, User, ChevronDown, Menu, X, Shield, Sparkles, Shirt, Footprints, Wind, TrendingUp, Award, Package, Percent, LogOut, Settings, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore } from '@/store';

const CATEGORIES = [
  { id: '1', name: 'Beauty', slug: 'beauty', color: 'group-hover:text-pink-500', bgColor: 'group-hover:bg-pink-50', icon: Sparkles, iconColor: 'text-pink-400' },
  { id: '2', name: 'Fashion', slug: 'fashion', color: 'group-hover:text-purple-500', bgColor: 'group-hover:bg-purple-50', icon: Shirt, iconColor: 'text-purple-400' },
  { id: '3', name: 'Shoes', slug: 'shoes', color: 'group-hover:text-blue-500', bgColor: 'group-hover:bg-blue-50', icon: Footprints, iconColor: 'text-blue-400' },
  { id: '4', name: 'Dyson', slug: 'dyson', color: 'group-hover:text-cyan-500', bgColor: 'group-hover:bg-cyan-50', icon: Wind, iconColor: 'text-cyan-400' },
  { id: '5', name: 'Trendy', slug: 'trendy', color: 'group-hover:text-rose-500', bgColor: 'group-hover:bg-rose-50', icon: TrendingUp, iconColor: 'text-rose-400' },
  { id: '6', name: 'Best', slug: 'best', color: 'group-hover:text-amber-500', bgColor: 'group-hover:bg-amber-50', icon: Award, iconColor: 'text-amber-400' },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  const cartItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.getTotalItems());
  const { isAuthenticated: zustandAuth, user, logout } = useAuthStore();
  const openCart = useCartStore((state) => state.openCart);
  
  // Prevent hydration mismatch by only rendering auth state after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    logout();
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      {/* Main Header */}
      <div className="border-b border-gray-100/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Row 1: Logo and Icons */}
          <div className="flex items-center justify-between h-14">
            {/* Left: Hamburger + Logo */}
            <div className="flex items-center gap-2">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              {/* Logo */}
              <Link href="/" className="flex-shrink-0 flex items-center group">
                <div className="relative">
                  <span className="text-3xl md:text-4xl font-black bg-gradient-to-br from-orange-500 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-sm">
                    K
                  </span>
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
                </div>
                <span className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight ml-0.5 group-hover:text-gray-900 transition-colors">
                  market
                </span>
              </Link>
            </div>

            {/* Right Icons */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Login/Register or Profile Dropdown */}
              {mounted && isAuthenticated ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button 
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`flex items-center gap-1 p-2.5 rounded-xl transition-all duration-200 ${
                      isProfileDropdownOpen 
                        ? 'text-orange-500 bg-orange-50' 
                        : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50/80'
                    }`}
                    title="Профайл"
                  >
                    <div className="relative">
                      <User className="w-5 h-5" />
                      {user?.role === 'admin' && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-orange-400 to-amber-400 rounded-full ring-2 ring-white" />
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 py-2 z-50 animate-dropdown">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">{user?.full_name || 'Хэрэглэгч'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      
                      {/* Admin Link - Only for admin users */}
                      {user?.role === 'admin' && (
                        <>
                          <div className="px-2 py-2">
                            <Link
                              href="/admin"
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-orange-600 bg-gradient-to-r from-orange-50 to-amber-50 hover:from-orange-100 hover:to-amber-100 rounded-xl transition-all duration-200"
                            >
                              <div className="p-1.5 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg">
                                <Shield className="w-4 h-4 text-white" />
                              </div>
                              <span>Админ хуудас</span>
                              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                            </Link>
                          </div>
                          <div className="border-t border-gray-100 my-1" />
                        </>
                      )}
                      
                      <div className="px-2 py-1 space-y-0.5">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                        >
                          <div className="p-1.5 bg-gray-100 group-hover:bg-gray-200 rounded-lg transition-colors">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <span>Миний профайл</span>
                        </Link>
                        
                        <Link
                          href="/profile/orders"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                        >
                          <div className="p-1.5 bg-gray-100 group-hover:bg-gray-200 rounded-lg transition-colors">
                            <ShoppingBag className="w-4 h-4 text-gray-600" />
                          </div>
                          <span>Миний захиалга</span>
                        </Link>
                        
                        <Link
                          href="/profile/settings"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 group"
                        >
                          <div className="p-1.5 bg-gray-100 group-hover:bg-gray-200 rounded-lg transition-colors">
                            <Settings className="w-4 h-4 text-gray-600" />
                          </div>
                          <span>Тохиргоо</span>
                        </Link>
                      </div>
                      
                      <div className="border-t border-gray-100 my-2" />
                      
                      <div className="px-2 pb-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 w-full group"
                        >
                          <div className="p-1.5 bg-red-100 group-hover:bg-red-200 rounded-lg transition-colors">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <span>Гарах</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link 
                  href="/auth/login"
                  className="flex items-center p-2.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50/80 rounded-xl transition-all duration-200"
                  title="Нэвтрэх"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Wishlist */}
              <Link 
                href="/wishlist" 
                className="relative p-2.5 text-gray-600 hover:text-rose-500 hover:bg-rose-50/80 rounded-xl transition-all duration-200 group"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                {mounted && wishlistItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-rose-200 animate-zoom-in">
                    {wishlistItems}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50/80 rounded-xl transition-all duration-200 group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                {mounted && cartItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-orange-200 animate-zoom-in">
                    {cartItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Row 2: Search Bar - Full Width */}
          <div className="pb-3">
            <form onSubmit={handleSearch} className="w-full flex items-center group">
              {/* Category Dropdown */}
              <div className="relative hidden sm:block">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="h-11 pl-4 pr-9 border-2 border-r-0 border-gray-200 group-focus-within:border-orange-400 rounded-l-2xl bg-gray-50 group-focus-within:bg-white text-sm text-gray-700 focus:outline-none appearance-none cursor-pointer font-medium transition-all duration-200"
                >
                  <option value="All">Бүгд</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Home">Home</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              {/* Search Input */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Хайх бүтээгдэхүүний нэрийг оруулна уу..."
                  className="w-full h-11 px-4 border-2 border-gray-200 focus:border-orange-400 sm:border-l-0 sm:rounded-l-none rounded-l-2xl rounded-r-none text-sm focus:outline-none placeholder:text-gray-400 bg-gray-50 focus:bg-white transition-all duration-200"
                />
              </div>
              
              {/* Search Button */}
              <button
                type="submit"
                className="h-11 px-6 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-r-2xl transition-all duration-200 flex items-center justify-center shadow-lg shadow-orange-200/50 hover:shadow-orange-300/50 hover:scale-[1.02] active:scale-100"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="border-b border-gray-100/80 hidden lg:block bg-gradient-to-r from-gray-50/50 via-white to-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center justify-center gap-2 h-12">
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              return (
                <div
                  key={category.id}
                  className="relative group"
                  onMouseEnter={() => setActiveDropdown(category.slug)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <Link
                    href={`/category/${category.slug}`}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 transition-all duration-200 rounded-xl ${category.color} ${category.bgColor}`}
                  >
                    <IconComponent className={`w-4 h-4 ${category.iconColor} transition-colors`} />
                    <span>{category.name}</span>
                  </Link>
                  
                  {/* Dropdown indicator dot */}
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500 transform transition-all duration-300 ${
                    activeDropdown === category.slug ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                  }`} />
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[108px] z-40">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu Panel */}
          <div className="absolute left-0 top-0 bottom-0 bg-white w-[80%] max-w-[320px] shadow-2xl overflow-y-auto animate-slide-from-left">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-amber-500 p-5 text-white">
              <h2 className="text-lg font-bold">Ангилал</h2>
              <p className="text-sm text-orange-100 mt-0.5">Бүх бүтээгдэхүүнүүдийг үзэх</p>
            </div>
            
            {/* Categories with Icons */}
            <div className="py-2">
              {CATEGORIES.map((category) => {
                const IconComponent = category.icon;
                return (
                  <Link
                    key={category.id}
                    href={`/category/${category.slug}`}
                    className="flex items-center gap-4 px-5 py-4 text-sm font-medium text-gray-700 transition-all duration-200 hover:bg-gray-50 group"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className={`p-2.5 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-colors`}>
                      <IconComponent className={`w-5 h-5 ${category.iconColor}`} />
                    </div>
                    <span className="flex-1">{category.name}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                  </Link>
                );
              })}
            </div>

            {/* Divider */}
            <div className="mx-5 border-t border-gray-100" />

            {/* Quick Links with Icons */}
            <div className="py-2">
              <Link
                href="/products"
                className="flex items-center gap-4 px-5 py-4 text-sm text-gray-700 hover:bg-gray-50 transition-all duration-200 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2.5 rounded-xl bg-blue-100 group-hover:bg-blue-200 transition-colors">
                  <Package className="w-5 h-5 text-blue-500" />
                </div>
                <span className="flex-1">Бүх бараа</span>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/products?sale=true"
                className="flex items-center gap-4 px-5 py-4 text-sm font-medium text-red-600 hover:bg-red-50 transition-all duration-200 group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2.5 rounded-xl bg-red-100 group-hover:bg-red-200 transition-colors">
                  <Percent className="w-5 h-5 text-red-500" />
                </div>
                <span className="flex-1">Хямдрал</span>
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">HOT</span>
              </Link>
              {mounted && isAuthenticated && user?.role === 'admin' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-4 px-5 py-4 text-sm text-orange-600 font-medium hover:bg-orange-50 transition-all duration-200 group"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 transition-colors">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <span className="flex-1">Админ хэсэг</span>
                  <ChevronRight className="w-4 h-4 text-orange-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                </Link>
              )}
            </div>
            
            {/* Bottom spacing */}
            <div className="h-10" />
          </div>
        </div>
      )}
    </header>
  );
}
