'use client';

import { useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Copy, Check, Clock, CheckCircle, Building2, CreditCard, AlertCircle } from 'lucide-react';
import { BANK_ACCOUNTS, formatPrice, copyToClipboard } from '@/lib/constants';
import { Button } from '@/components/ui';

interface PaymentModalProps {
  isOpen: boolean;
  order: any | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ isOpen, order, onClose, onSuccess }: PaymentModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'paid' | 'error'>('pending');
  const [elapsedTime, setElapsedTime] = useState(0);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen || !order) return;

    // Reset state
    setPaymentStatus('pending');
    setElapsedTime(0);
    setCopied(null);

    // Start polling for payment status
    const pollPaymentStatus = async () => {
      try {
        const orderId = order._id || order.id;
        const response = await fetch(`/api/orders/${orderId}`);
        const data = await response.json();

        if (data.payment_status === 'paid') {
          setPaymentStatus('paid');
          
          // Trigger confetti
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          // Clear polling
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }

          // Call success callback after delay
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    // Start polling every 5 seconds
    pollPaymentStatus();
    pollingRef.current = setInterval(pollPaymentStatus, 5000);

    // Timer for elapsed time
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Cleanup
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, order, onSuccess]);

  const handleCopy = async (text: string, field: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen || !order) return null;

  const bank = BANK_ACCOUNTS.khan;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden animate-scale-in">
        {paymentStatus === 'paid' ? (
          // Success State
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Төлбөр амжилттай!
            </h2>
            <p className="text-gray-600 mb-4">
              Таны захиалга баталгаажлаа. Удахгүй хүргэлт хийгдэнэ.
            </p>
            <p className="text-sm text-gray-500">
              Захиалгын дугаар: <span className="font-mono font-bold">{order.order_number}</span>
            </p>
          </div>
        ) : (
          // Pending State
          <>
            {/* Header */}
            <div className="bg-primary-500 text-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Банкны шилжүүлэг</h2>
                <div className="flex items-center space-x-2 text-primary-100">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-mono">{formatTime(elapsedTime)}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-primary-100 text-sm mb-1">Төлөх дүн</p>
                <p className="text-3xl font-bold">{formatPrice(order.final_amount)}</p>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Warning */}
              <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-800">
                  Гүйлгээний утга дээр <strong>заавал</strong> доорх кодыг бичнэ үү. Буруу бичвэл төлбөр автоматаар баталгаажихгүй.
                </p>
              </div>

              {/* Payment Reference */}
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-600 mb-2">Гүйлгээний утга (ЗААВАЛ)</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-primary-600">
                    {order.order_number}
                  </span>
                  <button
                    onClick={() => handleCopy(order.order_number, 'ref')}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 hover:border-primary-500 transition-colors"
                  >
                    {copied === 'ref' ? (
                      <>
                        <Check className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-500">Хуулсан</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Хуулах</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Bank Details */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Банк</p>
                    <p className="font-medium">{bank.bankName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Дансны дугаар</p>
                    <p className="font-medium font-mono">{bank.accountNumber}</p>
                  </div>
                  <button
                    onClick={() => handleCopy(bank.accountNumber, 'account')}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {copied === 'account' ? (
                      <Check className="w-4 h-4 text-green-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold">₮</div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500">Хүлээн авагч</p>
                    <p className="font-medium">{bank.accountName}</p>
                  </div>
                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-center space-x-3 py-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-primary-500 rounded-full animate-pulse-ring" />
                </div>
                <span className="text-sm text-gray-600">Төлбөр хүлээж байна...</span>
              </div>

              {/* Close Button */}
              <Button
                variant="secondary"
                fullWidth
                onClick={onClose}
              >
                Хаах
              </Button>

              <p className="text-xs text-center text-gray-400">
                Төлбөр төлсний дараа автоматаар баталгаажна
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
