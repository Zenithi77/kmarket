'use client';

import { useState } from 'react';
import {
  Store,
  CreditCard,
  Bell,
  Mail,
  Shield,
  Palette,
  Globe,
  Save,
  Upload
} from 'lucide-react';
import { Button, Input, Textarea } from '@/components/ui';
import toast from 'react-hot-toast';

const tabs = [
  { id: 'general', label: 'Ерөнхий', icon: Store },
  { id: 'payment', label: 'Төлбөр', icon: CreditCard },
  { id: 'notifications', label: 'Мэдэгдэл', icon: Bell },
  { id: 'email', label: 'Имэйл', icon: Mail },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'KMarket',
    siteDescription: 'Монголын шилдэг онлайн дэлгүүр',
    siteEmail: 'info@kmarket.mn',
    sitePhone: '7700-0000',
    siteAddress: 'Улаанбаатар хот, СБД, 1-р хороо',
    currency: 'MNT',
    language: 'mn'
  });

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    bankName: 'Хаан банк',
    bankAccount: '5021296757',
    accountHolder: 'KMarket ХХК',
    webhookUrl: 'https://kmarket.mn/api/payment/webhook',
    webhookKey: 'sk_live_xxxxxxxxxxxxx',
    enableAutoVerify: true
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    orderConfirmation: true,
    orderStatusUpdate: true,
    paymentReceived: true,
    lowStockAlert: true,
    lowStockThreshold: '10',
    newUserRegistration: true,
    reviewSubmitted: true
  });

  // Email settings
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.gmail.com',
    smtpPort: '587',
    smtpUser: 'noreply@kmarket.mn',
    smtpPassword: '',
    fromName: 'KMarket',
    fromEmail: 'noreply@kmarket.mn'
  });

  const handleSave = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Тохиргоо хадгалагдлаа');
    } catch (error) {
      toast.error('Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тохиргоо</h1>
          <p className="text-gray-500 mt-1">Системийн тохиргоонууд</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Хадгалж байна...' : 'Хадгалах'}
        </Button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl card-shadow">
        <div className="flex border-b overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-500'
                    : 'border-transparent text-gray-500 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold">Ерөнхий мэдээлэл</h3>
              
              <Input
                label="Сайтын нэр"
                value={generalSettings.siteName}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
              />
              
              <Textarea
                label="Сайтын тайлбар"
                value={generalSettings.siteDescription}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Имэйл"
                  type="email"
                  value={generalSettings.siteEmail}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteEmail: e.target.value }))}
                />
                <Input
                  label="Утас"
                  value={generalSettings.sitePhone}
                  onChange={(e) => setGeneralSettings(prev => ({ ...prev, sitePhone: e.target.value }))}
                />
              </div>

              <Input
                label="Хаяг"
                value={generalSettings.siteAddress}
                onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteAddress: e.target.value }))}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Лого
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Store className="w-10 h-10 text-gray-400" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Солих
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Settings */}
          {activeTab === 'payment' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold">Төлбөрийн тохиргоо</h3>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Анхаар:</strong> Банкны мэдээлэл өөрчлөхөд маш болгоомжтой хандана уу. 
                  Буруу мэдээлэл оруулбал захиалгууд алдагдах эрсдэлтэй.
                </p>
              </div>

              <Input
                label="Банкны нэр"
                value={paymentSettings.bankName}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, bankName: e.target.value }))}
              />

              <Input
                label="Дансны дугаар"
                value={paymentSettings.bankAccount}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, bankAccount: e.target.value }))}
              />

              <Input
                label="Данс эзэмшигч"
                value={paymentSettings.accountHolder}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, accountHolder: e.target.value }))}
              />

              <hr className="my-6" />

              <h4 className="font-medium">SMS Webhook тохиргоо</h4>

              <Input
                label="Webhook URL"
                value={paymentSettings.webhookUrl}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, webhookUrl: e.target.value }))}
                disabled
              />

              <Input
                label="Webhook Key (POSTKEY)"
                type="password"
                value={paymentSettings.webhookKey}
                onChange={(e) => setPaymentSettings(prev => ({ ...prev, webhookKey: e.target.value }))}
              />

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={paymentSettings.enableAutoVerify}
                  onChange={(e) => setPaymentSettings(prev => ({ ...prev, enableAutoVerify: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                />
                <span className="text-sm">Автомат төлбөр баталгаажуулалт идэвхжүүлэх</span>
              </label>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold">Мэдэгдлийн тохиргоо</h3>
              
              <div className="space-y-4">
                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium">Захиалга баталгаажсан</p>
                    <p className="text-sm text-gray-500">Хэрэглэгчид захиалга хийсний дараа имэйл илгээх</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.orderConfirmation}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, orderConfirmation: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium">Захиалгын статус өөрчлөгдсөн</p>
                    <p className="text-sm text-gray-500">Захиалгын төлөв өөрчлөгдөхөд мэдэгдэх</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.orderStatusUpdate}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, orderStatusUpdate: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium">Төлбөр орсон</p>
                    <p className="text-sm text-gray-500">Төлбөр автоматаар баталгаажсан үед мэдэгдэх</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.paymentReceived}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, paymentReceived: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                </label>

                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <div>
                    <p className="font-medium">Нөөц дуусаж байна</p>
                    <p className="text-sm text-gray-500">Барааны нөөц тодорхой хэмжээнд хүрсэн үед</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationSettings.lowStockAlert}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, lowStockAlert: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                  />
                </label>

                {notificationSettings.lowStockAlert && (
                  <Input
                    label="Нөөцийн босго"
                    type="number"
                    value={notificationSettings.lowStockThreshold}
                    onChange={(e) => setNotificationSettings(prev => ({ ...prev, lowStockThreshold: e.target.value }))}
                    className="max-w-xs"
                  />
                )}
              </div>
            </div>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold">Имэйл тохиргоо (SMTP)</h3>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="SMTP Host"
                  value={emailSettings.smtpHost}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpHost: e.target.value }))}
                />
                <Input
                  label="SMTP Port"
                  value={emailSettings.smtpPort}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPort: e.target.value }))}
                />
              </div>

              <Input
                label="SMTP Username"
                value={emailSettings.smtpUser}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpUser: e.target.value }))}
              />

              <Input
                label="SMTP Password"
                type="password"
                value={emailSettings.smtpPassword}
                onChange={(e) => setEmailSettings(prev => ({ ...prev, smtpPassword: e.target.value }))}
                placeholder="••••••••"
              />

              <hr className="my-6" />

              <h4 className="font-medium">Илгээгчийн мэдээлэл</h4>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Илгээгчийн нэр"
                  value={emailSettings.fromName}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, fromName: e.target.value }))}
                />
                <Input
                  label="Илгээгчийн имэйл"
                  type="email"
                  value={emailSettings.fromEmail}
                  onChange={(e) => setEmailSettings(prev => ({ ...prev, fromEmail: e.target.value }))}
                />
              </div>

              <Button variant="outline">
                Тест имэйл илгээх
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
