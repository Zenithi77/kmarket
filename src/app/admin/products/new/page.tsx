'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
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
  Play,
  Palette,
  Pipette,
  Ruler,
} from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import { SIZE_PRESETS, SIZE_TYPE_LABELS, COMMON_COLORS } from '@/lib/constants';
import toast from 'react-hot-toast';

interface MediaItem {
  url: string;
  type: 'image' | 'video';
  publicId?: string;
  uploading?: boolean;
  progress?: number;
  localPreview?: string;
}

interface ProductColor {
  name: string;
  hex: string;
}

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
}

type SizeType = 'none' | 'clothing' | 'shoes' | 'bags' | 'ring' | 'custom';

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sizeType, setSizeType] = useState<SizeType>('none');
  const [customSizeInput, setCustomSizeInput] = useState('');
  const [selectedColors, setSelectedColors] = useState<ProductColor[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColorHex, setCustomColorHex] = useState('#FF0000');
  const [customColorName, setCustomColorName] = useState('');
  const [categories, setCategories] = useState<CategoryOption[]>([]);
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

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          // Flatten parent + subcategories
          const flat: CategoryOption[] = [];
          data.forEach((cat: any) => {
            flat.push({ _id: cat._id, name: cat.name, slug: cat.slug });
            if (cat.subcategories) {
              cat.subcategories.forEach((sub: any) => {
                flat.push({ _id: sub._id, name: `  └ ${sub.name}`, slug: sub.slug });
              });
            }
          });
          setCategories(flat);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

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

  const handleSizeTypeChange = (type: SizeType) => {
    setSizeType(type);
    setSelectedSizes([]);
    setCustomSizeInput('');
  };

  const addCustomSize = () => {
    const trimmed = customSizeInput.trim();
    if (trimmed && !selectedSizes.includes(trimmed)) {
      setSelectedSizes(prev => [...prev, trimmed]);
      setCustomSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    setSelectedSizes(prev => prev.filter(s => s !== size));
  };

  const toggleCommonColor = (color: { name: string; hex: string }) => {
    const exists = selectedColors.find(c => c.hex === color.hex);
    if (exists) {
      setSelectedColors(prev => prev.filter(c => c.hex !== color.hex));
    } else {
      setSelectedColors(prev => [...prev, { name: color.name, hex: color.hex }]);
    }
  };

  const addCustomColor = () => {
    const name = customColorName.trim();
    if (!name) {
      toast.error('Өнгөний нэр оруулна уу');
      return;
    }
    if (selectedColors.find(c => c.hex.toLowerCase() === customColorHex.toLowerCase())) {
      toast.error('Энэ өнгө аль хэдийн нэмэгдсэн');
      return;
    }
    setSelectedColors(prev => [...prev, { name, hex: customColorHex }]);
    setCustomColorName('');
    setCustomColorHex('#FF0000');
    setShowColorPicker(false);
  };

  const removeColor = (hex: string) => {
    setSelectedColors(prev => prev.filter(c => c.hex !== hex));
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
        colors: selectedColors.length > 0 ? selectedColors : undefined,
        size_type: sizeType,
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

          {/* Colors */}
          <div className="bg-white rounded-xl card-shadow p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold">Өнгө</h2>
              </div>
              {selectedColors.length > 0 && (
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {selectedColors.length} өнгө сонгосон
                </span>
              )}
            </div>

            {/* Selected Colors */}
            {selectedColors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {selectedColors.map((color) => (
                  <div
                    key={color.hex}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50"
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-gray-300 shadow-inner"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="text-sm text-gray-700">{color.name}</span>
                    <button
                      type="button"
                      onClick={() => removeColor(color.hex)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Common Colors Grid */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Түгээмэл өнгөнүүд:</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_COLORS.map((color) => {
                  const isSelected = selectedColors.some(c => c.hex === color.hex);
                  return (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => toggleCommonColor(color)}
                      className={`group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      title={color.name}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      />
                      <span>{color.name}</span>
                      {isSelected && (
                        <span className="text-orange-500 text-[10px]">✓</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color */}
            <div>
              {!showColorPicker ? (
                <button
                  type="button"
                  onClick={() => setShowColorPicker(true)}
                  className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  <Pipette className="w-4 h-4" />
                  Өөр өнгө нэмэх
                </button>
              ) : (
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                  <p className="text-sm font-medium text-gray-700">Өнгө сонгох:</p>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <input
                        type="color"
                        value={customColorHex}
                        onChange={(e) => setCustomColorHex(e.target.value)}
                        className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        type="text"
                        value={customColorName}
                        onChange={(e) => setCustomColorName(e.target.value)}
                        placeholder="Өнгөний нэр (жнь: Тэнгэрийн цэнхэр)"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none"
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomColor())}
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customColorHex}
                          onChange={(e) => setCustomColorHex(e.target.value)}
                          className="w-28 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-mono focus:border-orange-500 outline-none"
                        />
                        <div
                          className="w-8 h-8 rounded-lg border border-gray-300"
                          style={{ backgroundColor: customColorHex }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={addCustomColor}
                      className="px-4 py-1.5 bg-orange-500 text-white text-sm rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      Нэмэх
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowColorPicker(false)}
                      className="px-4 py-1.5 text-gray-500 text-sm rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      Болих
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sizes */}
          <div className="bg-white rounded-xl card-shadow p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Ruler className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold">Хэмжээ</h2>
            </div>

            {/* Size Type Selector */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Хэмжээний төрөл:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(Object.keys(SIZE_TYPE_LABELS) as SizeType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleSizeTypeChange(type)}
                    className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      sizeType === type
                        ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    {SIZE_TYPE_LABELS[type]}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Options based on type */}
            {sizeType !== 'none' && sizeType !== 'custom' && SIZE_PRESETS[sizeType] && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Хэмжээ сонгох:</p>
                <div className="flex flex-wrap gap-2">
                  {SIZE_PRESETS[sizeType].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedSizes.includes(size)
                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-orange-400'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {selectedSizes.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    Сонгосон: {selectedSizes.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Custom Size Input */}
            {sizeType === 'custom' && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customSizeInput}
                    onChange={(e) => setCustomSizeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSize())}
                    placeholder="Хэмжээ оруулах (жнь: One Size, 160cm)"
                    className="flex-1 px-4 py-2 rounded-lg border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-100 outline-none text-sm"
                  />
                  <button
                    type="button"
                    onClick={addCustomSize}
                    className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {selectedSizes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSizes.map((size) => (
                      <div
                        key={size}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-sm text-orange-700"
                      >
                        {size}
                        <button
                          type="button"
                          onClick={() => removeSize(size)}
                          className="text-orange-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {sizeType === 'none' && (
              <p className="text-sm text-gray-400 italic">
                Хэмжээгүй бараа — хэрэв хэмжээ байгаа бол дээрх төрлөөс сонгоно уу
              </p>
            )}
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
                <option key={cat._id} value={cat._id}>{cat.name}</option>
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
