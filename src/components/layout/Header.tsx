'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { Search, ShoppingCart, Heart, User, ChevronDown, Menu, X, Shield, Sparkles, Shirt, Footprints, Wind, Flame, Crown, Package, Percent, LogOut, Settings, ShoppingBag, ChevronRight } from 'lucide-react';
import { useCartStore, useWishlistStore, useAuthStore } from '@/store';
import { ProductGrid } from '@/components/product';
import { Product } from '@/types';

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

const CATEGORIES = [
  { id: '1', name: 'Beauty', slug: 'beauty', icon: Sparkles },
  { id: '2', name: 'Fashion', slug: 'fashion', icon: Shirt },
  { id: '3', name: 'Shoes', slug: 'shoes', icon: Footprints },
  { id: '4', name: 'Dyson', slug: 'dyson', icon: Wind },
  { id: '5', name: 'Trendy', slug: 'trendy', icon: Flame },
  { id: '6', name: 'Best', slug: 'best', icon: Crown },
];

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('All');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const searchAreaRef = useRef<HTMLDivElement>(null);
  const mobileSearchAreaRef = useRef<HTMLDivElement>(null);
  const resultsAreaRef = useRef<HTMLDivElement>(null);
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
  const isAdmin = mounted && (user?.role === 'admin' || (session?.user as any)?.role === 'admin');

  const closeLiveSearch = () => setIsSearchActive(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      closeLiveSearch();
    }
  };

  // Smart live search: debounced fetch of matching products while the search
  // bar is expanded, mirroring the same query the full /search page uses.
  useEffect(() => {
    if (!isSearchActive || !searchQuery.trim()) {
      setLiveResults([]);
      setLiveLoading(false);
      return;
    }
    let cancelled = false;
    setLiveLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(searchQuery.trim())}&limit=8`);
        const data = await res.json();
        if (!cancelled) setLiveResults(data.products ? data.products.map(mapProduct) : []);
      } catch {
        if (!cancelled) setLiveResults([]);
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, isSearchActive]);

  // Close the expanded search on outside click / Escape.
  useEffect(() => {
    if (!isSearchActive) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const inSearch = searchAreaRef.current?.contains(target) || mobileSearchAreaRef.current?.contains(target);
      const inResults = resultsAreaRef.current?.contains(target);
      if (!inSearch && !inResults) {
        closeLiveSearch();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeLiveSearch();
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchActive]);

  const handleLogout = async () => {
    setIsProfileDropdownOpen(false);
    logout();
    await signOut({ redirect: false });
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-clay-gray shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Row 1: logo (left) — search (centered, wide, desktop only) — icons (right) */}
        <div className="relative flex items-center justify-between gap-3 h-16">
          {/* Left: hamburger + logo — stays put on mobile (search lives on its own row there);
              on desktop it collapses out of view while the smart search is expanded */}
          <div
            className={`flex items-center gap-2 flex-shrink-0 overflow-hidden max-w-[220px] opacity-100 transition-all duration-500 ease-out-expo ${
              isSearchActive ? 'lg:max-w-0 lg:opacity-0 lg:-translate-x-3 lg:pointer-events-none' : ''
            }`}
          >
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 -ml-2 text-on-surface-variant hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200 flex-shrink-0"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <Link href="/" className="flex-shrink-0 flex items-center gap-2 group">
              <Image
                id="header-logo-icon"
                src="/1.jpg"
                alt="KMarket"
                width={44}
                height={44}
                className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover"
                priority
                unoptimized
              />
              <span id="header-logo-text" className="block font-logo text-xl sm:text-2xl leading-none text-on-surface">
                KMarket
              </span>
            </Link>
          </div>

          {/* Search — desktop only (row1). Mobile gets its own full-width search row below,
              Coupang-style. Grows wide on larger screens, with a neon trace ring around it,
              expanding to the full row width (both directions) once activated. */}
          <div
            ref={searchAreaRef}
            className={`hidden lg:block relative w-full min-w-0 mx-auto p-[2px] transition-[max-width] duration-500 ease-out-expo ${
              isSearchActive ? 'max-w-full' : 'max-w-2xl'
            }`}
          >
            <svg
              className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="neon-grad-search" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0" />
                  <stop offset="50%" stopColor="#f97316" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ffedd5" stopOpacity="0" />
                </linearGradient>
              </defs>
              <rect
                x="0"
                y="0"
                width="100%"
                height="100%"
                rx="24"
                ry="24"
                fill="none"
                stroke="url(#neon-grad-search)"
                strokeWidth="2"
                strokeLinecap="round"
                pathLength={100}
                strokeDasharray="18 82"
                className="neon-trace"
              />
            </svg>
            <form onSubmit={handleSearch} className="relative w-full">
            <div className="flex items-center w-full h-11 bg-gray-50 border border-clay-gray rounded-full pl-1.5 pr-1.5 gap-1 focus-within:border-primary-500 focus-within:bg-white focus-within:shadow-soft transition-all duration-200">
              <div className="relative flex-shrink-0 hidden md:block">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="h-8 pl-3 pr-6 rounded-full bg-transparent text-xs font-medium text-on-surface-variant focus:outline-none appearance-none cursor-pointer border-r border-clay-gray"
                >
                  <option value="All">Бүгд</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Home">Home</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchActive(true)}
                placeholder="Хайх бүтээгдэхүүний нэрийг оруулна уу..."
                className="flex-1 min-w-0 h-8 px-2 bg-transparent text-sm focus:outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-all duration-200 flex items-center justify-center shadow-brand active:scale-95"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
            </form>
          </div>

          {/* Right Icons — stays put on mobile (profile + cart, Coupang-style); on desktop it
              collapses out of view while the smart search is expanded */}
          <div
            className={`flex items-center gap-1 md:gap-2 flex-shrink-0 overflow-hidden max-w-[220px] opacity-100 transition-all duration-500 ease-out-expo ${
              isSearchActive ? 'lg:max-w-0 lg:opacity-0 lg:translate-x-3 lg:pointer-events-none' : ''
            }`}
          >
              {/* Login/Register or Profile Dropdown */}
              {mounted && isAuthenticated ? (
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className={`flex items-center gap-1 p-2.5 rounded-lg transition-all duration-200 ${
                      isProfileDropdownOpen
                        ? 'text-primary-600 bg-primary-50'
                        : 'text-on-surface-variant hover:text-primary-600 hover:bg-primary-50/80'
                    }`}
                    title="Профайл"
                  >
                    <div className="relative">
                      <User className="w-5 h-5" />
                      {isAdmin && (
                        <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-600 rounded-full ring-2 ring-white" />
                      )}
                    </div>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Profile Dropdown Menu */}
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded shadow-xl shadow-gray-200/50 border border-clay-gray py-2 z-50 animate-dropdown">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-clay-gray">
                        <p className="text-sm font-semibold text-on-surface truncate">{user?.full_name || 'Хэрэглэгч'}</p>
                        <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                      </div>

                      {/* Admin Link - Only for admin users */}
                      {isAdmin && (
                        <>
                          <div className="px-2 py-2">
                            <Link
                              href="/admin"
                              onClick={() => setIsProfileDropdownOpen(false)}
                              className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-all duration-200"
                            >
                              <div className="p-1.5 bg-primary-600 rounded">
                                <Shield className="w-4 h-4 text-white" />
                              </div>
                              <span>Админ хуудас</span>
                              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
                            </Link>
                          </div>
                          <div className="border-t border-clay-gray my-1" />
                        </>
                      )}
                      
                      <div className="px-2 py-1 space-y-0.5">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-on-surface-variant hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="p-1.5 bg-gray-100 group-hover:bg-gray-200 rounded transition-colors">
                            <User className="w-4 h-4 text-on-surface-variant" />
                          </div>
                          <span>Миний профайл</span>
                        </Link>

                        <Link
                          href="/profile/orders"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-on-surface-variant hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="p-1.5 bg-gray-100 group-hover:bg-gray-200 rounded transition-colors">
                            <ShoppingBag className="w-4 h-4 text-on-surface-variant" />
                          </div>
                          <span>Миний захиалга</span>
                        </Link>

                        <Link
                          href="/profile/settings"
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-on-surface-variant hover:bg-gray-50 rounded-lg transition-all duration-200 group"
                        >
                          <div className="p-1.5 bg-gray-100 group-hover:bg-gray-200 rounded transition-colors">
                            <Settings className="w-4 h-4 text-on-surface-variant" />
                          </div>
                          <span>Тохиргоо</span>
                        </Link>
                      </div>

                      <div className="border-t border-clay-gray my-2" />

                      <div className="px-2 pb-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 px-3 py-2.5 text-sm text-sale-600 hover:bg-sale-50 rounded-lg transition-all duration-200 w-full group"
                        >
                          <div className="p-1.5 bg-sale-100 group-hover:bg-sale-100/70 rounded transition-colors">
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
                  className="flex items-center p-2.5 text-on-surface-variant hover:text-primary-600 hover:bg-primary-50/80 rounded-lg transition-all duration-200"
                  title="Нэвтрэх"
                >
                  <User className="w-5 h-5" />
                </Link>
              )}

              {/* Wishlist — desktop only, folded into the hamburger panel on mobile */}
              <Link
                href="/wishlist"
                className="hidden lg:flex relative p-2.5 text-on-surface-variant hover:text-sale-500 hover:bg-sale-50/80 rounded-lg transition-all duration-200 group"
              >
                <Heart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                {mounted && wishlistItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-sale-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-sale-200 animate-zoom-in">
                    {wishlistItems}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={openCart}
                className="relative p-2.5 text-on-surface-variant hover:text-primary-600 hover:bg-primary-50/80 rounded-lg transition-all duration-200 group"
              >
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                {mounted && cartItems > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-primary-200 animate-zoom-in">
                    {cartItems}
                  </span>
                )}
              </button>
            </div>
        </div>

        {/* Row 2 (mobile only): full-width Coupang-style search bar — category dropdown, input, mic, search */}
        <div className="lg:hidden pb-3" ref={mobileSearchAreaRef}>
          <form onSubmit={handleSearch} className="relative w-full">
            <div className="flex items-center w-full h-11 bg-white border-2 border-primary-200 rounded-full pl-1.5 pr-1.5 gap-1 focus-within:border-primary-500 transition-all duration-200">
              <div className="relative flex-shrink-0">
                <select
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                  className="h-8 pl-3 pr-6 rounded-full bg-transparent text-xs font-medium text-on-surface-variant focus:outline-none appearance-none cursor-pointer border-r border-clay-gray"
                >
                  <option value="All">Бүгд</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Home">Home</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchActive(true)}
                placeholder="Хайх бүтээгдэхүүний нэрийг оруулна уу..."
                className="flex-1 min-w-0 h-8 px-2 bg-transparent text-sm focus:outline-none placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-600 hover:bg-primary-700 text-white transition-all duration-200 flex items-center justify-center shadow-brand active:scale-95"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>

        {/* Row 2: category nav, directly below row 1 (desktop only) — collapses while the smart search is expanded */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-out-expo ${
            isSearchActive ? 'max-h-0 opacity-0' : 'max-h-20 opacity-100'
          }`}
        >
          <nav className="hidden lg:flex items-center justify-center gap-2 pb-3">
            {CATEGORIES.map((category) => {
              const IconComponent = category.icon;
              const active = activeDropdown === category.slug;
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group relative flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full text-sm font-semibold text-on-surface-variant transition-colors duration-200 hover:text-primary-600"
                  onMouseEnter={() => setActiveDropdown(category.slug)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                      active
                        ? 'bg-primary-50 text-primary-600 shadow-[0_0_0_4px_rgba(249,115,22,0.15)]'
                        : 'bg-gray-50 text-on-surface-variant group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:shadow-[0_0_16px_rgba(249,115,22,0.45)] group-hover:scale-110'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                  </span>
                  <span>{category.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Smart live-search results — appears full-width right below the header, like a compact products page */}
      <div
        ref={resultsAreaRef}
        className={`absolute left-0 right-0 top-full max-h-[75vh] overflow-y-auto bg-white shadow-2xl border-t border-clay-gray transition-all duration-500 ease-out-expo ${
          isSearchActive ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" onClick={closeLiveSearch}>
          {!searchQuery.trim() ? (
            <p className="text-center py-10 text-sm text-on-surface-variant">
              Бараа, брэнд, ангиллын нэрээр хайж эхэлнэ үү...
            </p>
          ) : liveLoading ? (
            <ProductGrid products={[]} loading columns={4} />
          ) : liveResults.length > 0 ? (
            <>
              <ProductGrid products={liveResults} columns={4} />
              <div className="text-center mt-6">
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
                >
                  Бүх үр дүнг харах
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center py-10 text-on-surface-variant font-medium">
              &quot;{searchQuery}&quot; гэсэн хайлтад тохирох бараа олдсонгүй
            </p>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay – rendered via portal so it escapes header's backdrop-filter containing block */}
      {mounted && createPortal(
      <div className="lg:hidden" inert={!isMenuOpen}>
        {/* Backdrop */}
        <div
          className={`fixed inset-0 z-[100] bg-on-surface/40 backdrop-blur-sm transition-opacity duration-500 ease-out-expo ${
            isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMenuOpen(false)}
        />

        {/* Slide-in Panel */}
        <div
          className={`fixed left-0 top-0 bottom-0 z-[101] w-[84%] max-w-xs bg-white shadow-2xl overflow-y-auto transition-transform duration-500 ease-out-expo ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Account section */}
          <div className="relative bg-gradient-to-br from-primary-600 to-primary-700 px-5 pt-5 pb-6 text-white overflow-hidden">
            <div className="absolute -right-6 -top-10 w-32 h-32 rounded-full bg-white/10" />
            <div className="absolute -right-2 top-12 w-16 h-16 rounded-full bg-white/10" />

            <button
              onClick={() => setIsMenuOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg bg-white/15 hover:bg-white/25 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {mounted && isAuthenticated ? (
              <Link
                href="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="relative flex items-center gap-3 pr-10"
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 text-white font-display font-bold text-lg flex-shrink-0 ring-2 ring-white/30">
                  {(user?.full_name || session?.user?.name || 'Х').charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{user?.full_name || session?.user?.name || 'Хэрэглэгч'}</p>
                  <p className="text-xs text-primary-100 truncate">{user?.email || session?.user?.email}</p>
                </div>
              </Link>
            ) : (
              <div className="relative pr-10">
                <p className="text-sm text-primary-100 mb-3">Тавтай морилно уу</p>
                <div className="flex gap-2">
                  <Link
                    href="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 text-center px-3 py-2 rounded-lg bg-white text-primary-700 text-sm font-semibold hover:bg-primary-50 transition-colors"
                  >
                    Нэвтрэх
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 text-center px-3 py-2 rounded-lg bg-white/15 text-white text-sm font-semibold hover:bg-white/25 transition-colors"
                  >
                    Бүртгүүлэх
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick action tiles */}
          <div className="grid grid-cols-3 gap-2 px-4 -mt-4 relative z-10">
            <Link
              href="/wishlist"
              onClick={() => setIsMenuOpen(false)}
              className="relative flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white shadow-md shadow-gray-200/60 border border-clay-gray hover:border-sale-200 active:scale-95 transition-all"
            >
              <Heart className="w-5 h-5 text-sale-500" />
              <span className="text-[11px] font-medium text-on-surface-variant">Хадгалсан</span>
              {mounted && wishlistItems > 0 && (
                <span className="absolute top-1.5 right-1.5 min-w-[16px] h-[16px] px-0.5 bg-sale-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {wishlistItems}
                </span>
              )}
            </Link>

            <Link
              href={isAuthenticated ? '/profile/orders' : '/auth/login'}
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white shadow-md shadow-gray-200/60 border border-clay-gray hover:border-primary-200 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-5 h-5 text-primary-600" />
              <span className="text-[11px] font-medium text-on-surface-variant">Захиалга</span>
            </Link>

            <Link
              href={isAuthenticated ? '/profile/settings' : '/auth/login'}
              onClick={() => setIsMenuOpen(false)}
              className="flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white shadow-md shadow-gray-200/60 border border-clay-gray hover:border-primary-200 active:scale-95 transition-all"
            >
              <Settings className="w-5 h-5 text-primary-600" />
              <span className="text-[11px] font-medium text-on-surface-variant">Тохиргоо</span>
            </Link>
          </div>

          {/* Categories */}
          <div className="px-5 pt-5 pb-1">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1">Ангилал</h3>
          </div>
          <div className="pb-2">
            {CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/category/${category.slug}`}
                className="flex items-center gap-3 px-5 py-3 text-sm font-medium text-on-surface-variant hover:bg-gray-50 active:bg-gray-100 group transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <span className="flex-1">{category.name}</span>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            ))}
          </div>

          {/* Divider */}
          <div className="mx-5 border-t border-clay-gray" />

          {/* Quick Links */}
          <div className="py-2">
            <Link
              href="/products"
              className="flex items-center gap-4 px-5 py-3.5 text-sm text-on-surface-variant hover:bg-gray-50 active:bg-gray-100 transition-colors group"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="p-2.5 rounded-lg bg-gray-100 group-hover:bg-gray-200 transition-colors flex-shrink-0">
                <Package className="w-5 h-5 text-on-surface-variant" />
              </div>
              <span className="flex-1">Бүх бараа</span>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              href="/products?sale=true"
              className="flex items-center gap-4 px-5 py-3.5 text-sm font-medium text-sale-600 hover:bg-sale-50 active:bg-sale-100 transition-colors group"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="p-2.5 rounded-lg bg-sale-100 group-hover:bg-sale-100/70 transition-colors flex-shrink-0">
                <Percent className="w-5 h-5 text-sale-500" />
              </div>
              <span className="flex-1">Хямдрал</span>
              <span className="ml-auto px-2 py-0.5 bg-sale-500 text-white text-[10px] font-bold rounded-full">HOT</span>
            </Link>

            {isAuthenticated && isAdmin && (
              <Link
                href="/admin"
                className="flex items-center gap-4 px-5 py-3.5 text-sm text-primary-700 font-medium hover:bg-primary-50 active:bg-primary-100 transition-colors group"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="p-2.5 rounded-lg bg-primary-600 flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="flex-1">Админ хэсэг</span>
                <ChevronRight className="w-4 h-4 text-primary-300 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all" />
              </Link>
            )}
          </div>

          {/* Logout */}
          {mounted && isAuthenticated && (
            <>
              <div className="mx-5 border-t border-clay-gray" />
              <div className="py-2">
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-4 px-5 py-3.5 text-sm text-sale-600 hover:bg-sale-50 active:bg-sale-100 transition-colors w-full group"
                >
                  <div className="p-2.5 rounded-lg bg-sale-100 group-hover:bg-sale-100/70 transition-colors flex-shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <span className="flex-1 text-left">Гарах</span>
                </button>
              </div>
            </>
          )}

          {/* Bottom spacer */}
          <div className="h-8" />
        </div>
      </div>,
      document.body
      )}
    </header>
  );
}
