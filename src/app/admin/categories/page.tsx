'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  ChevronDown,
  FolderTree,
  Upload,
  X,
  Save,
  Filter,
  Settings,
  Layers,
  Tag,
} from 'lucide-react';
import { Button, Modal, Input } from '@/components/ui';
import { CATEGORY_FILTERS, DEFAULT_SUBCATEGORIES } from '@/lib/constants';
import toast from 'react-hot-toast';

interface CategoryFilter {
  key: string;
  label: string;
  type: 'select' | 'multi-select' | 'range';
  options: string[];
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  order: number;
  is_active: boolean;
  filters?: CategoryFilter[];
  subcategories?: Category[];
}

const defaultSubCategory = {
  name: '',
  slug: '',
  icon: '',
  parent_id: '',
  order: 0,
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [subModal, setSubModal] = useState<{ parentId: string; parentSlug: string; data: Category | null } | null>(null);
  const [filterModal, setFilterModal] = useState<{ category: Category } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string; name: string; isParent: boolean } | null>(null);
  const [subFormData, setSubFormData] = useState(defaultSubCategory);
  const [uploading, setUploading] = useState(false);
  const [initializingSubcats, setInitializingSubcats] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch {
      toast.error('Категори ачаалахад алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  const handleExpand = (id: string) => {
    setExpandedCategory(prev => prev === id ? null : id);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.url) {
        setSubFormData(prev => ({ ...prev, icon: data.url }));
        toast.success('Зураг оруулагдлаа');
      }
    } catch {
      toast.error('Зураг оруулахад алдаа гарлаа');
    } finally {
      setUploading(false);
    }
  };

  const handleAddSubcategory = (parentId: string, parentSlug: string) => {
    setSubFormData({ ...defaultSubCategory, parent_id: parentId });
    setSubModal({ parentId, parentSlug, data: null });
  };

  const handleEditSubcategory = (parentId: string, parentSlug: string, sub: Category) => {
    setSubFormData({
      name: sub.name,
      slug: sub.slug,
      icon: sub.icon || '',
      parent_id: parentId,
      order: sub.order,
    });
    setSubModal({ parentId, parentSlug, data: sub });
  };

  const handleSaveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subFormData.name) {
      toast.error('Нэр оруулна уу');
      return;
    }
    try {
      const isEdit = !!subModal?.data;
      const res = await fetch('/api/categories', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isEdit
            ? { ...subFormData, _id: subModal!.data!._id }
            : { ...subFormData, parent_id: subModal!.parentId }
        ),
      });
      if (res.ok) {
        toast.success(isEdit ? 'Дэд ангилал шинэчлэгдлээ' : 'Дэд ангилал нэмэгдлээ');
        setSubModal(null);
        setSubFormData(defaultSubCategory);
        fetchCategories();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Алдаа гарлаа');
      }
    } catch {
      toast.error('Алдаа гарлаа');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/categories?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Устгагдлаа');
        fetchCategories();
      }
    } catch {
      toast.error('Алдаа гарлаа');
    }
    setDeleteModal(null);
  };

  const handleInitializeSubcategories = async (parentId: string, parentSlug: string) => {
    const defaults = DEFAULT_SUBCATEGORIES[parentSlug];
    if (!defaults || defaults.length === 0) {
      toast.error('Энэ категорид дэд ангилал тодорхойлогдоогүй');
      return;
    }
    setInitializingSubcats(parentId);
    let successCount = 0;
    for (const sub of defaults) {
      try {
        const res = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: sub.name,
            slug: sub.slug,
            parent_id: parentId,
            order: successCount,
          }),
        });
        if (res.ok) successCount++;
      } catch { /* skip duplicates */ }
    }
    toast.success(`${successCount} дэд ангилал нэмэгдлээ`);
    setInitializingSubcats(null);
    fetchCategories();
  };

  const handleSaveFilters = async (categoryId: string, filters: CategoryFilter[]) => {
    try {
      const res = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ _id: categoryId, filters }),
      });
      if (res.ok) {
        toast.success('Тохиргоо хадгалагдлаа');
        fetchCategories();
      }
    } catch {
      toast.error('Алдаа гарлаа');
    }
    setFilterModal(null);
  };

  const getCategoryEmoji = (slug: string) => {
    const icons: Record<string, string> = {
      beauty: '💄', fashion: '👗', shoes: '👟',
      dyson: '🔧', trendy: '🔥', best: '⭐',
    };
    return icons[slug] || '📦';
  };

  const getCategoryColor = (slug: string) => {
    const colors: Record<string, string> = {
      beauty: 'from-pink-500 to-rose-500',
      fashion: 'from-purple-500 to-indigo-500',
      shoes: 'from-blue-500 to-cyan-500',
      dyson: 'from-gray-600 to-gray-800',
      trendy: 'from-amber-500 to-orange-500',
      best: 'from-yellow-500 to-amber-500',
    };
    return colors[slug] || 'from-gray-500 to-gray-600';
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ангилал удирдлага</h1>
          <p className="text-gray-500 mt-1">
            {categories.length} үндсэн ангилал | Дэд ангилал, тохиргоо засварлана
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Layers className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-orange-800 font-medium">Ангилал бүтэц</p>
            <p className="text-sm text-orange-600 mt-1">
              6 үндсэн ангилал + дэд ангилал + шүүлт. Ангилал тусбүрд фильтерүүд (брэнд, материал, хэмжээс г.м) тохируулна.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((category) => {
          const isExpanded = expandedCategory === category._id;
          const subCount = category.subcategories?.length || 0;
          const filterCount = category.filters?.length || 0;
          const defaultFilters = CATEGORY_FILTERS[category.slug] || [];

          return (
            <div key={category._id} className="bg-white rounded-xl card-shadow overflow-hidden">
              <div
                className="flex items-center gap-4 p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleExpand(category._id)}
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${getCategoryColor(category.slug)} flex items-center justify-center text-2xl shadow-sm`}>
                  {category.icon ? (
                    <Image src={category.icon} alt={category.name} width={40} height={40} className="object-cover rounded-lg" />
                  ) : (
                    getCategoryEmoji(category.slug)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">{category.name}</h3>
                    <span className="text-xs text-gray-400 font-mono">/{category.slug}</span>
                  </div>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Tag className="w-3 h-3" />
                      {subCount} дэд ангилал
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                      <Filter className="w-3 h-3" />
                      {filterCount > 0 ? `${filterCount} фильтер` : `${defaultFilters.length} фильтер (default)`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setFilterModal({ category })}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Фильтер тохируулах"
                  >
                    <Settings className="w-4 h-4 text-blue-500" />
                  </button>
                  <button
                    onClick={() => handleAddSubcategory(category._id, category.slug)}
                    className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                    title="Дэд ангилал нэмэх"
                  >
                    <Plus className="w-4 h-4 text-green-500" />
                  </button>
                </div>

                <div className="p-1">
                  {isExpanded ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {isExpanded && (
                <div className="border-t bg-gray-50">
                  {subCount > 0 ? (
                    <div className="divide-y divide-gray-100">
                      {category.subcategories!.map((sub, idx) => (
                        <div
                          key={sub._id}
                          className="flex items-center gap-4 px-6 py-3 hover:bg-gray-100 transition-colors"
                        >
                          <span className="w-6 text-center text-xs text-gray-400 font-mono">{idx + 1}</span>
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                            {sub.icon ? (
                              <Image src={sub.icon} alt={sub.name} width={24} height={24} className="object-cover rounded" />
                            ) : (
                              <FolderTree className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-gray-800">{sub.name}</span>
                            <span className="text-xs text-gray-400 ml-2 font-mono">/{sub.slug}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleEditSubcategory(category._id, category.slug, sub)}
                              className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                              <Edit className="w-3.5 h-3.5 text-gray-500" />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ id: sub._id, name: sub.name, isParent: false })}
                              className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-6 py-8 text-center">
                      <FolderTree className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gray-500 mb-4">Дэд ангилал одоогоор байхгүй</p>
                      <div className="flex items-center justify-center gap-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddSubcategory(category._id, category.slug)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Дэд ангилал нэмэх
                        </Button>
                        {DEFAULT_SUBCATEGORIES[category.slug] && (
                          <Button
                            size="sm"
                            onClick={() => handleInitializeSubcategories(category._id, category.slug)}
                            disabled={initializingSubcats === category._id}
                          >
                            {initializingSubcats === category._id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                                Нэмэж байна...
                              </>
                            ) : (
                              <>
                                <Layers className="w-3 h-3 mr-1" />
                                Бэлэн загвараас нэмэх ({DEFAULT_SUBCATEGORIES[category.slug].length})
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}

                  {subCount > 0 && (
                    <div className="px-6 py-3 border-t border-gray-200">
                      <button
                        onClick={() => handleAddSubcategory(category._id, category.slug)}
                        className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Дэд ангилал нэмэх
                      </button>
                    </div>
                  )}

                  {(category.filters?.length || 0) > 0 && (
                    <div className="px-6 py-3 border-t border-gray-200 bg-blue-50/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Filter className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs font-medium text-blue-700">Тохируулсан фильтерүүд:</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {category.filters!.map((f) => (
                          <span
                            key={f.key}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-md border border-blue-200 text-xs text-blue-700"
                          >
                            {f.label}
                            <span className="text-blue-400">({f.options.length})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl card-shadow">
          <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Ангилал байхгүй</h3>
          <p className="text-gray-500 mb-6">Үндсэн 6 ангилал үүсгэгдэнэ</p>
          <p className="text-sm text-gray-400">Beauty, Fashion, Shoes, Dyson, Trendy, Best Sellers</p>
        </div>
      )}

      <Modal
        isOpen={!!subModal}
        onClose={() => setSubModal(null)}
        title={subModal?.data ? 'Дэд ангилал засах' : 'Шинэ дэд ангилал'}
      >
        {subModal && (
          <form onSubmit={handleSaveSubcategory} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Icon зураг</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300">
                  {subFormData.icon ? (
                    <div className="relative w-full h-full">
                      <Image src={subFormData.icon} alt="Icon" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setSubFormData(prev => ({ ...prev, icon: '' }))}
                        className="absolute -top-1 -right-1 p-0.5 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer flex flex-col items-center">
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5 text-gray-400" />
                      )}
                      <input type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <Input
              label="Нэр"
              value={subFormData.name}
              onChange={(e) => setSubFormData(prev => ({
                ...prev,
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
              }))}
              placeholder="Жнь: Уруулын будаг"
              required
            />

            <Input
              label="Slug"
              value={subFormData.slug}
              onChange={(e) => setSubFormData(prev => ({ ...prev, slug: e.target.value }))}
              placeholder="lipstick"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Дараалал</label>
              <input
                type="number"
                value={subFormData.order}
                onChange={(e) => setSubFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-orange-500 outline-none"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setSubModal(null)}>Болих</Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Хадгалах
              </Button>
            </div>
          </form>
        )}
      </Modal>

      <Modal
        isOpen={!!filterModal}
        onClose={() => setFilterModal(null)}
        title={`${filterModal?.category?.name || ''} - Фильтер тохиргоо`}
      >
        {filterModal && (
          <FilterConfigForm
            category={filterModal.category}
            onSave={(filters) => handleSaveFilters(filterModal.category._id, filters)}
            onClose={() => setFilterModal(null)}
          />
        )}
      </Modal>

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Устгах"
      >
        {deleteModal && (
          <div className="space-y-4">
            <p className="text-gray-600">
              <strong>{deleteModal.name}</strong>-г устгахдаа итгэлтэй байна уу?
              {deleteModal.isParent && ' Бүх дэд ангилал мөн устгагдана.'}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteModal(null)}>Болих</Button>
              <Button onClick={() => handleDelete(deleteModal.id)} className="bg-red-500 hover:bg-red-600">
                Устгах
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function FilterConfigForm({
  category,
  onSave,
  onClose,
}: {
  category: Category;
  onSave: (filters: CategoryFilter[]) => void;
  onClose: () => void;
}) {
  const defaultFilters = CATEGORY_FILTERS[category.slug] || [];
  const [filters, setFilters] = useState<CategoryFilter[]>(
    category.filters && category.filters.length > 0 ? category.filters : defaultFilters
  );
  const [newOption, setNewOption] = useState('');
  const [editingFilterIdx, setEditingFilterIdx] = useState<number | null>(null);

  const addFilter = () => {
    setFilters(prev => [
      ...prev,
      { key: `custom_${Date.now()}`, label: '', type: 'select' as const, options: [] },
    ]);
    setEditingFilterIdx(filters.length);
  };

  const removeFilter = (idx: number) => {
    setFilters(prev => prev.filter((_, i) => i !== idx));
    if (editingFilterIdx === idx) setEditingFilterIdx(null);
  };

  const updateFilter = (idx: number, updates: Partial<CategoryFilter>) => {
    setFilters(prev => prev.map((f, i) => i === idx ? { ...f, ...updates } : f));
  };

  const addOption = (idx: number) => {
    if (!newOption.trim()) return;
    setFilters(prev => prev.map((f, i) =>
      i === idx ? { ...f, options: [...f.options, newOption.trim()] } : f
    ));
    setNewOption('');
  };

  const removeOption = (filterIdx: number, optIdx: number) => {
    setFilters(prev => prev.map((f, i) =>
      i === filterIdx ? { ...f, options: f.options.filter((_, oi) => oi !== optIdx) } : f
    ));
  };

  const resetToDefaults = () => {
    setFilters(defaultFilters);
    toast.success('Анхдагч утгаар сэргээгдлээ');
  };

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto">
      <div className="bg-blue-50 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          Энэ хэсэгтээ фильтерүүдийг тохируулна. Шинэ фильтер нэмэх буюу одоо байгаа фильтер засварлах.
          Хэрэглэгч бүтээгдэхүүн шүүхэд ашиглана.
        </p>
      </div>

      {filters.map((filter, idx) => (
        <div
          key={filter.key + idx}
          className={`border rounded-lg p-4 transition-colors ${
            editingFilterIdx === idx ? 'border-orange-300 bg-orange-50/30' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              {editingFilterIdx === idx ? (
                <input
                  type="text"
                  value={filter.label}
                  onChange={(e) => updateFilter(idx, { label: e.target.value })}
                  placeholder="Фильтерийн нэр"
                  className="px-2 py-1 border border-gray-200 rounded text-sm focus:border-orange-500 outline-none"
                />
              ) : (
                <span className="font-medium text-gray-800">{filter.label || 'Нэргүй'}</span>
              )}
              <span className="text-xs text-gray-400 font-mono">{filter.key}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setEditingFilterIdx(editingFilterIdx === idx ? null : idx)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <Edit className="w-3.5 h-3.5 text-gray-500" />
              </button>
              <button
                type="button"
                onClick={() => removeFilter(idx)}
                className="p-1 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          </div>

          {editingFilterIdx === idx && (
            <div className="mb-3">
              <label className="text-xs text-gray-500 mb-1 block">Төрөл:</label>
              <select
                value={filter.type}
                onChange={(e) => updateFilter(idx, { type: e.target.value as CategoryFilter['type'] })}
                className="px-2 py-1 border border-gray-200 rounded text-sm focus:border-orange-500 outline-none"
              >
                <option value="select">Нэг сонголт</option>
                <option value="multi-select">Олон сонголт</option>
                <option value="range">Хүрээ</option>
              </select>
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {filter.options.map((opt, optIdx) => (
              <span
                key={optIdx}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded text-xs text-gray-700"
              >
                {opt}
                {editingFilterIdx === idx && (
                  <button type="button" onClick={() => removeOption(idx, optIdx)} className="text-red-400 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </span>
            ))}
          </div>

          {editingFilterIdx === idx && (
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addOption(idx); } }}
                placeholder="Утга оруулах..."
                className="flex-1 px-2 py-1 border border-gray-200 rounded text-sm focus:border-orange-500 outline-none"
              />
              <button
                type="button"
                onClick={() => addOption(idx)}
                className="px-3 py-1 bg-orange-500 text-white text-sm rounded hover:bg-orange-600"
              >
                Нэмэх
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="flex items-center justify-between pt-2">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={addFilter}
            className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            <Plus className="w-4 h-4" />
            Фильтер нэмэх
          </button>
          {defaultFilters.length > 0 && (
            <button
              type="button"
              onClick={resetToDefaults}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Анхдагч утгаар
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onClose}>Болих</Button>
        <Button onClick={() => onSave(filters)}>
          <Save className="w-4 h-4 mr-2" />
          Тохиргоо хадгалах
        </Button>
      </div>
    </div>
  );
}
