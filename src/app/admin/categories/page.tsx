'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  FolderTree,
  GripVertical
} from 'lucide-react';
import { Button, Modal, Input } from '@/components/ui';

// Mock categories data
const mockCategories = [
  {
    id: '1',
    name: 'Гоо сайхан',
    slug: 'beauty',
    description: 'Гоо сайхны бүтээгдэхүүнүүд',
    productsCount: 156,
    image: '/categories/beauty.jpg',
    subcategories: [
      { id: '1-1', name: 'Нүүр будалт', slug: 'makeup', productsCount: 45 },
      { id: '1-2', name: 'Арьс арчилгаа', slug: 'skincare', productsCount: 68 },
      { id: '1-3', name: 'Үс арчилгаа', slug: 'haircare', productsCount: 43 },
    ]
  },
  {
    id: '2',
    name: 'Хувцас',
    slug: 'fashion',
    description: 'Эмэгтэй, эрэгтэй хувцас',
    productsCount: 234,
    image: '/categories/fashion.jpg',
    subcategories: [
      { id: '2-1', name: 'Эмэгтэй', slug: 'women', productsCount: 145 },
      { id: '2-2', name: 'Эрэгтэй', slug: 'men', productsCount: 89 },
    ]
  },
  {
    id: '3',
    name: 'Гутал',
    slug: 'shoes',
    description: 'Спорт болон энгийн гутал',
    productsCount: 189,
    image: '/categories/shoes.jpg',
    subcategories: [
      { id: '3-1', name: 'Спорт гутал', slug: 'sports', productsCount: 98 },
      { id: '3-2', name: 'Энгийн гутал', slug: 'casual', productsCount: 91 },
    ]
  },
  {
    id: '4',
    name: 'Dyson',
    slug: 'dyson',
    description: 'Dyson брэндийн бүтээгдэхүүн',
    productsCount: 24,
    image: '/categories/dyson.jpg',
    subcategories: [
      { id: '4-1', name: 'Үс хатаагч', slug: 'hairdryer', productsCount: 8 },
      { id: '4-2', name: 'Тоос сорогч', slug: 'vacuum', productsCount: 10 },
      { id: '4-3', name: 'Агаар цэвэршүүлэгч', slug: 'airpurifier', productsCount: 6 },
    ]
  },
  {
    id: '5',
    name: 'Trend',
    slug: 'trendy',
    description: 'Хамгийн эрэлттэй бараанууд',
    productsCount: 78,
    image: '/categories/trend.jpg',
    subcategories: []
  },
  {
    id: '6',
    name: 'Best',
    slug: 'best',
    description: 'Шилдэг борлуулалттай',
    productsCount: 56,
    image: '/categories/best.jpg',
    subcategories: []
  }
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [editModal, setEditModal] = useState<{ type: 'category' | 'subcategory', data: any } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string, name: string } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleExpand = (id: string) => {
    setExpandedCategories(prev => 
      prev.includes(id) 
        ? prev.filter(x => x !== id) 
        : [...prev, id]
    );
  };

  const handleSave = (data: any) => {
    console.log('Save:', data);
    setEditModal(null);
  };

  const handleDelete = (id: string) => {
    console.log('Delete:', id);
    setDeleteModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Категори</h1>
          <p className="text-gray-500 mt-1">Нийт {categories.length} категори</p>
        </div>
        <Button onClick={() => setEditModal({ type: 'category', data: null })}>
          <Plus className="w-4 h-4 mr-2" />
          Категори нэмэх
        </Button>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="divide-y">
          {categories.map((category) => (
            <div key={category.id}>
              {/* Main Category */}
              <div className="flex items-center gap-4 p-4 hover:bg-gray-50">
                <button className="p-1 hover:bg-gray-100 rounded cursor-move">
                  <GripVertical className="w-5 h-5 text-gray-400" />
                </button>

                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FolderTree className="w-6 h-6 text-gray-400" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <span className="text-sm text-gray-500">/{category.slug}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                </div>

                <div className="text-right">
                  <p className="font-medium">{category.productsCount}</p>
                  <p className="text-sm text-gray-500">бараа</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditModal({ type: 'category', data: category })}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setDeleteModal({ id: category.id, name: category.name })}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                  {category.subcategories.length > 0 && (
                    <button
                      onClick={() => toggleExpand(category.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedCategories.includes(category.id) ? 'rotate-90' : ''
                      }`} />
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories.includes(category.id) && category.subcategories.length > 0 && (
                <div className="bg-gray-50 pl-16">
                  {category.subcategories.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center gap-4 p-3 border-t border-gray-100 hover:bg-gray-100"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">{sub.name}</span>
                        <span className="text-sm text-gray-400 ml-2">/{sub.slug}</span>
                      </div>
                      <span className="text-sm text-gray-500">{sub.productsCount} бараа</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditModal({ type: 'subcategory', data: sub })}
                          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
                        >
                          <Edit className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setDeleteModal({ id: sub.id, name: sub.name })}
                          className="p-1.5 hover:bg-red-100 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => setEditModal({ type: 'subcategory', data: { parentId: category.id } })}
                    className="flex items-center gap-2 w-full p-3 border-t border-gray-100 text-primary-500 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm font-medium">Дэд категори нэмэх</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Edit/Add Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal?.data ? 'Засах' : 'Шинээр нэмэх'}
      >
        {editModal && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave({}); }} className="space-y-4">
            <Input
              label="Нэр"
              defaultValue={editModal.data?.name || ''}
              placeholder="Категорийн нэр"
              required
            />
            <Input
              label="Slug"
              defaultValue={editModal.data?.slug || ''}
              placeholder="url-friendly-name"
              required
            />
            {editModal.type === 'category' && (
              <>
                <Input
                  label="Тайлбар"
                  defaultValue={editModal.data?.description || ''}
                  placeholder="Категорийн тайлбар"
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Зураг
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                    <p className="text-sm text-gray-500">Зураг оруулах</p>
                  </div>
                </div>
              </>
            )}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setEditModal(null)}>
                Болих
              </Button>
              <Button type="submit">
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
              <strong>{deleteModal.name}</strong> категорийг устгахдаа итгэлтэй байна уу?
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
