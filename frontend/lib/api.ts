import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
  APIResponse,
  Booking,
  Outfit,
  OutfitFilters,
  CreateOutfitPayload,
  Address,
  AddAddressPayload,
  PaginationMeta,
  BankAccount,
  BankAccountPayload,
  UPIID,
  UPIIDPayload,
  InventoryItem,
  InventoryUpdatePayload,
  SupportTicket,
  TicketReply,
  TicketReplyPayload,
  Notification,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'NEXT_PUBLIC_API_URL is not set. Configure it in Vercel environment variables or .env.production.'
    );
  }
  // Development fallback — warn but proceed
  console.warn(
    '[Kloset] NEXT_PUBLIC_API_URL not set. Using default http://localhost:8080/api/v1'
  );
}

// Create Axios Client
export const client = axios.create({
  baseURL: API_URL || 'http://localhost:8080/api/v1',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Access Token
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('kloset_access_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle Token Refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return client(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('kloset_refresh_token');
      const hasAccessToken = typeof window !== 'undefined' && !!localStorage.getItem('kloset_access_token');

      if (!refreshToken) {
        // Force logout
        localStorage.removeItem('kloset_access_token');
        localStorage.removeItem('kloset_refresh_token');
        localStorage.removeItem('kloset_user');
        localStorage.removeItem('kloset-auth');
        if (typeof window !== 'undefined') {
          document.cookie = 'kloset-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          const pathname = window.location.pathname;
          const protectedPaths = ['/dashboard', '/seller', '/admin', '/booking', '/outfit/new'];
          const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
          if (isProtected) {
            window.location.href = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
          } else if (hasAccessToken) {
            window.location.reload();
          }
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const newAccessToken = data.data.access_token;
        const newRefreshToken = data.data.refresh_token;

        localStorage.setItem('kloset_access_token', newAccessToken);
        localStorage.setItem('kloset_refresh_token', newRefreshToken);
        localStorage.setItem('kloset_user', JSON.stringify(data.data.user));

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        processQueue(null, newAccessToken);
        return client(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem('kloset_access_token');
        localStorage.removeItem('kloset_refresh_token');
        localStorage.removeItem('kloset_user');
        localStorage.removeItem('kloset-auth');
        if (typeof window !== 'undefined') {
          document.cookie = 'kloset-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
          const pathname = window.location.pathname;
          const protectedPaths = ['/dashboard', '/seller', '/admin', '/booking', '/outfit/new'];
          const isProtected = protectedPaths.some((path) => pathname.startsWith(path));
          if (isProtected) {
            window.location.href = `/auth/login?redirect=${encodeURIComponent(pathname)}`;
          } else if (hasAccessToken) {
            window.location.reload();
          }
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── AUTH ENDPOINTS ──────────────────────────────────
export const authAPI = {
  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await client.post<APIResponse<AuthResponse>>('/auth/register', payload);
    return data.data!;
  },

  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await client.post<APIResponse<AuthResponse>>('/auth/login', payload);
    return data.data!;
  },

  googleLogin: async (payload: { credential: string; role?: string }): Promise<AuthResponse> => {
    const { data } = await client.post<APIResponse<AuthResponse>>('/auth/google', payload);
    return data.data!;
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const { data } = await client.post<APIResponse<AuthResponse>>('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return data.data!;
  },

  logout: async (): Promise<void> => {
    await client.post('/auth/logout');
  },

  me: async (): Promise<User> => {
    const { data } = await client.get<APIResponse<User>>('/auth/me');
    return data.data!;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await client.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await client.post('/auth/reset-password', { token, password });
  },
};

// ─── BOOKINGS ENDPOINTS ──────────────────────────────
export interface CreateBookingPayload {
  outfit_id: string;
  pickup_date: string;
  return_date: string;
  size_selected: string;
  delivery_type: 'pickup' | 'delivery';
  delivery_address_id?: string;
}

export interface BookingListResponse {
  bookings: Booking[];
  meta: PaginationMeta;
}

export const bookingsAPI = {
  create: async (payload: CreateBookingPayload): Promise<Booking> => {
    const { data } = await client.post<APIResponse<Booking>>('/bookings', payload);
    return data.data!;
  },

  getById: async (id: string): Promise<Booking> => {
    const { data } = await client.get<APIResponse<Booking>>(`/bookings/${id}`);
    return data.data!;
  },

  listMyBookings: async (
    page = 1,
    perPage = 10,
    status?: string
  ): Promise<BookingListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    if (status) params.set('status', status);

    const { data } = await client.get<APIResponse<Booking[]>>(`/bookings/mine?${params}`);
    return {
      bookings: data.data || [],
      meta: data.meta || { page, per_page: perPage, total: 0, total_pages: 0 },
    };
  },

  listSellerBookings: async (
    page = 1,
    perPage = 10,
    status?: string
  ): Promise<BookingListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString(),
    });
    if (status) params.set('status', status);

    const { data } = await client.get<APIResponse<Booking[]>>(`/bookings/seller?${params}`);
    return {
      bookings: data.data || [],
      meta: data.meta || { page, per_page: perPage, total: 0, total_pages: 0 },
    };
  },

  updateStatus: async (id: string, status: string): Promise<Booking> => {
    const { data } = await client.patch<APIResponse<Booking>>(`/bookings/${id}/status`, { status });
    return data.data!;
  },

  cancel: async (id: string, reason?: string): Promise<void> => {
    await client.post(`/bookings/${id}/cancel`, { reason });
  },
};

// ─── OUTFITS ENDPOINTS ──────────────────────────────
export const outfitsAPI = {
  browse: async (filters?: OutfitFilters): Promise<{ outfits: Outfit[]; meta: PaginationMeta }> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          params.append(key, String(value));
        }
      });
    }
    const { data } = await client.get<APIResponse<Outfit[]>>(`/outfits?${params.toString()}`);
    return { outfits: data.data || [], meta: data.meta || { page: 1, per_page: 20, total: 0, total_pages: 0 } };
  },

  getById: async (id: string): Promise<Outfit> => {
    const { data } = await client.get<APIResponse<Outfit>>(`/outfits/${id}`);
    return data.data!;
  },

  getTrending: async (limit = 12): Promise<Outfit[]> => {
    const { data } = await client.get<APIResponse<Outfit[]>>(`/outfits/trending?limit=${limit}`);
    return data.data || [];
  },

  create: async (payload: CreateOutfitPayload): Promise<Outfit> => {
    const { data } = await client.post<APIResponse<Outfit>>('/outfits', payload);
    return data.data!;
  },

  update: async (id: string, payload: Partial<CreateOutfitPayload>): Promise<void> => {
    await client.put(`/outfits/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/outfits/${id}`);
  },

  submitForApproval: async (id: string): Promise<void> => {
    await client.put(`/outfits/${id}/submit`);
  },

  trackView: async (id: string): Promise<void> => {
    await client.post(`/outfits/${id}/view`);
  },

  getWishlist: async (page = 1): Promise<{ outfits: Outfit[]; meta: PaginationMeta }> => {
    const { data } = await client.get<APIResponse<Outfit[]>>(`/wishlist?page=${page}`);
    return { outfits: data.data || [], meta: data.meta || { page: 1, per_page: 20, total: 0, total_pages: 0 } };
  },

  addToWishlist: async (outfitId: string): Promise<void> => {
    await client.post(`/wishlist/${outfitId}`);
  },

  removeFromWishlist: async (outfitId: string): Promise<void> => {
    await client.delete(`/wishlist/${outfitId}`);
  },

  getSellerOutfits: async (page = 1): Promise<{ outfits: Outfit[]; meta: PaginationMeta }> => {
    const { data } = await client.get<APIResponse<Outfit[]>>(`/seller/outfits?page=${page}`);
    return { outfits: data.data || [], meta: data.meta || { page: 1, per_page: 20, total: 0, total_pages: 0 } };
  },
};

