'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, MapPin, Check } from 'lucide-react';
import { Button, Modal, Input } from '@/components/ui';

// Mock addresses
const mockAddresses = [
  {
    id: '1',
    name: 'Гэр',
    recipient: 'Батболд Ганзориг',
    phone: '99112233',
    city: 'Улаанбаатар',
    district: 'БЗД',
    address: '3-р хороо, 45-р байр, 304 тоот',
    isDefault: true
  },
  {
    id: '2',
    name: 'Ажлын газар',
    recipient: 'Батболд Ганзориг',
    phone: '99112233',
    city: 'Улаанбаатар',
    district: 'СБД',
    address: 'Олимпик гудамж, Шангри-Ла оффис, 5 давхар',
    isDefault: false
  }
];

export default function AddressesPage() {
  const [addresses, setAddresses] = useState(mockAddresses);
  const [editModal, setEditModal] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleSave = (data: any) => {
    console.log('Save:', data);
    setEditModal(null);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
    setDeleteId(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl card-shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Хаягууд</h2>
          <Button onClick={() => setEditModal({})}>
            <Plus className="w-4 h-4 mr-2" />
            Хаяг нэмэх
          </Button>
        </div>

        {addresses.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Хаяг бүртгэгдээгүй байна</p>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`border rounded-xl p-4 relative ${
                  address.isDefault ? 'border-primary-500 bg-primary-50' : ''
                }`}
              >
                {address.isDefault && (
                  <span className="absolute top-4 right-4 px-2 py-1 bg-primary-500 text-white text-xs font-medium rounded">
                    Үндсэн
                  </span>
                )}

                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    address.isDefault ? 'bg-primary-500' : 'bg-gray-100'
                  }`}>
                    <MapPin className={`w-5 h-5 ${address.isDefault ? 'text-white' : 'text-gray-400'}`} />
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{address.name}</h3>
                    <p className="text-gray-600 mt-1">{address.recipient}</p>
                    <p className="text-gray-500 text-sm">{address.phone}</p>
                    <p className="text-gray-600 mt-2">
                      {address.city}, {address.district}, {address.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  {!address.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(address.id)}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-500"
                    >
                      <Check className="w-4 h-4" />
                      Үндсэн болгох
                    </button>
                  )}
                  <div className="flex-1" />
                  <button
                    onClick={() => setEditModal(address)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setDeleteId(address.id)}
                    className="p-2 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit/Add Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title={editModal?.id ? 'Хаяг засах' : 'Шинэ хаяг нэмэх'}
      >
        {editModal && (
          <form onSubmit={(e) => { e.preventDefault(); handleSave({}); }} className="space-y-4">
            <Input
              label="Хаягийн нэр"
              defaultValue={editModal.name || ''}
              placeholder="Жнь: Гэр, Ажил"
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Хүлээн авагчийн нэр"
                defaultValue={editModal.recipient || ''}
                required
              />
              <Input
                label="Утасны дугаар"
                defaultValue={editModal.phone || ''}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Хот/Аймаг"
                defaultValue={editModal.city || ''}
                required
              />
              <Input
                label="Дүүрэг/Сум"
                defaultValue={editModal.district || ''}
                required
              />
            </div>

            <Input
              label="Дэлгэрэнгүй хаяг"
              defaultValue={editModal.address || ''}
              placeholder="Хороо, гудамж, байр, тоот"
              required
            />

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
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Хаяг устгах"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Энэ хаягийг устгахдаа итгэлтэй байна уу?
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Болих
            </Button>
            <Button 
              onClick={() => handleDelete(deleteId!)}
              className="bg-red-500 hover:bg-red-600"
            >
              Устгах
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
