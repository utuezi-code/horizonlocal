export interface User {
  id: number;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'marketer' | 'vendor' | 'customer';
  phone?: string;
  vendor?: Vendor;
  created_at: string;
}

export interface Vendor {
  id: number;
  user_id: number;
  store_name: string;
  store_slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  commission_rate: number;
  stripe_onboarded: boolean;
  status: 'pending' | 'approved' | 'suspended';
}

export interface Category {
  id: number;
  parent_id?: number;
  name: string;
  slug: string;
  image_url?: string;
  sort_order: number;
  children?: Category[];
}

export interface AttributeType {
  id: number;
  name: string;
  values: AttributeValue[];
}

export interface AttributeValue {
  id: number;
  value: string;
  color_hex?: string;
}

export interface ProductVariant {
  id: number;
  sku?: string;
  price: number;
  compare_price?: number;
  stock: number;
  image_url?: string;
  is_active: boolean;
  attribute_value_ids: number[];
}

export interface ProductImage {
  id: number;
  url: string;
  alt_text?: string;
  is_primary: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  vendor_id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  short_description?: string;
  sku?: string;
  price: number;
  compare_price?: number;
  price_from?: number;
  stock: number;
  manage_stock?: boolean;
  status: 'draft' | 'pending_review' | 'published' | 'rejected' | 'archived';
  is_featured: boolean;
  images: ProductImage[];
  attribute_types?: AttributeType[];
  variants?: ProductVariant[];
  vendor?: Vendor;
  category?: Category;
  average_rating?: number;
  reviews_count?: number;
}

export interface CartItem {
  id: number;
  product_id: number;
  variant_id?: number;
  quantity: number;
  product: Product;
  variant?: ProductVariant;
}

export interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export interface OrderItem {
  id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  fulfillment_status: string;
  tracking_number?: string;
  carrier?: string;
  vendor?: Vendor;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: number;
  status: string;
  subtotal: number;
  tax_gst: number;
  tax_tvq: number;
  shipping_cost: number;
  total: number;
  currency: string;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_province: string;
  shipping_postal_code: string;
  items: OrderItem[];
  created_at: string;
}

export interface Review {
  id: number;
  rating: number;
  comment?: string;
  user?: User;
  created_at: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  cover_image_url?: string;
  category?: string;
  published_at?: string;
  author?: User;
}

export interface Banner {
  id: number;
  location: string;
  title?: string;
  subtitle?: string;
  cta_text?: string;
  cta_url?: string;
  image_desktop_url?: string;
  image_mobile_url?: string;
  bg_color?: string;
  text_color?: string;
  is_active: boolean;
}

export interface Promotion {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  discount_type?: 'percentage' | 'fixed' | 'free_shipping';
  discount_value?: number;
  code?: string;
  starts_at: string;
  ends_at?: string;
  is_active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface TaxCalculation {
  subtotal: number;
  tps: number;
  tvq: number;
  total: number;
}

export interface ShippingCalculation {
  [vendorId: string]: {
    fee: number;
    estimated_days?: string;
    free_above?: number;
  };
}