// ─── USER PROFILE / ADDRESSES ENDPOINTS ───────────────
export const userAPI = {
  getProfile: async (): Promise<User> => {
    const { data } = await client.get<APIResponse<User>>('/users/profile');
    return data.data!;
  },

  updateProfile: async (payload: Partial<User>): Promise<void> => {
    await client.put<APIResponse<void>>('/users/profile', payload);
  },

  getAddresses: async (): Promise<Address[]> => {
    const { data } = await client.get<APIResponse<Address[]>>('/users/addresses');
    return data.data || [];
  },

  addAddress: async (payload: AddAddressPayload): Promise<Address> => {
    const { data } = await client.post<APIResponse<Address>>('/users/addresses', payload);
    return data.data!;
  },

  deleteAddress: async (id: string): Promise<void> => {
    await client.delete(`/users/addresses/${id}`);
  },

  setDefaultAddress: async (id: string): Promise<void> => {
    await client.put(`/users/addresses/${id}/default`);
  },
};

// ─── BANK ACCOUNT ENDPOINTS ───────────────────────────
export const bankAPI = {
  list: async (): Promise<BankAccount[]> => {
    const { data } = await client.get<APIResponse<BankAccount[]>>('/seller/bank-accounts');
    return data.data || [];
  },

  create: async (payload: BankAccountPayload): Promise<BankAccount> => {
    const { data } = await client.post<APIResponse<BankAccount>>('/seller/bank-accounts', payload);
    return data.data!;
  },

  update: async (id: string, payload: Partial<BankAccountPayload>): Promise<void> => {
    await client.put(`/seller/bank-accounts/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/seller/bank-accounts/${id}`);
  },

  setDefault: async (id: string): Promise<void> => {
    await client.put(`/seller/bank-accounts/${id}/default`);
  },
};

