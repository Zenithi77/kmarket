'use client';

import { useState } from 'react';
import { Shield, Bell, Eye, EyeOff, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    promotions: true,
    newsletter: false,
    sms: true
  });

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Шинэ нууц үг таарахгүй байна');
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Нууц үг солигдлоо');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="bg-white rounded-xl card-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Нууц үг солих</h2>
            <p className="text-sm text-gray-500">Аккаунтын аюулгүй байдлыг хангахын тулд хүчтэй нууц үг ашиглана уу</p>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div className="relative">
            <Input
              label="Одоогийн нууц үг"
              type={showCurrentPassword ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <div className="relative">
            <Input
              label="Шинэ нууц үг"
              type={showNewPassword ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              required
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <Input
            label="Шинэ нууц үг давтах"
            type="password"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
            required
          />

          <Button type="submit" disabled={loading}>
            {loading ? 'Хадгалж байна...' : 'Нууц үг солих'}
          </Button>
        </form>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl card-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Мэдэгдлийн тохиргоо</h2>
            <p className="text-sm text-gray-500">Хүлээн авах мэдэгдлүүдээ удирдана уу</p>
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium">Захиалгын мэдэгдэл</p>
              <p className="text-sm text-gray-500">Захиалгын статус өөрчлөгдөхөд мэдэгдэл авах</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.orderUpdates}
              onChange={() => handleNotificationChange('orderUpdates')}
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium">Хямдралын мэдээлэл</p>
              <p className="text-sm text-gray-500">Хямдрал, урамшууллын мэдээ авах</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.promotions}
              onChange={() => handleNotificationChange('promotions')}
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium">Мэдээллийн товхимол</p>
              <p className="text-sm text-gray-500">Долоо хоног бүр шинэ барааны мэдээ авах</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.newsletter}
              onChange={() => handleNotificationChange('newsletter')}
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>

          <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
            <div>
              <p className="font-medium">SMS мэдэгдэл</p>
              <p className="text-sm text-gray-500">Утсанд SMS мэдэгдэл авах</p>
            </div>
            <input
              type="checkbox"
              checked={notifications.sms}
              onChange={() => handleNotificationChange('sms')}
              className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
            />
          </label>
        </div>
      </div>

      {/* Delete Account */}
      <div className="bg-white rounded-xl card-shadow p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Аккаунт устгах</h2>
            <p className="text-sm text-gray-500">Энэ үйлдлийг буцаах боломжгүй</p>
          </div>
        </div>

        <p className="text-gray-600 mb-4">
          Аккаунтаа устгахад таны бүх мэдээлэл, захиалгын түүх устах болно. Энэ үйлдлийг буцаах боломжгүй.
        </p>

        <Button className="bg-red-500 hover:bg-red-600">
          Аккаунт устгах
        </Button>
      </div>
    </div>
  );
}
