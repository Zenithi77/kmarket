'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  FolderTree,
  GripVertical,
  Upload,
  X,
  Save
} from 'lucide-react';
import { Button, Modal, Input } from '@/components/ui';
import toast from 'react-hot-toast';

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  order: number;
  is_active: boolean;
  subcategories?: Category[];
}

const defaultCategory = {
  name: '',
  slug: '',
  icon: '',
  image: '',
  order: 0,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<{ data: Category | null } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string, name: string } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState(defaultCategory);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (error) {
      toast.error('Категори ачаалахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'icon' | 'image') => {
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
        setFormData(prev => ({ ...prev, [type]: data.url }));
        toast.success('Зураг оруулагдлаа');
      }
    } catch (error) {
      toast.error('Зураг оруулахад алдаа гарлаа');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '',
      image: category.image || '',
      order: category.order,
    });
    setEditModal({ data: category });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast.error('Нэр шаардлагатай');
      return;
    }

    try {
      const categoryId = editModal?.data?._id;
      const isEdit = !!categoryId;
      const url = '/api/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isEdit ? { ...formData, _id: categoryId } : formData),
      });

      if (res.ok) {
        toast.success(isEdit ? 'Категори шинэчлэгдлээ' : 'Категори нэмэгдлээ');
        setEditModal(null);
        setFormData(defaultCategory);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Алдаа гарлаа');
      }
    } catch (error) {
      toast.error('Алдаа гарлаа');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Категори устгагдлаа');
        fetchCategories();
      }
    } catch (error) {
      toast.error('Алдаа гарлаа');
    }
    setDeleteModal(null);
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Категори</h1>
          <p className="text-gray-500 mt-1">Нийт {categories.length} категори</p>
        </div>
        <Button onClick={() => {
          setFormData(defaultCategory);
          setEditModal({ data: null });
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Категори нэмэх
        </Button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="divide-y">
          {categories.map((category) => (
            <div key={category._id}>
              {/* Main Category */}
              <div className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <button className="p-1 hover:bg-gray-100 rounded cursor-move">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </button>

                {/* Icon/Image Preview */}
                <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
                  {category.icon ? (
                    <Image
                      src={category.icon}
                      alt={category.name}
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  ) : (
                    <FolderTree className="w-6 h-6 text-gray-400" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <span className="text-sm text-gray-500">/{category.slug}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Дараалал: {category.order}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ id: category._id, name: category.name })}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  {category.subcategories && category.subcategories.length > 0 && (
                    <button
                      onClick={() => toggleExpand(category._id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedCategories.includes(category._id) ? 'rotate-90' : ''
                      }`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories.includes(category._id) && category.subcategories && category.subcategories.length > 0 && (
                <div className="bg-gray-50 pl-20">
                  {category.subcategories.map((sub) => (
                    <div
                      key={sub._id}
                      className="flex items-center gap-4 p-3 border-t border-gray-100 hover:bg-gray-100"
                    >
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                        {sub.icon ? (
                          <Image
                            src={sub.icon}
                            alt={sub.name}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        ) : (
                          <FolderTree className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">{sub.name}</span>
                        <span className="text-sm text-gray-400 ml-2">/{sub.slug}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(sub)}
                          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ id: sub._id, name: sub.name })}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Категори байхгүй</h3>
            <p className="text-gray-500 mt-1">Эхний категорио нэмээрэй</p>
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal?.data ? 'Категори засах' : 'Шинэ категори'}
      >
        {editModal && (
          <form onSubmit={handleSave} className="space-y-4">
            {/* Icon Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon зураг (Утсанд харагдана)
              </label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  {formData.icon ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={formData.icon}
                        alt="Icon"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, icon: '' }))}
                        className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      {uploading ? (
                        <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-6 h-6 text-gray-400" />
                          <span className="text-xs text-gray-500 mt-1">Icon</span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'icon')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  <p>• Дөрвөлжин зураг (1:1)</p>
                  <p>• PNG эсвэл SVG</p>
                  <p>• Утсанд харагдана</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <Input
              label="Нэр"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
              }))}
              placeholder="Гоо сайхан"
              required
            />

            {/* Slug */}
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="goo-saikhan"
              required
            />

            {/* Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дараалал
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditModal(null)}>
                Болих
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Хадгалах
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Устгах"
      >
        {deleteModal && (
          <div className="space-y-4">
            <p className="text-gray-600">
              <strong>{deleteModal.name}</strong> категорийг устгахдаа итгэлтэй байна у|?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteModal(null)}>
                Болих
              </Button>
              <Button 
                onClick={() => handleDelete(deleteModal.id)}
                className="bg-red-500 hover:bg-red-600"
              >
                Устгах
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