// ─── UPI ENDPOINTS ─────────────────────────────────────
export const upiAPI = {
  list: async (): Promise<UPIID[]> => {
    const { data } = await client.get<APIResponse<UPIID[]>>('/seller/upi');
    return data.data || [];
  },

  create: async (payload: UPIIDPayload): Promise<UPIID> => {
    const { data } = await client.post<APIResponse<UPIID>>('/seller/upi', payload);
    return data.data!;
  },

  delete: async (id: string): Promise<void> => {
    await client.delete(`/seller/upi/${id}`);
  },

  setDefault: async (id: string): Promise<void> => {
    await client.put(`/seller/upi/${id}/default`);
  },
};

// ─── INVENTORY ENDPOINTS ───────────────────────────────
export const inventoryAPI = {
  list: async (): Promise<InventoryItem[]> => {
    const { data } = await client.get<APIResponse<InventoryItem[]>>('/seller/inventory');
    return data.data || [];
  },

  update: async (outfitId: string, payload: InventoryUpdatePayload): Promise<void> => {
    await client.put(`/seller/inventory/${outfitId}`, payload);
  },
};

// ─── SELLER PAYOUT ENDPOINTS ───────────────────────────
export const sellerPayoutAPI = {
  withdraw: async (amount: number): Promise<void> => {
    await client.post('/seller/payouts/withdraw', { amount });
  },
};

// ─── SELLER SUPPORT TICKET ENDPOINTS ──────────────────
export const sellerSupportAPI = {
  getMyTickets: async (): Promise<SupportTicket[]> => {
    const { data } = await client.get<APIResponse<SupportTicket[]>>('/support/tickets');
    return data.data || [];
  },

  getTicketById: async (id: string): Promise<SupportTicket> => {
    const { data } = await client.get<APIResponse<SupportTicket>>(`/support/tickets/${id}`);
    return data.data!;
  },

  createTicket: async (payload: {
    renterName: string;
    renterEmail: string;
    subject: string;
    description: string;
    priority: string;
  }): Promise<SupportTicket> => {
    const { data } = await client.post<APIResponse<SupportTicket>>('/support/tickets', payload);
    return data.data!;
  },

  addReply: async (ticketId: string, payload: TicketReplyPayload): Promise<TicketReply> => {
    const { data } = await client.post<APIResponse<TicketReply>>(`/support/tickets/${ticketId}/reply`, payload);
    return data.data!;
  },
};

// ─── ADMIN ENDPOINTS ─────────────────────────────────
export interface AdminStats {
  total_users: number;
  total_outfits: number;
  total_bookings: number;
  active_bookings: number;
  total_revenue: number;
  open_disputes: number;
  kyc_queue_count: number;
  pending_approval_count: number;
  timestamp: string;
}

export interface AdminKYCUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected';
  created_at: string;
}

export interface AdminPendingOutfit {
  id: string;
  title: string;
  category: string;
  price_1day: number;
  price_3day: number;
  price_7day: number;
  security_deposit: number;
  seller_id: string;
  seller_name: string;
  seller_email: string;
  status: string;
  created_at: string;
  images: Array<{ id: string; url: string; is_primary: boolean; sort_order: number }>;
}

