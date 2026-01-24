'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Edit,
  Trash2,
  Calendar,
  Percent,
  Tag,
  Copy
} from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/constants';
import { Button, Modal, Input } from '@/components/ui';

// Mock discounts data
const mockDiscounts = [
  {
    id: '1',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minPurchase: 50000,
    maxDiscount: 100000,
    usageLimit: 100,
    usedCount: 45,
    startDate: '2024-01-01',
    endDate: '2024-02-28',
    isActive: true
  },
  {
    id: '2',
    code: 'NEWYEAR2024',
    type: 'percentage',
    value: 20,
    minPurchase: 100000,
    maxDiscount: 200000,
    usageLimit: 50,
    usedCount: 50,
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    isActive: false
  },
  {
    id: '3',
    code: 'SHIP0',
    type: 'fixed',
    value: 5000,
    minPurchase: 30000,
    maxDiscount: null,
    usageLimit: null,
    usedCount: 234,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    isActive: true
  },
  {
    id: '4',
    code: 'VIP50',
    type: 'percentage',
    value: 50,
    minPurchase: 500000,
    maxDiscount: 500000,
    usageLimit: 10,
    usedCount: 3,
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    isActive: true
  }
];

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState(mockDiscounts);
  const [editModal, setEditModal] = useState<any>(null);
  const [deleteModal, setDeleteModal] = useState<{ id: string, code: string } | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
  };

  const handleSave = (data: any) => {
    console.log('Save:', data);
    setEditModal(null);
  };

  const handleDelete = (id: string) => {
    console.log('Delete:', id);
    setDeleteModal(null);
  };

  const toggleActive = (id: string) => {
    setDiscounts(prev => prev.map(d => 
      d.id === id ? { ...d, isActive: !d.isActive } : d
    ));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Хямдрал & Купон</h1>
          <p className="text-gray-500 mt-1">Нийт {discounts.length} хямдралын код</p>
        </div>
        <Button onClick={() => setEditModal({})}>
          <Plus className="w-4 h-4 mr-2" />
          Код нэмэх
        </Button>
      </div>

      {/* Discounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {discounts.map((discount) => (
          <div
            key={discount.id}
            className={`bg-white rounded-xl card-shadow p-6 relative overflow-hidden ${
              !discount.isActive ? 'opacity-60' : ''
            }`}
          >
            {/* Status Badge */}
            <div className="absolute top-4 right-4">
              <button
                onClick={() => toggleActive(discount.id)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  discount.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {discount.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}
              </button>
            </div>

            {/* Discount Info */}
            <div className="flex items-start gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                discount.type === 'percentage' 
                  ? 'bg-primary-100'
                  : 'bg-blue-100'
              }`}>
                {discount.type === 'percentage' ? (
                  <Percent className="w-7 h-7 text-primary-500" />
                ) : (
                  <Tag className="w-7 h-7 text-blue-500" />
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-gray-900">{discount.code}</h3>
                  <button
                    onClick={() => copyCode(discount.code)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                
                <p className="text-2xl font-bold text-primary-500 mt-1">
                  {discount.type === 'percentage' 
                    ? `${discount.value}%`
                    : formatPrice(discount.value)
                  }
                  <span className="text-sm font-normal text-gray-500 ml-2">хямдрал</span>
                </p>
              </div>
            </div>

            {/* Details */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Хамгийн бага дүн</p>
                <p className="font-medium">{formatPrice(discount.minPurchase)}</p>
              </div>
              {discount.maxDiscount && (
                <div>
                  <p className="text-gray-500">Хамгийн их хямдрал</p>
                  <p className="font-medium">{formatPrice(discount.maxDiscount)}</p>
                </div>
              )}
              <div>
                <p className="text-gray-500">Хэрэглэсэн</p>
                <p className="font-medium">
                  {discount.usedCount}
                  {discount.usageLimit && ` / ${discount.usageLimit}`}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Хугацаа</p>
                <p className="font-medium">
                  {discount.startDate} - {discount.endDate}
                </p>
              </div>
            </div>

            {/* Progress bar for usage */}
            {discount.usageLimit && (
              <div className="mt-4">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${(discount.usedCount / discount.usageLimit) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setEditModal(discount)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 text-gray-500" />
              </button>
              <button
                onClick={() => setDeleteModal({ id: discount.id, code: discount.code })}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal?.id ? 'Код засах' : 'Шинэ код нэмэх'}
      >
        {editModal && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave({}); }} className="space-y-4">
            <Input
              label="Хямдралын код"
              defaultValue={editModal.code || ''}
              placeholder="WELCOME10"
              required
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Төрөл
              </label>
              <select
                defaultValue={editModal.type || 'percentage'}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
              >
                <option value="percentage">Хувиар (%)</option>
                <option value="fixed">Тогтмол дүн (₮)</option>
              </select>
            </div>

            <Input
              label="Хямдралын хэмжээ"
              type="number"
              defaultValue={editModal.value || ''}
              placeholder="10"
              required
            />

            <Input
              label="Хамгийн бага худалдан авалт (₮)"
              type="number"
              defaultValue={editModal.minPurchase || ''}
              placeholder="50000"
            />

            <Input
              label="Хамгийн их хямдрал (₮)"
              type="number"
              defaultValue={editModal.maxDiscount || ''}
              placeholder="100000"
            />

            <Input
              label="Хэрэглэх тоо хязгаар"
              type="number"
              defaultValue={editModal.usageLimit || ''}
              placeholder="Хязгааргүй бол хоосон"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Эхлэх огноо"
                type="date"
                defaultValue={editModal.startDate || ''}
                required
              />
              <Input
                label="Дуусах огноо"
                type="date"
                defaultValue={editModal.endDate || ''}
                required
              />
            </div>

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
        title="Код устгах"
      >
        {deleteModal && (
          <div className="space-y-4">
            <p className="text-gray-600">
              <strong>{deleteModal.code}</strong> кодыг устгахдаа итгэлтэй байна уу?
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
