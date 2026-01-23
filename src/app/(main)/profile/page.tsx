'use client';

import { useState } from 'react';
import { Camera, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'Батболд',
    lastName: 'Ганзориг',
    email: 'batbold@gmail.com',
    phone: '99112233',
    birthDate: '1995-05-15',
    gender: 'male'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Профайл шинэчлэгдлээ');
    } catch (error) {
      toast.error('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl card-shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Хувийн мэдээлэл</h2>

        {/* Avatar */}
        <div className="flex items-center gap-6 mb-8 pb-8 border-b">
          <div className="relative">
            <div className="w-24 h-24 bg-primary-500 rounded-full flex items-center justify-center">
              <span className="text-white text-3xl font-bold">
                {formData.firstName.charAt(0)}
              </span>
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
              <Camera className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h3 className="font-semibold text-lg">
              {formData.firstName} {formData.lastName}
            </h3>
            <p className="text-gray-500">{formData.email}</p>
            <p className="text-sm text-gray-400 mt-1">
              <Calendar className="w-4 h-4 inline mr-1" />
              2024-01-01-ээс хойш гишүүн
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Овог"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            <Input
              label="Нэр"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Имэйл
              </label>
              <div className="relative">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                />
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Төрсөн өдөр"
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Хүйс
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              >
                <option value="male">Эрэгтэй</option>
                <option value="female">Эмэгтэй</option>
                <option value="other">Бусад</option>
              </select>
            </div>
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
          <p className="text-2xl font-bold text-primary-500">12</p>
          <p className="text-sm text-gray-500">Захиалга</p>
        </div>
        <div className="bg-white rounded-xl card-shadow p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">4,580,000₮</p>
          <p className="text-sm text-gray-500">Нийт зарцуулсан</p>
        </div>
        <div className="bg-white rounded-xl card-shadow p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">8</p>
          <p className="text-sm text-gray-500">Сэтгэгдэл</p>
        </div>
        <div className="bg-white rounded-xl card-shadow p-4 text-center">
          <p className="text-2xl font-bold text-primary-500">5</p>
          <p className="text-sm text-gray-500">Хадгалсан бараа</p>
        </div>
      </div>
    </div>
  );
}
