'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Truck,
  Building2,
  Package
} from 'lucide-react';
import { useCartStore, useAuthStore } from '@/store';
import { formatPrice, SHIPPING_COSTS, SHIPPING_LABELS } from '@/lib/constants';
import { Button, Input, Textarea, Select } from '@/components/ui';
import { PaymentModal } from '@/components/checkout';
import { Order, DeliveryType } from '@/types';
import toast from 'react-hot-toast';

const deliveryOptions: { value: DeliveryType; label: string; price: number; icon: any }[] = [
  { value: 'city', label: SHIPPING_LABELS.city, price: SHIPPING_COSTS.city, icon: Truck },
  { value: 'province', label: SHIPPING_LABELS.province, price: SHIPPING_COSTS.province, icon: Building2 },
  { value: 'pickup', label: SHIPPING_LABELS.pickup, price: SHIPPING_COSTS.pickup, icon: Package },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    customer_name: user?.full_name || '',
    customer_email: user?.email || '',
    customer_phone: user?.phone || '',
    city: 'Улаанбаатар',
    district: '',
    address: '',
    notes: ''
  });
  
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('city');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getTotalPrice();
  const shippingFee = SHIPPING_COSTS[deliveryType];
  const total = subtotal + shippingFee;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customer_name.trim()) {
      newErrors.customer_name = 'Нэр оруулна уу';
    }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = 'И-мэйл оруулна уу';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = 'И-мэйл буруу байна';
    }

    if (!formData.customer_phone.trim()) {
      newErrors.customer_phone = 'Утасны дугаар оруулна уу';
    } else if (!/^[89]\d{7}$/.test(formData.customer_phone.replace(/\s/g, ''))) {
      newErrors.customer_phone = 'Утасны дугаар буруу байна';
    }

    if (deliveryType !== 'pickup') {
      if (!formData.district.trim()) {
        newErrors.district = 'Дүүрэг сонгоно уу';
      }
      if (!formData.address.trim()) {
        newErrors.address = 'Хаяг оруулна уу';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Мэдээллийг бүрэн бөглөнө үү');
      return;
    }

    if (items.length === 0) {
      toast.error('Сагс хоосон байна');
      return;
    }

    setIsLoading(true);

    try {
      const orderData = {
        shipping_name: formData.customer_name,
        shipping_phone: formData.customer_phone,
        shipping_address: formData.address,
        shipping_city: formData.city,
        shipping_district: formData.district,
        shipping_fee: shippingFee,
        delivery_type: deliveryType,
        notes: formData.notes,
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
          size: item.size
        }))
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Захиалга үүсгэхэд алдаа гарлаа');
      }

      // API returns the order directly
      setCreatedOrder(data);
      setShowPaymentModal(true);

    } catch (error: any) {
      toast.error(error.message || 'Алдаа гарлаа');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    setShowPaymentModal(false);
    router.push(`/order-success?id=${createdOrder?._id || createdOrder?.order_number}`);
  };

  if (items.length === 0 && !showPaymentModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Сагс хоосон байна</h2>
          <p className="text-gray-500 mb-6">Бүтээгдэхүүн нэмж захиалга хийнэ үү</p>
          <Link href="/products" className="btn-primary inline-block">
            Дэлгүүр үзэх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/products" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-xl font-bold text-gray-900">Захиалга баталгаажуулах</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Info */}
              <div className="bg-white rounded-xl p-6 card-shadow">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <User className="w-5 h-5 text-primary-500" />
                  Холбоо барих мэдээлэл
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Нэр"
                    name="customer_name"
                    value={formData.customer_name}
                    onChange={handleInputChange}
                    error={errors.customer_name}
                    placeholder="Таны нэр"
                    required
                  />
                  <Input
                    label="Утасны дугаар"
                    name="customer_phone"
                    value={formData.customer_phone}
                    onChange={handleInputChange}
                    error={errors.customer_phone}
                    placeholder="88001234"
                    required
                  />
                  <div className="md:col-span-2">
                    <Input
                      label="И-мэйл хаяг"
                      name="customer_email"
                      type="email"
                      value={formData.customer_email}
                      onChange={handleInputChange}
                      error={errors.customer_email}
                      placeholder="example@email.com"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Method */}
              <div className="bg-white rounded-xl p-6 card-shadow">
                <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary-500" />
                  Хүргэлтийн хэлбэр
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {deliveryOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDeliveryType(option.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          deliveryType === option.value
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <Icon className={`w-6 h-6 mb-2 ${
                          deliveryType === option.value ? 'text-primary-500' : 'text-gray-400'
                        }`} />
                        <p className="font-medium text-gray-900">{option.label}</p>
                        <p className={`text-sm mt-1 ${
                          option.price === 0 ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          {option.price === 0 ? 'Үнэгүй' : formatPrice(option.price)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Shipping Address */}
              {deliveryType !== 'pickup' && (
                <div className="bg-white rounded-xl p-6 card-shadow">
                  <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-500" />
                    Хүргэлтийн хаяг
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                      label="Хот"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      options={[
                        { value: 'Улаанбаатар', label: 'Улаанбаатар' },
                        { value: 'Дархан', label: 'Дархан' },
                        { value: 'Эрдэнэт', label: 'Эрдэнэт' }
                      ]}
                      required
                    />
                    <Select
                      label="Дүүрэг"
                      name="district"
                      value={formData.district}
                      onChange={handleInputChange}
                      error={errors.district}
                      options={[
                        { value: 'Баянзүрх', label: 'Баянзүрх дүүрэг' },
                        { value: 'Сүхбаатар', label: 'Сүхбаатар дүүрэг' },
                        { value: 'Хан-Уул', label: 'Хан-Уул дүүрэг' },
                        { value: 'Баянгол', label: 'Баянгол дүүрэг' },
                        { value: 'Сонгинохайрхан', label: 'Сонгинохайрхан дүүрэг' },
                        { value: 'Чингэлтэй', label: 'Чингэлтэй дүүрэг' }
                      ]}
                      placeholder="Дүүрэг сонгоно уу"
                      required
                    />
                    <div className="md:col-span-2">
                      <Textarea
                        label="Дэлгэрэнгүй хаяг"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        error={errors.address}
                        placeholder="Хороо, байр, тоот, орц код гэх мэт..."
                        rows={3}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="bg-white rounded-xl p-6 card-shadow">
                <Textarea
                  label="Нэмэлт тэмдэглэл (заавал биш)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Хүргэлтийн талаар нэмэлт мэдээлэл..."
                  rows={2}
                />
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 card-shadow sticky top-24">
                <h2 className="text-lg font-semibold mb-6">Захиалгын дэлгэрэнгүй</h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <Image
                          src={item.product.images[0] || '/placeholder.png'}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-gray-900 text-white text-xs rounded-full flex items-center justify-center">
                          {item.quantity}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm line-clamp-2">{item.product.name}</p>
                        {item.size && (
                          <p className="text-xs text-gray-500 mt-0.5">Размер: {item.size}</p>
                        )}
                        <p className="text-sm text-primary-600 font-medium mt-1">
                          {formatPrice(item.product.sale_price || item.product.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Дүн:</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Хүргэлт:</span>
                    <span className={shippingFee === 0 ? 'text-green-500' : ''}>
                      {shippingFee === 0 ? 'Үнэгүй' : formatPrice(shippingFee)}
                    </span>
                  </div>
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-semibold">Нийт:</span>
                    <span className="text-xl font-bold text-primary-600">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  loading={isLoading}
                  fullWidth
                  size="lg"
                  className="mt-6"
                >
                  Захиалга баталгаажуулах
                </Button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  Захиалга хийснээр та үйлчилгээний нөхцлийг зөвшөөрсөнд тооцно
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        order={createdOrder}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
}
