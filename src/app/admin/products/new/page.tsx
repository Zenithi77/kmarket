'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  GripVertical,
  Image as ImageIcon
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

const categories = [
  { id: '1', name: 'Гоо сайхан' },
  { id: '2', name: 'Хувцас' },
  { id: '3', name: 'Гутал' },
  { id: '4', name: 'Dyson' },
  { id: '5', name: 'Trend' },
  { id: '6', name: 'Best' },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    originalPrice: '',
    category: '',
    brand: '',
    weight: '',
    stock: '',
    sku: '',
    tags: '',
    isNew: false,
    isFeatured: false,
    isOnSale: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setFormData(prev => ({ ...prev, slug }));
    }
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In real app, upload to storage and get URLs
      Array.from(files).forEach(file => {
        const url = URL.createObjectURL(file);
        setImages(prev => [...prev, url]);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // API call to create product
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Product data:', {
        ...formData,
        images,
        sizes: selectedSizes,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : null,
        stock: Number(formData.stock),
        weight: formData.weight ? Number(formData.weight) : null
      });

      router.push('/admin/products');
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Шинэ бараа нэмэх</h1>
          <p className="text-gray-500 mt-1">Бүтээгдэхүүний мэдээллийг оруулна уу</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl card-shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Үндсэн мэдээлэл</h2>
            
            <Input
              label="Барааны нэр"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Жнь: Dyson Airwrap Complete"
              required
            />

            <Input
              label="Slug (URL)"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              placeholder="dyson-airwrap-complete"
              required
            />

            <Textarea
              label="Тайлбар"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Барааны дэлгэрэнгүй тайлбар..."
              rows={5}
            />
          </div>

          {/* Images */}
          <div className="bg-white rounded-xl card-shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Зурагнууд</h2>
            <p className="text-sm text-gray-500">10-20 зураг оруулахыг зөвлөж байна</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden group">
                  <img src={image} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs rounded">
                      Гол зураг
                    </span>
                  )}
                </div>
              ))}
              
              <label className="aspect-square border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-500">Зураг нэмэх</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-xl card-shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Үнэ</h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Үнэ (₮)"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                required
              />
              <Input
                label="Хуучин үнэ (₮)"
                name="originalPrice"
                type="number"
                value={formData.originalPrice}
                onChange={handleChange}
                placeholder="Хямдралтай бол"
              />
            </div>
          </div>

          {/* Sizes */}
          <div className="bg-white rounded-xl card-shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Хэмжээ</h2>

            <div className="flex flex-wrap gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    selectedSizes.includes(size)
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-primary-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-white rounded-xl card-shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Статус</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isNew"
                  checked={formData.isNew}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm">Шинэ бараа</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm">Онцлох бараа</span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isOnSale"
                  checked={formData.isOnSale}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm">Хямдралтай</span>
              </label>
            </div>
          </div>

          {/* Category */}
          <div className="bg-white rounded-xl card-shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Категори</h2>

            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              required
            >
              <option value="">Сонгоно уу</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Brand & SKU */}
          <div className="bg-white rounded-xl card-shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold">Бусад мэдээлэл</h2>

            <Input
              label="Брэнд"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              placeholder="Жнь: Dyson, Nike"
            />

            <Input
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              placeholder="DYSON-001"
            />

            <Input
              label="Жин (грамм)"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              placeholder="500"
            />

            <Input
              label="Нөөц"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              placeholder="0"
              required
            />

            <Input
              label="Tags"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="tag1, tag2, tag3"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => router.push('/admin/products')}
            >
              Болих
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'Хадгалж байна...' : 'Хадгалах'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