export interface AdminDispute {
  id: string;
  booking_id: string;
  raised_by: string;
  against: string;
  reason: string;
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'closed';
  resolution: string | null;
  resolution_note: string | null;
  refund_amount: number;
  renter_name: string;
  outfit_title: string;
  deposit_amount: number;
  created_at: string;
}

export interface AIOpsResponse {
  active_agentsCount: number;
  calls_last_hour: number;
  latency_avg_ms: number;
  status: string;
  uptime: string;
  logs: Array<{
    time: string;
    agent: string;
    event: string;
    detail: string;
  }>;
}

export interface AdminLogEntry {
  id?: string;
  timestamp: string;
  level: string;
  message: string;
  context?: Record<string, unknown>;
}

export interface AdminUserEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'renter' | 'seller' | 'admin';
  trust_score: number;
  kyc_status: string;
  wallet_balance: number;
  is_verified: boolean;
  created_at: string;
}

export interface AdminSellerEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  business_name: string | null;
  trust_score: number;
  is_verified: boolean;
  kyc_status: string;
  wallet_balance: number;
  created_at: string;
}

export interface AdminTransactionEntry {
  id: string;
  user_id: string;
  user_name: string;
  booking_id: string;
  booking_ref: string;
  type: string;
  amount: number;
  status: string;
  gateway: string;
  created_at: string;
}

export interface AdminSettings {
  platform_take_rate: number;
  gst_rate: number;
  cleaning_fee: number;
  min_rental_days: number;
  max_rental_days: number;
  security_deposit_multiplier: number;
  auto_release_days: number;
}

export const adminAPI = {
  getStats: async (): Promise<AdminStats> => {
    const { data } = await client.get<APIResponse<AdminStats>>('/admin/stats');
    return data.data!;
  },

  getAIOps: async (): Promise<AIOpsResponse> => {
    const { data } = await client.get<APIResponse<AIOpsResponse>>('/admin/aiops');
    return data.data!;
  },

  getBookings: async (page = 1, perPage = 20, status?: string): Promise<{ bookings: Booking[]; meta: PaginationMeta }> => {
    const params = new URLSearchParams({ page: page.toString(), per_page: perPage.toString() });
    if (status) params.set('status', status);
    const { data } = await client.get<APIResponse<Booking[]>>(`/admin/bookings?${params}`);
    return { bookings: data.data || [], meta: data.meta || { page, per_page: perPage, total: 0, total_pages: 0 } };
  },

  getPaymentTransactions: async (page = 1, perPage = 20): Promise<{ transactions: AdminTransactionEntry[]; meta: PaginationMeta }> => {
    const params = new URLSearchParams({ page: page.toString(), per_page: perPage.toString() });
    const { data } = await client.get<APIResponse<AdminTransactionEntry[]>>(`/admin/payments?${params}`);
    return { transactions: data.data || [], meta: data.meta || { page, per_page: perPage, total: 0, total_pages: 0 } };
  },

  getKYCQueue: async (): Promise<AdminKYCUser[]> => {
    const { data } = await client.get<APIResponse<AdminKYCUser[]>>('/admin/kyc');
    return data.data || [];
  },

  approveKYC: async (userId: string): Promise<void> => {
    await client.put(`/admin/kyc/${userId}/approve`);
  },

  rejectKYC: async (userId: string, reason: string): Promise<void> => {
    await client.put(`/admin/kyc/${userId}/reject`, { reason });
  },

  getPendingOutfits: async (): Promise<AdminPendingOutfit[]> => {
    const { data } = await client.get<APIResponse<AdminPendingOutfit[]>>('/admin/outfits');
    return data.data || [];
  },

  approveOutfit: async (id: string): Promise<void> => {
    await client.put(`/admin/outfits/${id}/approve`);
  },

  rejectOutfit: async (id: string, reason: string): Promise<void> => {
    await client.put(`/admin/outfits/${id}/reject`, { reason });
  },

  getDisputes: async (): Promise<AdminDispute[]> => {
    const { data } = await client.get<APIResponse<AdminDispute[]>>('/admin/disputes');
    return data.data || [];
  },

  resolveDispute: async (
    id: string,
    payload: { resolution: string; note: string; refund_amount: number }
  ): Promise<void> => {
    await client.put(`/admin/disputes/${id}/resolve`, payload);
  },

  getLogs: async (): Promise<AdminLogEntry[]> => {
    const { data } = await client.get<APIResponse<AdminLogEntry[]>>('/admin/logs');
    return data.data || [];
  },

  getUsers: async (): Promise<AdminUserEntry[]> => {
    const { data } = await client.get<APIResponse<AdminUserEntry[]>>('/admin/users');
    return data.data || [];
  },

  getSellers: async (): Promise<AdminSellerEntry[]> => {
    const { data } = await client.get<APIResponse<AdminSellerEntry[]>>('/admin/sellers');
    return data.data || [];
  },

  getTransactions: async (): Promise<AdminTransactionEntry[]> => {
    const { data } = await client.get<APIResponse<AdminTransactionEntry[]>>('/admin/transactions');
    return data.data || [];
  },

  getSettings: async (): Promise<AdminSettings> => {
    const { data } = await client.get<APIResponse<AdminSettings>>('/admin/settings');
    return data.data!;
  },

  updateSettings: async (payload: Partial<AdminSettings>): Promise<void> => {
    await client.put('/admin/settings', payload);
  },

  getRevenueData: async (): Promise<import('@/types').RevenueData[]> => {
    const { data } = await client.get<APIResponse<import('@/types').RevenueData[]>>('/admin/analytics/revenue');
    return data.data || [];
  },
};

