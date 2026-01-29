'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Upload, X, Save } from 'lucide-react';
import { Button, Input } from '@/components/ui';
import toast from 'react-hot-toast';

interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  bg_color: string;
  text_color: string;
  order: number;
  is_active: boolean;
}

const defaultBanner = {
  title: '',
  subtitle: '',
  description: '',
  image: '',
  link: '',
  bg_color: '#FEE2E2',
  text_color: '#F97316',
  order: 0,
  is_active: true,
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState(defaultBanner);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch('/api/banners');
      const data = await res.json();
      setBanners(data.banners || []);
    } catch (error) {
      toast.error('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.url) {
        setFormData(prev => ({ ...prev, image: data.url }));
        toast.success('Зураг оруулагдлаа');
      }
    } catch (error) {
      toast.error('Зураг оруулахад алдаа гарлаа');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.image) {
      toast.error('Гарчиг болон зураг шаардлагатай');
      return;
    }

    try {
      const url = editingBanner ? `/api/banners/${editingBanner._id}` : '/api/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success(editingBanner ? 'Banner шинэчлэгдлээ' : 'Banner нэмэгдлээ');
        setShowModal(false);
        setEditingBanner(null);
        setFormData(defaultBanner);
        fetchBanners();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Алдаа гарлаа');
      }
    } catch (error) {
      toast.error('Алдаа гарлаа');
    }
  };

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      description: banner.description || '',
      image: banner.image,
      link: banner.link || '',
      bg_color: banner.bg_color,
      text_color: banner.text_color,
      order: banner.order,
      is_active: banner.is_active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Banner устгах уу?')) return;

    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Banner устгагдлаа');
        fetchBanners();
      }
    } catch (error) {
      toast.error('Алдаа гарлаа');
    }
  };

  const toggleActive = async (banner: Banner) => {
    try {
      const res = await fetch(`/api/banners/${banner._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...banner, is_active: !banner.is_active }),
      });
      if (res.ok) {
        fetchBanners();
      }
    } catch (error) {
      toast.error('Алдаа гарлаа');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banner удирдлага</h1>
          <p className="text-gray-500">Нүүр хуудасны banner зургууд</p>
        </div>
        <Button onClick={() => {
          setEditingBanner(null);
          setFormData(defaultBanner);
          setShowModal(true);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Шинэ Banner
        </Button>
      </div>

      {/* Banners Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map((banner) => (
          <div
            key={banner._id}
            className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 ${
              banner.is_active ? 'border-green-200' : 'border-gray-200'
            }`}
          >
            {/* Banner Preview */}
            <div 
              className="relative h-48 overflow-hidden"
              style={{ backgroundColor: banner.bg_color }}
            >
              <Image
                src={banner.image}
                alt={banner.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-sm opacity-80">{banner.subtitle}</p>
                <h3 className="text-xl font-bold">{banner.title}</h3>
              </div>
              {!banner.is_active && (
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                  Идэвхгүй
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Дараалал: {banner.order}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(banner)}
                  className={`p-2 rounded-lg ${
                    banner.is_active ? 'text-green-600 bg-green-50' : 'text-gray-400 bg-gray-50'
                  }`}
                >
                  {banner.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleEdit(banner)}
                  className="p-2 text-blue-600 bg-blue-50 rounded-lg"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(banner._id)}
                  className="p-2 text-red-600 bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {banners.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900">Banner байхгүй</h3>
          <p className="text-gray-500 mt-1">Эхний banner-аа нэмээрэй</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingBanner ? 'Banner засах' : 'Шинэ Banner'}
              </h2>
              <button onClick={() => setShowModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Зураг *
                </label>
                {formData.image ? (
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 transition-colors"
                  >
                    {uploading ? (
                      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-gray-400 mb-2" />
                        <p className="text-gray-500">Зураг сонгох</p>
                      </>
                    )}
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              {/* Title & Subtitle */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Гарчиг *"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="K-BEAUTY"
                  required
                />
                <Input
                  label="Дэд гарчиг"
                  value={formData.subtitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                  placeholder="DEALS"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тайлбар
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Солонгос гоо сайхны бүтээгдэхүүн"
                  rows={2}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                />
              </div>

              {/* Link */}
              <Input
                label="Холбоос (URL)"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="/products"
              />

              {/* Colors */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Арын өнгө
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.bg_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, bg_color: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.bg_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, bg_color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Текстийн өнгө
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.text_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                      className="w-10 h-10 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.text_color}
                      onChange={(e) => setFormData(prev => ({ ...prev, text_color: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Дараалал
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Болих
                </Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {editingBanner ? 'Хадгалах' : 'Нэмэх'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
