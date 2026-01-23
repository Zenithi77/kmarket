// Types for the entire application

// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Category Types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  subcategories?: Category[];
}

// Product Types
export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number;
  sku: string;
  brand?: string;
  weight?: number;
  category_id: string;
  category?: Category;
  images: string[];
  sizes: string[];
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  review_count: number;
  created_at: string;
  updated_at: string;
}

// Cart Types
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  size?: string;
}

// Order Types
export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export type PaymentStatus = 'Pending' | 'Paid' | 'PendingReview' | 'Failed' | 'Refunded';
export type DeliveryType = 'city' | 'province' | 'pickup';

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
  size?: string;
}

export interface ShippingAddress {
  city: string;
  district: string;
  address: string;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: number;
  user_id?: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: ShippingAddress;
  delivery_type: DeliveryType;
  items: OrderItem[];
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_ref: string;
  payment_method: string;
  paid_amount?: number;
  payment_note?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Wishlist Types
export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  product?: Product;
  created_at: string;
}

// Review Types
export interface Review {
  id: string;
  user_id: string;
  user?: User;
  product_id: string;
  rating: number;
  comment: string;
  images?: string[];
  is_approved: boolean;
  created_at: string;
}

// Admin Types
export interface Admin {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  created_at: string;
}

// Discount Types
export interface Discount {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  max_uses?: number;
  used_count: number;
  start_date: string;
  end_date: string;
  is_active: boolean;
  created_at: string;
}

// Notification Types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'promotion' | 'system';
  is_read: boolean;
  created_at: string;
}

// Filter Types
export interface ProductFilters {
  category?: string;
  subcategory?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  rating?: number;
  search?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular' | 'rating';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination Types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