// ─── PAYMENTS ENDPOINTS ────────────────────────────────
export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export const paymentsAPI = {
  verify: async (payload: VerifyPaymentPayload): Promise<void> => {
    await client.post('/payments/verify', payload);
  },
};

// ─── DISPUTES ENDPOINTS ──────────────────────────────
export interface RaiseDisputePayload {
  booking_id: string;
  reason: string;
  description: string;
  evidence_photos?: string;
}

export interface DisputeResponse {
  id: string;
  booking_id: string;
  raised_by: string;
  against: string;
  reason: string;
  description: string;
  status: string;
  created_at: string;
}

export const disputesAPI = {
  raise: async (payload: RaiseDisputePayload): Promise<DisputeResponse> => {
    const { data } = await client.post<APIResponse<DisputeResponse>>('/disputes', payload);
    return data.data!;
  },
};

// ─── REVIEWS ENDPOINTS ────────────────────────────────
export interface CreateReviewPayload {
  booking_id: string;
  rating: number;
  comment?: string;
  photos?: string;
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

export const reviewsAPI = {
  create: async (payload: CreateReviewPayload): Promise<ReviewResponse> => {
    const { data } = await client.post<APIResponse<ReviewResponse>>('/reviews', payload);
    return data.data!;
  },

  listOutfitReviews: async (outfitId: string, page = 1, perPage = 10): Promise<{ reviews: ReviewResponse[]; total: number }> => {
    const { data } = await client.get<APIResponse<ReviewResponse[]>>(`/reviews/outfit/${outfitId}?page=${page}&per_page=${perPage}`);
    return {
      reviews: data.data || [],
      total: data.meta?.total || 0,
    };
  },

  listAll: async (limit = 10): Promise<ReviewResponse[]> => {
    const { data } = await client.get<APIResponse<ReviewResponse[]>>(`/reviews?limit=${limit}`);
    return data.data || [];
  },
};

// ─── NOTIFICATION ENDPOINTS ──────────────────────────
export interface NotificationListResponse {
  notifications: Notification[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    unread: number;
  };
}

export const notificationsAPI = {
  list: async (page = 1, perPage = 20): Promise<NotificationListResponse> => {
    const { data } = await client.get<{ data: Notification[]; meta: NotificationListResponse['meta'] }>(
      `/notifications?page=${page}&per_page=${perPage}`
    );
    return {
      notifications: data.data || [],
      meta: data.meta || { page, per_page: perPage, total: 0, unread: 0 },
    };
  },

  markRead: async (id: string): Promise<void> => {
    await client.put(`/notifications/${id}/read`);
  },

  markAllRead: async (): Promise<void> => {
    await client.put('/notifications/read-all');
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await client.get<{ data: Notification[]; meta: { unread: number } }>('/notifications?per_page=1');
    return data.meta?.unread || 0;
  },
};

// ─── SUPPORT TICKETS ENDPOINTS ────────────────────────
export interface TicketPayload {
  renterName: string;
  renterEmail: string;
  subject: string;
  description: string;
  priority: string;
}

export const supportAPI = {
  createTicket: async (payload: TicketPayload) => {
    const res = await client.post('/support/tickets', payload);
    return res.data.data;
  },
  getMyTickets: async () => {
    const res = await client.get('/support/tickets');
    return res.data.data;
  },
  getAllTickets: async () => {
    const res = await client.get('/admin/support/tickets');
    return res.data.data;
  },
  updateStatus: async (id: string, status: string) => {
    const res = await client.put(`/admin/support/tickets/${id}/status`, { status });
    return res.data.data;
  },
  addAgentReply: async (id: string, text: string) => {
    const res = await client.post(`/admin/support/tickets/${id}/reply`, { text });
    return res.data.data;
  },
};

// ─── MESSAGING ENDPOINTS ──────────────────────────────
export interface Conversation {
  id: string;
  participant_name: string;
  participant_avatar: string | null;
  last_message: string;
  last_message_time: string;
  unread_count: number;
}

export interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  created_at: string;
}

