// Bank Account Configuration
export const BANK_ACCOUNTS = {
  khan: {
    bankName: 'Хаан банк',
    accountNumber: '5021296757',
    accountName: 'НЭРЭЭ БИЧНЭ',
    logo: '/banks/khan.png'
  }
} as const;

// Shipping Costs
export const SHIPPING_COSTS = {
  city: 5000,      // Улаанбаатар хот дотор
  province: 10000, // Орон нутаг
  pickup: 0        // Өөрөө авах
} as const;

// Shipping Labels
export const SHIPPING_LABELS = {
  city: 'Улаанбаатар хот дотор',
  province: 'Орон нутаг',
  pickup: 'Өөрөө очиж авах'
} as const;

// Payment Statuses
export const PAYMENT_STATUSES = ['Pending', 'Paid', 'PendingReview', 'Failed', 'Refunded'] as const;

// Order Statuses
export const ORDER_STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'] as const;

// Order Status Labels (Mongolian)
export const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending: 'Хүлээгдэж буй',
  Processing: 'Бэлтгэж буй',
  Shipped: 'Илгээсэн',
  Delivered: 'Хүргэгдсэн',
  Cancelled: 'Цуцлагдсан'
};

// Payment Status Labels (Mongolian)
export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  Pending: 'Хүлээгдэж буй',
  Paid: 'Төлөгдсөн',
  PendingReview: 'Шалгаж буй',
  Failed: 'Амжилтгүй',
  Refunded: 'Буцаагдсан'
};

// Categories
export const CATEGORIES = [
  { id: 'beauty', name: 'Beauty', slug: 'beauty', icon: '💄' },
  { id: 'fashion', name: 'Fashion', slug: 'fashion', icon: '👗' },
  { id: 'shoes', name: 'Shoes', slug: 'shoes', icon: '👟' },
  { id: 'dyson', name: 'Dyson', slug: 'dyson', icon: '💨' },
  { id: 'trendy', name: 'Trendy', slug: 'trendy', icon: '✨' },
  { id: 'best', name: 'Best Sellers', slug: 'best', icon: '🏆' },
] as const;

// Sizes
export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'] as const;

// Size Presets by Type
export const SIZE_PRESETS: Record<string, string[]> = {
  clothing: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'],
  shoes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  bags: ['Small', 'Medium', 'Large', 'XL'],
  ring: ['5', '6', '7', '8', '9', '10', '11', '12', '13'],
};

// Size Type Labels
export const SIZE_TYPE_LABELS: Record<string, string> = {
  none: 'Хэмжээгүй',
  clothing: 'Хувцас (XS-4XL)',
  shoes: 'Гутал (35-46)',
  bags: 'Цүнх (S/M/L/XL)',
  ring: 'Бөгж (5-13)',
  custom: 'Өөрөө нэмэх',
};

// Common Colors
export const COMMON_COLORS: { name: string; hex: string }[] = [
  { name: 'Хар', hex: '#000000' },
  { name: 'Цагаан', hex: '#FFFFFF' },
  { name: 'Улаан', hex: '#EF4444' },
  { name: 'Шар', hex: '#EAB308' },
  { name: 'Ногоон', hex: '#22C55E' },
  { name: 'Цэнхэр', hex: '#3B82F6' },
  { name: 'Хөх', hex: '#1D4ED8' },
  { name: 'Ягаан', hex: '#EC4899' },
  { name: 'Нил ягаан', hex: '#A855F7' },
  { name: 'Улбар шар', hex: '#F97316' },
  { name: 'Саарал', hex: '#6B7280' },
  { name: 'Хүрэн', hex: '#92400E' },
  { name: 'Бэж', hex: '#D2B48C' },
  { name: 'Алтан', hex: '#DAA520' },
  { name: 'Мөнгөн', hex: '#C0C0C0' },
  { name: 'Сүүн', hex: '#FFFDD0' },
  { name: 'Чийрэг ногоон', hex: '#065F46' },
  { name: 'Будаа өнгө', hex: '#F5F5DC' },
];

// Brands
export const BRANDS = [
  'Nike', 'Adidas', 'Zara', 'H&M', 'Dyson', 'Samsung', 
  'Apple', 'Gucci', 'Prada', 'Louis Vuitton', 'Chanel'
] as const;

// Generate unique payment reference
export function generatePaymentRef(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'KM-'; // KMarket prefix
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Format price to Mongolian format
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('mn-MN').format(price) + '₮';
}

// Format date
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('mn-MN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
}

// Copy to clipboard
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
}

// Generate slug from text
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone (Mongolian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+976|976)?[89]\d{7}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

// Check if a URL is a video (Cloudinary video URLs or common video extensions)
export function isVideoUrl(url: string): boolean {
  if (!url) return false;
  // Cloudinary video URLs contain /video/upload/
  if (url.includes('/video/upload/')) return true;
  // Common video extensions
  const videoExts = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase().split('?')[0];
  return videoExts.some(ext => lowerUrl.endsWith(ext));
}

// Truncate text
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// Calculate discount percentage
export function calculateDiscountPercent(originalPrice: number, salePrice: number): number {
  if (!salePrice || salePrice >= originalPrice) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// API Endpoints
export const API_ENDPOINTS = {
  products: '/api/products',
  categories: '/api/categories',
  orders: '/api/orders',
  cart: '/api/cart',
  wishlist: '/api/wishlist',
  reviews: '/api/reviews',
  auth: '/api/auth',
  payment: {
    webhook: '/api/payment/webhook',
    status: '/api/payment/status'
  },
  admin: {
    products: '/api/admin/products',
    orders: '/api/admin/orders',
    users: '/api/admin/users',
    categories: '/api/admin/categories',
    reports: '/api/admin/reports'
  }
} as const;
