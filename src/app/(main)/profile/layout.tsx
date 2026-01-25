'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Settings,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store';
import toast from 'react-hot-toast';

const sidebarItems = [
  { icon: User, label: 'Профайл', href: '/profile' },
  { icon: ShoppingBag, label: 'Захиалгууд', href: '/profile/orders' },
  { icon: Heart, label: 'Хадгалсан', href: '/wishlist' },
  { icon: MapPin, label: 'Хаягууд', href: '/profile/addresses' },
  { icon: Settings, label: 'Тохиргоо', href: '/profile/settings' },
];

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();
  const { logout: zustandLogout } = useAuthStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Clear Zustand store
      zustandLogout();
      
      // Clear localStorage
      localStorage.removeItem('token');
      
      // Sign out from NextAuth
      await signOut({ redirect: false });
      
      toast.success('Амжилттай гарлаа');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Гарахад алдаа гарлаа');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user display info
  const displayName = session?.user?.name || 'Хэрэглэгч';
  const displayEmail = session?.user?.email || '';
  const displayInitial = displayName.charAt(0).toUpperCase();
  const userImage = session?.user?.image;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl card-shadow p-6">
            {/* User Info */}
            <div className="text-center mb-6 pb-6 border-b">
              {mounted && userImage ? (
                <img 
                  src={userImage} 
                  alt={displayName}
                  className="w-20 h-20 rounded-full object-cover mx-auto mb-4"
                />
              ) : (
                <div className="w-20 h-20 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">{mounted ? displayInitial : 'Х'}</span>
                </div>
              )}
              <h2 className="font-bold text-gray-900">{mounted ? displayName : 'Ачааллаж байна...'}</h2>
              <p className="text-sm text-gray-500">{mounted ? displayEmail : ''}</p>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary-50 text-primary-500'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                );
              })}
              
              <button 
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut className="w-5 h-5" />
                )}
                <span className="font-medium">{isLoggingOut ? 'Гарж байна...' : 'Гарах'}</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