export const messagingAPI = {
  getConversations: async (): Promise<Conversation[]> => {
    const { data } = await client.get<APIResponse<Conversation[]>>('/messages/conversations');
    return data.data || [];
  },

  getMessages: async (conversationId: string): Promise<Message[]> => {
    const { data } = await client.get<APIResponse<Message[]>>(`/messages/conversations/${conversationId}`);
    return data.data || [];
  },

  sendMessage: async (conversationId: string, text: string): Promise<void> => {
    await client.post(`/messages/conversations/${conversationId}`, { text });
  },
};

// ─── RETURNS ENDPOINTS ─────────────────────────────────
export interface ReturnRequest {
  id: string;
  booking_id: string;
  booking_ref: string;
  outfit_title: string;
  outfit_image: string | null;
  status: ReturnStatus;
  reason: string;
  pickup_scheduled_date: string | null;
  pickup_completed_at: string | null;
  inspection_status: InspectionStatus;
  inspection_notes: string | null;
  deposit_refund_status: RefundStatus;
  deposit_refund_amount: number | null;
  created_at: string;
  updated_at: string;
}

export type ReturnStatus =
  | 'requested'
  | 'pickup_scheduled'
  | 'picked_up'
  | 'in_inspection'
  | 'inspection_complete'
  | 'refund_pending'
  | 'refund_processed'
  | 'completed'
  | 'rejected';

export type InspectionStatus =
  | 'pending'
  | 'in_progress'
  | 'passed'
  | 'minor_damage'
  | 'significant_damage';

export type RefundStatus =
  | 'not_applicable'
  | 'pending'
  | 'processing'
  | 'completed'
  | 'partially_refunded';

export interface CreateReturnPayload {
  booking_id: string;
  reason: string;
  description?: string;
}

export interface ReturnPolicy {
  return_window_days: number;
  cancellation_free_days: number;
  cancellation_fee_percentage: number;
  late_fee_per_day: number;
  damage_assessment_policy: string;
  refund_timeline_days: number;
}

export const returnsAPI = {
  createReturn: async (payload: CreateReturnPayload): Promise<ReturnRequest> => {
    const { data } = await client.post<APIResponse<ReturnRequest>>('/returns', payload);
    return data.data!;
  },

  getMyReturns: async (): Promise<ReturnRequest[]> => {
    const { data } = await client.get<APIResponse<ReturnRequest[]>>('/returns/mine');
    return data.data || [];
  },

  getReturnById: async (id: string): Promise<ReturnRequest> => {
    const { data } = await client.get<APIResponse<ReturnRequest>>(`/returns/${id}`);
    return data.data!;
  },

  getReturnPolicy: async (): Promise<ReturnPolicy> => {
    try {
      const { data } = await client.get<APIResponse<ReturnPolicy>>('/returns/policy');
      return data.data!;
    } catch {
      return {
        return_window_days: 7,
        cancellation_free_days: 7,
        cancellation_fee_percentage: 50,
        late_fee_per_day: 200,
        damage_assessment_policy: 'Normal wear covered. Significant damage may result in partial deposit withholding.',
        refund_timeline_days: 3,
      };
    }
  },
};

export default client;
