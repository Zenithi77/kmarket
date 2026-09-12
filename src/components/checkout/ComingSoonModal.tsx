'use client';

import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui';

interface ComingSoonModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ComingSoonModal({ isOpen, onClose }: ComingSoonModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden animate-scale-in text-center p-8">
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full bg-primary-100 animate-ping-slow" />
          <div className="relative w-20 h-20 rounded-full bg-primary-50 flex items-center justify-center">
            <Sparkles className="w-9 h-9 text-primary-500 animate-float" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">Уучлаарай!</h2>
        <p className="text-gray-500 leading-relaxed">
          Манай вэбсайт одоогоор бүрэн ашиглалтад ороогүй байна.
          Удахгүй нээгдэх тул түр хүлээнэ үү 🙏
        </p>

        <Button fullWidth size="lg" className="mt-6" onClick={onClose}>
          Ойлголоо
        </Button>
      </div>
    </div>
  );
}
