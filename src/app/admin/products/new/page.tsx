'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  Film,
  Loader2,
  Play
} from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import toast from 'react-hot-toast';

const categories = [
  { id: '1', name: 'Гоо сайхан' },
  { id: '2', name: 'Хувцас' },
  { id: '3', name: 'Гутал' },
  { id: '4', name: 'Dyson' },
  { id: '5', name: 'Trend' },
  { id: '6', name: 'Best' },
];

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  publicId?: string;
  uploading?: boolean;
  progress?: number;
  localPreview?: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const isVideoFile = (file: File) => file.type.startsWith('video/');

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const uploadSingleFile = useCallback(async (file: File, index: number) => {
    try {
      const isVideo = isVideoFile(file);
      const base64 = await fileToBase64(file);

      setMedia(prev => prev.map((m, i) =>
        i === index ? { ...m, uploading: true, progress: 30 } : m
      ));

      const body = isVideo
        ? { video: base64, type: 'video', folder: 'kmarket/products' }
        : { images: base64, folder: 'kmarket/products' };

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      setMedia(prev => prev.map((m, i) =>
        i === index ? { ...m, progress: 80 } : m
      ));

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();

      setMedia(prev => prev.map((m, i) =>
        i === index ? {
          url: data.url,
          type: isVideo ? 'video' : 'image',
          publicId: data.publicId,
          uploading: false,
          progress: 100,
        } : m
      ));
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Файл оруулахад алдаа гарлаа');
      setMedia(prev => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    for (const file of fileArray) {
      if (isVideoFile(file) && file.size > 100 * 1024 * 1024) {
        toast.error(`${file.name}: Бичлэг 100MB-аас бага байх ёстой`);
        return;
      }
      if (!isVideoFile(file) && file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name}: Зураг 10MB-аас бага байх ёстой`);
        return;
      }
    }

    const startIndex = media.length;
    const newItems: MediaItem[] = fileArray.map(file => ({
      url: '',
      type: isVideoFile(file) ? 'video' as const : 'image' as const,
      uploading: true,
      progress: 0,
      localPreview: URL.createObjectURL(file),
    }));

    setMedia(prev => [...prev, ...newItems]);

    for (let i = 0; i < fileArray.length; i++) {
      await uploadSingleFile(fileArray[i], startIndex + i);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeMedia = async (index: number) => {
    const item = media[index];

    if (item.publicId) {
      try {
        await fetch('/api/upload', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ publicId: item.publicId, type: item.type }),
        });
      } catch (error) {
        console.error('Delete error:', error);
      }
    }

    if (item.localPreview) URL.revokeObjectURL(item.localPreview);
    setMedia(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (media.some(m => m.uploading)) {
      toast.error('Файлууд оруулагдаж байна. Түр хүлээнэ үү.');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        price: Number(formData.price),
        sale_price: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        images: media.filter(m => m.url).map(m => m.url),
        sizes: selectedSizes,
        category_id: formData.category,
        brand: formData.brand,
        weight: formData.weight ? Number(formData.weight) : undefined,
        stock: Number(formData.stock) || 0,
        is_new: formData.isNew,
        is_featured: formData.isFeatured,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Алдаа гарлаа');
      }

      toast.success('Бараа амжилттай нэмэгдлээ');
      router.push('/admin/products');
    } catch (error: any) {
      toast.error(error.message || 'Алдаа гарлаа');
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

          {/* Media (Images & Videos) */}
          <div className="bg-white rounded-xl card-shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Зураг & Бичлэг</h2>
                <p className="text-sm text-gray-500 mt-1">Зураг (10MB хүртэл) болон бичлэг (100MB хүртэл)</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <ImageIcon className="w-4 h-4" />
                <span>{media.filter(m => m.type === 'image').length}</span>
                <Film className="w-4 h-4 ml-2" />
                <span>{media.filter(m => m.type === 'video').length}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden group border-2 border-gray-200"
                >
                  {item.type === 'video' ? (
                    <video
                      src={item.url || item.localPreview}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      loop
                      onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseLeave={(e) => {
                        const v = e.target as HTMLVideoElement;
                        v.pause();
                        v.currentTime = 0;
                      }}
                    />
                  ) : (
                    <img
                      src={item.url || item.localPreview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Upload progress overlay */}
                  {item.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                      <div className="w-3/4 bg-white/30 rounded-full h-1.5">
                        <div
                          className="bg-white rounded-full h-1.5 transition-all duration-500"
                          style={{ width: `${item.progress || 0}%` }}
                        />
                      </div>
                      <span className="text-white text-xs">{item.progress || 0}%</span>
                    </div>
                  )}

                  {/* Video badge */}
                  {item.type === 'video' && !item.uploading && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/70 text-white text-xs rounded-full flex items-center gap-1">
                      <Play className="w-3 h-3" />
                      Бичлэг
                    </div>
                  )}

                  {/* Remove button */}
                  {!item.uploading && (
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Main image badge */}
                  {index === 0 && !item.uploading && (
                    <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary-500 text-white text-xs rounded-lg font-medium">
                      Гол зураг
                    </span>
                  )}
                </div>
              ))}

              {/* Upload button */}
              <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all group">
                <Upload className="w-8 h-8 text-gray-400 mb-2 group-hover:text-primary-500 transition-colors" />
                <span className="text-sm text-gray-500 group-hover:text-primary-600 font-medium">Файл нэмэх</span>
                <span className="text-xs text-gray-400 mt-1">Зураг / Бичлэг</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleMediaUpload}
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
            <Button type="submit" className="flex-1" disabled={loading || media.some(m => m.uploading)}>
              {loading ? 'Хадгалж байна...' : media.some(m => m.uploading) ? 'Файл оруулж байна...' : 'Хадгалах'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
