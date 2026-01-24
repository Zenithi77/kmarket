'use client';

import { useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Shield,
  ShieldOff,
  MoreVertical
} from 'lucide-react';
import { formatDate } from '@/lib/constants';
import { Modal, Button } from '@/components/ui';

// Mock users data
const mockUsers = [
  {
    id: '1',
    name: 'Батболд Ганзориг',
    email: 'batbold@gmail.com',
    phone: '99112233',
    ordersCount: 12,
    totalSpent: 4580000,
    isAdmin: false,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'Сарнай Батсүх',
    email: 'sarnai@gmail.com',
    phone: '88001122',
    ordersCount: 5,
    totalSpent: 1850000,
    isAdmin: false,
    createdAt: '2024-01-05T00:00:00Z'
  },
  {
    id: '3',
    name: 'Админ Хэрэглэгч',
    email: 'admin@kmarket.mn',
    phone: '99009900',
    ordersCount: 0,
    totalSpent: 0,
    isAdmin: true,
    createdAt: '2023-12-01T00:00:00Z'
  },
  {
    id: '4',
    name: 'Тэмүүжин Болд',
    email: 'temuujin@gmail.com',
    phone: '95556677',
    ordersCount: 8,
    totalSpent: 3250000,
    isAdmin: false,
    createdAt: '2024-01-10T00:00:00Z'
  },
  {
    id: '5',
    name: 'Болормаа Эрдэнэ',
    email: 'bolormaa@gmail.com',
    phone: '99887766',
    ordersCount: 3,
    totalSpent: 890000,
    isAdmin: false,
    createdAt: '2024-01-12T00:00:00Z'
  }
];

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<typeof mockUsers[0] | null>(null);

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone.includes(searchQuery);
    return matchesSearch;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('mn-MN').format(price) + '₮';
  };

  const toggleAdmin = (userId: string) => {
    console.log('Toggle admin for user:', userId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Хэрэглэгчид</h1>
        <p className="text-gray-500 mt-1">Нийт {mockUsers.length} хэрэглэгч</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl card-shadow p-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Нэр, имэйл, утас хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Хэрэглэгч
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Утас
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Захиалга
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Нийт зарцуулсан
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Төрөл
                </th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Бүртгүүлсэн
                </th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                  Үйлдэл
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-medium ${
                        user.isAdmin ? 'bg-primary-500' : 'bg-gray-400'
                      }`}>
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{user.phone}</td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{user.ordersCount}</span>
                  </td>
                  <td className="px-6 py-4 font-medium">
                    {formatPrice(user.totalSpent)}
                  </td>
                  <td className="px-6 py-4">
                    {user.isAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
                        <Shield className="w-3 h-3" />
                        Админ
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Хэрэглэгч
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setSelectedUser(user)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t">
          <p className="text-sm text-gray-500">
            1-{filteredUsers.length} / {filteredUsers.length} хэрэглэгч
          </p>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="px-4 py-2 bg-primary-500 text-white rounded-lg text-sm font-medium">1</span>
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* User Detail Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Хэрэглэгчийн мэдээлэл"
      >
        {selectedUser && (
          <div className="space-y-6">
            {/* User Info */}
            <div className="text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto ${
                selectedUser.isAdmin ? 'bg-primary-500' : 'bg-gray-400'
              }`}>
                {selectedUser.name.charAt(0)}
              </div>
              <h3 className="text-xl font-bold mt-4">{selectedUser.name}</h3>
              <p className="text-gray-500">{selectedUser.email}</p>
            </div>

            {/* Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Утас:</span>
                <span className="font-medium">{selectedUser.phone}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Захиалгын тоо:</span>
                <span className="font-medium">{selectedUser.ordersCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Нийт зарцуулсан:</span>
                <span className="font-medium">{formatPrice(selectedUser.totalSpent)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Бүртгүүлсэн:</span>
                <span className="font-medium">{formatDate(selectedUser.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => toggleAdmin(selectedUser.id)}
              >
                {selectedUser.isAdmin ? (
                  <>
                    <ShieldOff className="w-4 h-4 mr-2" />
                    Админ эрх хасах
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Админ эрх өгөх
                  </>
                )}
              </Button>
              <Button className="flex-1">
                <Mail className="w-4 h-4 mr-2" />
                Имэйл илгээх
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
