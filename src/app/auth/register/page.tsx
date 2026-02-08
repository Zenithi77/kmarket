'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Eye, EyeOff, User, Mail, Phone, Lock, Check, ArrowLeft, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const passwordRequirements = [
    { label: '8-аас дээш тэмдэгт', met: formData.password.length >= 8 },
    { label: 'Том үсэг агуулсан', met: /[A-Z]/.test(formData.password) },
    { label: 'Тоо агуулсан', met: /[0-9]/.test(formData.password) },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Нэр оруулна уу';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'И-мэйл оруулна уу';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'И-мэйл буруу байна';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Утасны дугаар оруулна уу';
    } else if (!/^[89]\d{7}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Утасны дугаар буруу байна';
    }

    if (!formData.password) {
      newErrors.password = 'Нууц үг оруулна уу';
    } else if (!passwordRequirements.every(r => r.met)) {
      newErrors.password = 'Нууц үг шаардлага хангахгүй байна';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Нууц үг таарахгүй байна';
    }

    if (!agreeTerms) {
      newErrors.agreeTerms = 'Үйлчилгээний нөхцлийг зөвшөөрнө үү';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          full_name: formData.full_name,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('бүртгэлтэй')) {
          toast.error('Энэ и-мэйл бүртгэлтэй байна');
        } else {
          toast.error(data.error || 'Бүртгэх үед алдаа гарлаа');
        }
        return;
      }

      toast.success('Бүртгэл амжилттай! Одоо нэвтэрнэ үү.');
      router.push('/auth/login');
    } catch (error) {
      console.error('Register error:', error);
      toast.error('Алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn('google', { callbackUrl: '/auth/complete-profile' });
    } catch (error) {
      console.error('Google signup error:', error);
      toast.error('Google бүртгүүлэхэд алдаа гарлаа');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 flex items-center justify-center p-4 py-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-100 rounded-full opacity-10 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back to Store */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-500 mb-6 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Дэлгүүр рүү буцах</span>
        </Link>

        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-200">
              <span className="text-white font-black text-3xl">K</span>
            </div>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-4">Бүртгүүлэх</h1>
          <p className="text-gray-500 mt-1">Шинэ бүртгэл үүсгэнэ үү</p>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-white">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Бүтэн нэр
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-all ${
                    errors.full_name ? 'border-red-400 bg-red-50' : 'border-transparent'
                  }`}
                  placeholder="Таны нэр"
                />
              </div>
              {errors.full_name && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.full_name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                И-мэйл
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-all ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-transparent'
                  }`}
                  placeholder="example@email.com"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Утасны дугаар
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-all ${
                    errors.phone ? 'border-red-400 bg-red-50' : 'border-transparent'
                  }`}
                  placeholder="99001122"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.phone}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Нууц үг
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-all ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-transparent'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.password}
                </p>
              )}
              
              {/* Password requirements */}
              <div className="mt-3 p-3 bg-gray-50 rounded-xl space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${req.met ? 'bg-green-100' : 'bg-gray-200'}`}>
                      <Check className={`w-3 h-3 ${req.met ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <span className={req.met ? 'text-green-600 font-medium' : 'text-gray-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Нууц үг давтах
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 rounded-xl focus:outline-none focus:bg-white focus:border-orange-500 transition-all ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-transparent'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-5 h-5 mt-0.5 text-orange-500 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <span className="text-sm text-gray-600">
                  <Link href="/terms" className="text-orange-500 hover:text-orange-600 font-medium">Үйлчилгээний нөхцөл</Link>
                  {' '}болон{' '}
                  <Link href="/privacy" className="text-orange-500 hover:text-orange-600 font-medium">Нууцлалын бодлого</Link>
                  -г зөвшөөрч байна
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-red-500 text-sm mt-1.5 flex items-center gap-1 ml-8">
                  <span className="w-1 h-1 bg-red-500 rounded-full" />
                  {errors.agreeTerms}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-semibold hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:scale-[1.02] active:scale-[0.98] mt-6"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Бүртгүүлэх'
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-400">эсвэл</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border-2 border-gray-100 rounded-xl hover:bg-gray-50 hover:border-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                <span className="text-sm font-medium text-gray-700">Google-ээр бүртгүүлэх</span>
              </button>
            </div>
          </div>

          <p className="text-center text-gray-500 mt-8 text-sm">
            Бүртгэлтэй юу?{' '}
            <Link href="/auth/login" className="text-orange-500 font-semibold hover:text-orange-600">
              Нэвтрэх
            </Link>
          </p>
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-6">
          <Link 
            href="/products" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-orange-500 text-sm transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Дэлгүүрээр үзэх</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
