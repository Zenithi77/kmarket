'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Camera, Mail, Phone, Users } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

interface UserProfile {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  gender: string;
  avatar: string;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    gender: '',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [mounted, status, router]);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserProfile();
    }
  }, [session]);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/auth/profile');
      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        setFormData({
          full_name: data.user.full_name || '',
          email: data.user.email || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          gender: data.user.gender || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Профайл шинэчлэгдлээ');
        fetchUserProfile();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Алдаа гарлаа');
      }
    } catch (error) {
      toast.error('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayName = formData.full_name || session?.user?.name || 'Хэрэглэгч';
  const displayEmail = formData.email || session?.user?.email || '';
  const displayInitial = displayName.charAt(0).toUpperCase();
  const genderLabel = formData.gender === 'male' ? 'Эрэгтэй' : 
                      formData.gender === 'female' ? 'Эмэгтэй' : 
                      formData.gender === 'other' ? 'Бусад' : '';

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl card-shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Хувийн мэдээлэл</h2>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b">
          <div className="relative">
            {session?.user?.image ? (
              <img 
                src={session.user.image} 
                alt={displayName}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <div className="w-24 h-24 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-3xl font-bold">
                  {displayInitial}
                </span>
              </div>
            )}
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-lg">{displayName}</h3>
            <p className="text-gray-500">{displayEmail}</p>
            {genderLabel && (
              <p className="text-sm text-gray-400 mt-1">
                <Users className="w-4 h-4 inline mr-1" />
                {genderLabel}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Бүтэн нэр"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имэйл
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  disabled
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <p className="text-xs text-gray-400 mt-1">Имэйл өөрчлөх боломжгүй</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Утасны дугаар
              </label>
              <div className="relative">
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="99001122"
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хүйс
              </label>
              <div className="relative">
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none appearance-none bg-white"
                >
                  <option value="">Сонгох</option>
                  <option value="male">Эрэгтэй</option>
                  <option value="female">Эмэгтэй</option>
                  <option value="other">Бусад</option>
                </select>
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Хаяг
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Хүргэлтийн хаяг"
              rows={2}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </div>
        </form>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl card-shadow p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">0</p>
          <p className="text-sm text-gray-500">Захиалга</p>
        </div>
        <div className="bg-white rounded-xl card-shadow p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">0₮</p>
          <p className="text-sm text-gray-500">Нийт зарцуулсан</p>
        </div>
        <div className="bg-white rounded-xl card-shadow p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">0</p>
          <p className="text-sm text-gray-500">Сэтгэгдэл</p>
        </div>
        <div className="bg-white rounded-xl card-shadow p-4 text-center">
          <p className="text-2xl font-bold text-orange-500">0</p>
          <p className="text-sm text-gray-500">Хадгалсан бараа</p>
        </div>
      </div>
    </div>
  );
}
