// ─── Kloset TypeScript Types ────────────────────────

// ─── Auth ────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar_url: string | null;
  is_verified: boolean;
  kyc_status: KYCStatus;
  wallet_balance: number;
  trust_score: number;
  created_at: string;
  date_of_birth?: string | null;
  gender?: string | null;
  payment_preferences?: string | null;
  business_name?: string | null;
  business_address?: string | null;
  pickup_address?: string | null;
  return_address?: string | null;
  gst_details?: string | null;
  pan_details?: string | null;
  bank_details?: string | null;
  payout_account?: string | null;
  kyc_documents?: string | null;
  store_banner?: string | null;
  store_logo?: string | null;
  business_description?: string | null;
  support_contact?: string | null;
  rental_policies?: string | null;
}

export type UserRole = 'renter' | 'seller' | 'admin';
export type KYCStatus = 'pending' | 'submitted' | 'verified' | 'rejected';

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface RegisterPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'renter' | 'seller';
}

export interface LoginPayload {
  email: string;
  password: string;
}

// ─── Address ─────────────────────────────────────────
export interface Address {
  id: string;
  label: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  lat: number | null;
  lng: number | null;
  is_default: boolean;
}

export interface AddAddressPayload {
  label: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  is_default?: boolean;
}

// ─── Outfit ──────────────────────────────────────────
export interface Outfit {
  id: string;
  seller_id: string;
  title: string;
  slug: string;
  description: string | null;
  ai_description: string | null;
  category: OutfitCategory;
  occasions: string[];
  colors: string[];
  fabric: string | null;
  sizes: string[];
  accessories_included: string[];
  city: string | null;
  state: string | null;
  price_1day: number | null;
  price_3day: number | null;
  price_7day: number | null;
  security_deposit: number | null;
  delivery_available: boolean;
  delivery_fee: number;
  status: OutfitStatus;
  rating_avg: number;
  rating_count: number;
  view_count: number;
  wishlist_count: number;
  images: OutfitImage[];
  seller?: SellerInfo;
  is_wishlisted: boolean;
  inventory_count?: number;
  created_at: string;
}

export type OutfitCategory =
  | 'lehenga' | 'saree' | 'anarkali' | 'sharara' | 'gown'
  | 'sherwani' | 'kurta_set' | 'co_ord' | 'western' | 'other';

export type OutfitStatus =
  | 'draft' | 'pending_approval' | 'active'
  | 'rented' | 'cleaning' | 'inactive' | 'rejected';

export interface OutfitImage {
  id: string;
  url: string;
  is_primary: boolean;
  sort_order: number;
}

export interface SellerInfo {
  id: string;
  name: string;
  avatar_url: string | null;
  is_verified: boolean;
  trust_score: number;
}

export interface CreateOutfitPayload {
  title: string;
  description: string;
  category: OutfitCategory;
  occasions: string[];
  colors: string[];
  fabric: string;
  sizes: string[];
  accessories_included: string[];
  city: string;
  state: string;
  pincode: string;
  price_1day: number;
  price_3day: number;
  price_7day: number;
  security_deposit: number;
  delivery_available: boolean;
  delivery_fee: number;
  images: {
    url: string;
    cloudinary_id: string;
    is_primary: boolean;
    sort_order: number;
  }[];
}

export interface OutfitFilters {
  q?: string;
  city?: string;
  category?: OutfitCategory;
  size?: string;
  min_price?: number;
  max_price?: number;
  occasion?: string;
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular';
  page?: number;
  per_page?: number;
}

// ─── Booking ─────────────────────────────────────────
export interface Booking {
  id: string;
  booking_ref: string;
  outfit_id: string;
  renter_id: string;
  seller_id: string;
  pickup_date: string;
  return_date: string;
  rental_days: number;
  size_selected: string;
  status: BookingStatus;
  delivery_type: 'pickup' | 'delivery';
  rental_amount: number;
  security_deposit: number;
  delivery_fee: number;
  platform_fee: number;
  total_amount: number;
  payment_status: string;
  razorpay_order_id?: string;
  created_at: string;
  outfit?: Outfit;
  renter?: {
    name: string;
    avatar_url: string | null;
  };
}

export type BookingStatus =
  | 'pending' | 'confirmed' | 'picked_up'
  | 'in_use' | 'return_initiated' | 'returned'
  | 'cleaning' | 'completed' | 'cancelled' | 'disputed';

// ─── Review ──────────────────────────────────────────
export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  outfit_id: string;
  seller_id: string;
  rating: number;
  comment: string;
  photos: string[];
  created_at: string;
}

export interface ReviewResponse {
  id: string;
  booking_id: string;
  reviewer_id: string;
  outfit_id: string;
  seller_id: string;
  rating: number;
  comment?: string;
  photos?: string;
  created_at: string;
  reviewer_name?: string;
}

// ─── Bank Account ────────────────────────────────────
export interface BankAccount {
  id: string;
  user_id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  is_verified: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface BankAccountPayload {
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  ifsc_code: string;
  is_default?: boolean;
}

// ─── UPI ──────────────────────────────────────────────
export interface UPIID {
  id: string;
  user_id: string;
  upi_id: string;
  is_verified: boolean;
  is_default: boolean;
  created_at: string;
}

export interface UPIIDPayload {
  upi_id: string;
  is_default?: boolean;
}

// ─── Inventory ─────────────────────────────────────────
export type InventoryStatus = 'available' | 'reserved' | 'rented' | 'maintenance';

export interface InventoryItem {
  id: string;
  outfit_id: string;
  seller_id: string;
  quantity_available: number;
  quantity_reserved: number;
  quantity_rented: number;
  quantity_maintenance: number;
  total_quantity: number;
  status: InventoryStatus;
  last_updated: string;
}

export interface InventoryUpdatePayload {
  total_quantity: number;
}

// ─── Support Ticket ────────────────────────────────────
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: string;
  created_at: string;
  updated_at: string;
  replies?: TicketReply[];
}

export interface TicketReply {
  id: string;
  ticket_id: string;
  sender: string;
  message: string;
  created_at: string;
}

export interface TicketReplyPayload {
  message: string;
}

// ─── Notification ────────────────────────────────────
export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
}

// ─── API Response ────────────────────────────────────
export interface APIResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

// ─── Admin ───────────────────────────────────────────
export interface DashboardStats {
  total_users: number;
  total_sellers: number;
  total_renters: number;
  total_outfits: number;
  total_bookings: number;
  total_revenue: number;
  active_bookings: number;
  pending_approvals: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  bookings: number;
}

// ─── Transaction ─────────────────────────────────────
export interface Transaction {
  id: string;
  user_id: string;
  booking_id: string;
  type: string;
  amount: number;
  status: string;
  gateway: string;
  created_at: string;
}
