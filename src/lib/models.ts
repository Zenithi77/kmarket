import mongoose, { Schema, Document, Model } from 'mongoose';

// ============ USER MODEL ============
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
  address?: string;
  gender?: 'male' | 'female' | 'other';
  avatar?: string;
  role: 'user' | 'admin';
  provider?: 'google';
  providerId?: string;
  profileCompleted?: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  full_name: { type: String, required: true },
  phone: { type: String },
  address: { type: String },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  provider: { type: String, enum: ['google'] },
  providerId: { type: String },
  profileCompleted: { type: Boolean, default: false },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ============ CATEGORY MODEL ============
export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  parent_id?: mongoose.Types.ObjectId;
  is_active: boolean;
  order: number;
  created_at: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  icon: { type: String },
  image: { type: String },
  parent_id: { type: Schema.Types.ObjectId, ref: 'Category' },
  is_active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

export const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

// ============ PRODUCT MODEL ============
export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  price: number;
  sale_price?: number;
  images: string[];
  sizes?: string[];
  weight?: number;
  brand?: string;
  stock: number;
  category_id: mongoose.Types.ObjectId;
  is_featured: boolean;
  is_new: boolean;
  is_active: boolean;
  rating: number;
  review_count: number;
  created_at: Date;
  updated_at: Date;
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  price: { type: Number, required: true },
  sale_price: { type: Number },
  images: [{ type: String }],
  sizes: [{ type: String }],
  weight: { type: Number },
  brand: { type: String },
  stock: { type: Number, default: 0 },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  is_featured: { type: Boolean, default: false },
  is_new: { type: Boolean, default: true },
  is_active: { type: Boolean, default: true },
  rating: { type: Number, default: 0 },
  review_count: { type: Number, default: 0 },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

// Index for search (slug index is auto-created by unique: true)
ProductSchema.index({ name: 'text', description: 'text', brand: 'text' });
ProductSchema.index({ category_id: 1 });

export const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

// ============ ORDER MODEL ============
export interface IOrderItem {
  product_id: mongoose.Types.ObjectId;
  name: string;
  image: string;
  price: number;
  quantity: number;
  size?: string;
}

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  order_number: string;
  user_id?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  total_amount: number;
  shipping_fee: number;
  discount_amount: number;
  final_amount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

const OrderItemSchema = new Schema<IOrderItem>({
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  size: { type: String },
}, { _id: false });

const OrderSchema = new Schema<IOrder>({
  order_number: { type: String, required: true, unique: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  items: [OrderItemSchema],
  total_amount: { type: Number, required: true },
  shipping_fee: { type: Number, default: 5000 },
  discount_amount: { type: Number, default: 0 },
  final_amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  payment_method: { type: String, default: 'bank_transfer' },
  shipping_name: { type: String, required: true },
  shipping_phone: { type: String, required: true },
  shipping_address: { type: String, required: true },
  shipping_city: { type: String, required: true },
  shipping_district: { type: String, required: true },
  notes: { type: String },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Order: Model<IOrder> = mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

// ============ REVIEW MODEL ============
export interface IReview extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  images?: string[];
  created_at: Date;
}

const ReviewSchema = new Schema<IReview>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  images: [{ type: String }],
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

// Update product rating when review is added
ReviewSchema.post('save', async function() {
  const Review = mongoose.model('Review');
  const Product = mongoose.model('Product');
  
  const stats = await Review.aggregate([
    { $match: { product_id: this.product_id } },
    { $group: { _id: '$product_id', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product_id, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      review_count: stats[0].count,
    });
  }
});

export const Review: Model<IReview> = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

// ============ ADDRESS MODEL ============
export interface IAddress extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  is_default: boolean;
}

const AddressSchema = new Schema<IAddress>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  address: { type: String, required: true },
  is_default: { type: Boolean, default: false },
});

export const Address: Model<IAddress> = mongoose.models.Address || mongoose.model<IAddress>('Address', AddressSchema);

// ============ DISCOUNT MODEL ============
export interface IDiscount extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  min_order?: number;
  max_discount?: number;
  usage_limit?: number;
  used_count: number;
  start_date: Date;
  end_date: Date;
  is_active: boolean;
}

const DiscountSchema = new Schema<IDiscount>({
  code: { type: String, required: true, unique: true, uppercase: true },
  type: { type: String, enum: ['percent', 'fixed'], required: true },
  value: { type: Number, required: true },
  min_order: { type: Number },
  max_discount: { type: Number },
  usage_limit: { type: Number },
  used_count: { type: Number, default: 0 },
  start_date: { type: Date, required: true },
  end_date: { type: Date, required: true },
  is_active: { type: Boolean, default: true },
});

export const Discount: Model<IDiscount> = mongoose.models.Discount || mongoose.model<IDiscount>('Discount', DiscountSchema);

// ============ WISHLIST MODEL ============
export interface IWishlist extends Document {
  _id: mongoose.Types.ObjectId;
  user_id: mongoose.Types.ObjectId;
  product_id: mongoose.Types.ObjectId;
  created_at: Date;
}

const WishlistSchema = new Schema<IWishlist>({
  user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: false } });

WishlistSchema.index({ user_id: 1, product_id: 1 }, { unique: true });

export const Wishlist: Model<IWishlist> = mongoose.models.Wishlist || mongoose.model<IWishlist>('Wishlist', WishlistSchema);

// ============ BANNER MODEL ============
export interface IBanner extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  link?: string;
  bg_color: string;
  text_color: string;
  order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

const BannerSchema = new Schema<IBanner>({
  title: { type: String, required: true },
  subtitle: { type: String },
  description: { type: String },
  image: { type: String, required: true },
  link: { type: String },
  bg_color: { type: String, default: '#FEE2E2' },
  text_color: { type: String, default: '#F97316' },
  order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

export const Banner: Model<IBanner> = mongoose.models.Banner || mongoose.model<IBanner>('Banner', BannerSchema);
