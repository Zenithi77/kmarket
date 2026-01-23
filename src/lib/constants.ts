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
