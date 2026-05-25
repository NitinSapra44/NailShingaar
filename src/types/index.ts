export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  category_ids?: string[];
  image_url: string;
  images: string[];
  sizes: string[];
  stock: number;
  is_featured: boolean;
  is_new: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_id: string;
  size: string;
  quantity: number;
  created_at: string;
  product?: Product;
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'screenshot_uploaded' | 'confirmed' | 'failed';

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total: number;
  shipping_address: string;
  shipping_city: string;
  shipping_phone: string;
  shipping_name: string;
  // Nail sizing questionnaire
  nail_length: string | null;
  nail_shape: string | null;
  color_preference: string | null;
  nail_photos: string[];
  // Payment
  payment_screenshot: string | null;
  payment_status: PaymentStatus;
  // Delivery
  tracking_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_image: string | null;
  size: string;
  quantity: number;
  price: number;
  created_at: string;
}

export interface NailQuestionnaire {
  nail_length: 'Small' | 'Medium' | 'Long';
  nail_shape: 'Square' | 'Squoval' | 'Round' | 'Oval' | 'Almond' | 'Coffin';
  color_preference: string;
  nail_photos: File[];
}

export interface ShippingDetails {
  full_name: string;
  phone: string;
  address: string;
  city: string;
  pincode: string;
}
