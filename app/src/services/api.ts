// API Client for DateRabbit Backend
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Verification, VerificationReference, PreChatStatus } from '../types';
import { useNetworkStore } from '../store/networkStore';

const API_BASE_URL = 'http://localhost:3004/api'; // audit mode — local backend with DEV_AUTH=true
const API_TIMEOUT_MS = 10_000; // 10 seconds

// Token storage keys
const TOKEN_KEY = 'authToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// In-memory cache for tokens (avoids repeated SecureStore reads)
let authToken: string | null = null;
let refreshTokenCache: string | null = null;

// ─── Refresh-cycle state ───────────────────────────────────────────────────
// isRefreshing prevents concurrent 401 responses from triggering parallel refresh calls.
// pendingQueue holds resolve/reject callbacks of requests that arrived during a refresh.
let isRefreshing = false;
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
let pendingQueue: QueueEntry[] = [];

function drainQueue(token: string) {
  pendingQueue.forEach((entry) => entry.resolve(token));
  pendingQueue = [];
}

function rejectQueue(err: unknown) {
  pendingQueue.forEach((entry) => entry.reject(err));
  pendingQueue = [];
}

// Debounce timer for offline detection — prevents false banner on cold start / slow API
let offlineTimer: ReturnType<typeof setTimeout> | null = null;

// ─── Access token helpers ──────────────────────────────────────────────────

export async function getToken(): Promise<string | null> {
  if (authToken) return authToken;
  if (Platform.OS === 'web') {
    authToken = localStorage.getItem(TOKEN_KEY);
  } else {
    authToken = await SecureStore.getItemAsync(TOKEN_KEY);
  }
  return authToken;
}

export async function setToken(token: string | null): Promise<void> {
  authToken = token;
  if (Platform.OS === 'web') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } else {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  }
}

// ─── Refresh token helpers ─────────────────────────────────────────────────

export async function getRefreshToken(): Promise<string | null> {
  if (refreshTokenCache) return refreshTokenCache;
  if (Platform.OS === 'web') {
    refreshTokenCache = localStorage.getItem(REFRESH_TOKEN_KEY);
  } else {
    refreshTokenCache = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  }
  return refreshTokenCache;
}

export async function setRefreshToken(token: string | null): Promise<void> {
  refreshTokenCache = token;
  if (Platform.OS === 'web') {
    if (token) {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    }
  } else {
    if (token) {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  }
}

// ─── Internal refresh execution (called by interceptor and proactive refresh) ─

/**
 * Performs a single token rotation call against POST /auth/refresh.
 * Updates both tokens in storage on success.
 * Returns new access token, or throws on failure.
 * NOT exported — callers should use attemptTokenRefresh().
 */
async function executeRefresh(): Promise<string> {
  const stored = await getRefreshToken();
  if (!stored) {
    throw new ApiError('No refresh token available', 401);
  }

  // Direct fetch — bypasses apiRequest to avoid recursive 401 interception
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: stored }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.message || 'Token refresh failed', response.status);
  }

  const data = await response.json();
  const newAccessToken: string = data.accessToken || data.token;
  const newRefreshToken: string = data.refreshToken;

  await setToken(newAccessToken);
  await setRefreshToken(newRefreshToken);

  return newAccessToken;
}

/**
 * Thread-safe token refresh: if a refresh is already in progress, queues the
 * caller and resolves when the first refresh completes. Only one /auth/refresh
 * request will be sent regardless of how many concurrent 401s triggered this.
 */
export async function attemptTokenRefresh(): Promise<string> {
  if (isRefreshing) {
    // Wait for the in-progress refresh to finish
    return new Promise<string>((resolve, reject) => {
      pendingQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;
  try {
    const newToken = await executeRefresh();
    drainQueue(newToken);
    return newToken;
  } catch (err) {
    rejectQueue(err);
    throw err;
  } finally {
    isRefreshing = false;
  }
}

// API request helper
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  _isRetry?: boolean; // internal flag — prevents recursive 401 retry
}

export class ApiError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, auth = true, _isRetry = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // 10-second timeout to prevent infinite loading states
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new ApiError('Request timed out. Please try again.', 408);
    }
    // Network error (no connection, DNS failure, etc.)
    // Debounce: only mark offline after 2500ms grace period to avoid false banner on cold start
    if (offlineTimer) clearTimeout(offlineTimer);
    offlineTimer = setTimeout(() => {
      useNetworkStore.getState().setOffline();
      offlineTimer = null;
    }, 2500);
    throw new ApiError('Network error. Please check your connection.', 0);
  }
  clearTimeout(timeoutId);

  // Successful network response — cancel any pending offline timer and mark as online
  if (offlineTimer) {
    clearTimeout(offlineTimer);
    offlineTimer = null;
  }
  useNetworkStore.getState().setOnline();

  // ── Reactive 401 interceptor ──────────────────────────────────────────────
  // On 401: attempt token refresh once, then retry the original request.
  // Guards:
  //   - _isRetry=true  → already retried, don't loop again
  //   - endpoint contains /auth/refresh → never retry refresh itself (circular)
  //   - auth=false → no-auth endpoints can't benefit from a refresh
  if (
    response.status === 401 &&
    auth &&
    !_isRetry &&
    !endpoint.includes('/auth/refresh')
  ) {
    try {
      await attemptTokenRefresh();
      // Retry original request with the new access token (already saved in storage)
      return apiRequest<T>(endpoint, { ...options, _isRetry: true, auth: true });
    } catch {
      // Refresh failed — clear tokens and propagate 401 so logout can happen
      await setToken(null);
      await setRefreshToken(null);
      throw new ApiError('Session expired. Please log in again.', 401);
    }
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(
      data.message || `Request failed: ${response.status}`,
      response.status
    );
  }

  return data;
}

// Auth API
// Shape returned by verify/register — includes both tokens plus backward-compat `token` alias
export interface AuthTokenResponse {
  success: boolean;
  accessToken: string;
  token: string;         // backward compat — same value as accessToken
  refreshToken: string;
  user: User;
}

export const authApi = {
  requestOtp: (email: string) =>
    apiRequest<{ success: boolean; isNewUser: boolean }>('/auth/start', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  verifyOtp: (email: string, code: string) =>
    apiRequest<AuthTokenResponse>('/auth/verify', {
      method: 'POST',
      body: { email, code },
      auth: false,
    }),

  register: (data: {
    email: string;
    name: string;
    role: 'seeker' | 'companion';
    age?: number;
    bio?: string;
    location?: string;
    hourlyRate?: number;
  }) =>
    apiRequest<AuthTokenResponse>('/auth/register', {
      method: 'POST',
      body: data,
    }),

  refresh: (refreshToken: string) =>
    apiRequest<AuthTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
      auth: false,
    }),

  logout: () =>
    apiRequest<{ success: boolean }>('/auth/logout', {
      method: 'POST',
    }),
};

// Users API
export const usersApi = {
  heartbeat: () =>
    apiRequest<{ success: boolean }>('/users/heartbeat', { method: 'PATCH' }),

  getMe: () =>
    apiRequest<User>('/users/me'),

  updateProfile: (data: Partial<User>) =>
    apiRequest<User>('/users/me', {
      method: 'PUT',
      body: data,
    }),

  blockUser: (userId: string, reason?: string) =>
    apiRequest<{ success: boolean }>(`/users/${userId}/block`, {
      method: 'POST',
      body: { reason },
    }),

  unblockUser: (userId: string) =>
    apiRequest<{ success: boolean }>(`/users/${userId}/block`, {
      method: 'DELETE',
    }),

  getBlockedUsers: () =>
    apiRequest<{ id: string; name: string; blockedAt: string }[]>('/users/blocked'),

  getVerificationStatus: () =>
    apiRequest<{
      isVerified: boolean;
      canRequest: boolean;
      requirements: { name: string; met: boolean; description: string }[];
    }>('/users/verification/status'),

  requestVerification: () =>
    apiRequest<{ success: boolean; message: string }>('/users/verification/request', {
      method: 'POST',
    }),

  deleteAccount: () =>
    apiRequest<{ success: boolean; message: string }>('/users/me', {
      method: 'DELETE',
    }),

  reportUser: (userId: string, reason: string, description?: string) =>
    apiRequest<{ success: boolean; message: string }>(`/users/${userId}/report`, {
      method: 'POST',
      body: { reason, description },
    }),

  getFavorites: () =>
    apiRequest<{ favorites: string[] }>('/users/favorites'),

  addFavorite: (companionId: string) =>
    apiRequest<{ success: boolean }>(`/users/favorites/${companionId}`, {
      method: 'POST',
    }),

  removeFavorite: (companionId: string) =>
    apiRequest<{ success: boolean }>(`/users/favorites/${companionId}`, {
      method: 'DELETE',
    }),

  watchOnline: (companionId: string) =>
    apiRequest<{ success: boolean }>(`/users/${companionId}/watch-online`, {
      method: 'POST',
    }),

  unwatchOnline: (companionId: string) =>
    apiRequest<{ success: boolean }>(`/users/${companionId}/watch-online`, {
      method: 'DELETE',
    }),

  getWatchedOnline: () =>
    apiRequest<{ watchedIds: string[] }>('/users/watch-online'),

  uploadProfilePhoto: async (uri: string): Promise<{ url: string }> => {
    const token = await getToken();
    const formData = new FormData();
    const extension = uri.split('.').pop()?.split('?')[0] || 'jpg';
    const mimeType = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    formData.append('file', {
      uri,
      type: mimeType,
      name: `profile-photo.${extension}`,
    } as unknown as Blob);
    const response = await fetch(`${API_BASE_URL}/users/me/photos/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.message || 'Photo upload failed', response.status);
    }
    return data;
  },

  uploadProfileVideo: async (uri: string): Promise<{ url: string }> => {
    const token = await getToken();
    const formData = new FormData();
    const extension = uri.split('.').pop()?.split('?')[0]?.toLowerCase() || 'mp4';
    // Normalize mov extension to correct MIME type
    const mimeType = extension === 'mov' ? 'video/quicktime' : `video/${extension}`;
    formData.append('video', {
      uri,
      type: mimeType,
      name: `profile-video.${extension}`,
    } as unknown as Blob);
    const response = await fetch(`${API_BASE_URL}/users/me/video/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.message || 'Video upload failed', response.status);
    }
    return data;
  },
};

// Companions API
export interface SearchCompanionsParams {
  priceMin?: number;
  priceMax?: number;
  maxDistance?: number;
  minRating?: number;
  ageMin?: number;
  ageMax?: number;
  sortBy?: 'recommended' | 'price_low' | 'price_high' | 'rating' | 'distance' | 'new';
  latitude?: number;
  longitude?: number;
  search?: string;
  page?: number;
  limit?: number;
  activityTypes?: string[];
  availability?: string;
}

export interface CompanionListItem {
  id: string;
  name: string;
  age?: number;
  location?: string;
  hourlyRate: number;
  rating: number;
  reviewCount: number;
  isVerified: boolean;
  primaryPhoto?: string;
  distance?: number;
  shortBio?: string;
  lastSeen?: string | null;
}

export interface CompanionDetail extends CompanionListItem {
  bio?: string;
  photos: { id: string; url: string; order: number }[];
  interests?: string[];
  languages?: string[];
  reviews?: { id: string; name: string; rating: number; text: string; date: string }[];
  lastSeen?: string | null;
  createdAt: string;
}

export interface CompanionsResponse {
  companions: CompanionListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const companionsApi = {
  search: (params: SearchCompanionsParams = {}) => {
    const query = new URLSearchParams();
    const { activityTypes, ...rest } = params;
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, String(value));
      }
    });
    // Serialize activityTypes as a single comma-separated param (only if non-empty)
    if (activityTypes && activityTypes.length > 0) {
      query.append('activityTypes', activityTypes.join(','));
    }
    return apiRequest<CompanionsResponse>(`/companions?${query}`);
  },

  getById: (id: string, latitude?: number, longitude?: number) => {
    const query = new URLSearchParams();
    if (latitude !== undefined) query.append('latitude', String(latitude));
    if (longitude !== undefined) query.append('longitude', String(longitude));
    const queryStr = query.toString();
    return apiRequest<CompanionDetail>(
      `/companions/${id}${queryStr ? `?${queryStr}` : ''}`
    );
  },
};

// Bookings API
export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'confirmed'
  | 'checkin_ready'
  | 'active'
  | 'cancelled'
  | 'completed';

export interface Booking {
  id: string;
  status: BookingStatus;
  activity: string;
  date: string;
  duration: number;
  location?: string;
  message?: string;
  cancellationReason?: string;
  cancelledByUserId?: string;
  refundPercent?: number;
  hourlyRate: number;
  subtotal: number;
  platformFee: number;
  total: number;
  companionEarnings: number;
  isPaid: boolean;
  seeker: {
    id: string;
    name: string;
    photo?: string;
  };
  companion: {
    id: string;
    name: string;
    photo?: string;
    rating: number;
  };
  seekerRating?: { average: number; count: number } | null;
  noShowReason?: string;
  createdAt: string;
}

export interface CreateBookingData {
  companionId: string;
  activity: string;
  dateTime: string;
  duration: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  packageId?: string;
}

export const bookingsApi = {
  create: (data: CreateBookingData) =>
    apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: data,
    }),

  getById: async (id: string) => {
    const b = await apiRequest<any>(`/bookings/${id}`);
    // Normalize companion to always have safe defaults, even if API returns undefined or {}
    const rawCompanion = b.companion ?? {};
    return {
      ...b,
      date: b.date ?? b.dateTime,
      total: typeof b.total === 'number' ? b.total : parseFloat(b.totalPrice ?? b.total ?? '0'),
      subtotal: typeof b.subtotal === 'number' ? b.subtotal : parseFloat(b.subtotal ?? '0'),
      platformFee: typeof b.platformFee === 'number' ? b.platformFee : parseFloat(b.platformFee ?? '0'),
      hourlyRate: typeof b.hourlyRate === 'number' ? b.hourlyRate : parseFloat(b.hourlyRate ?? rawCompanion.hourlyRate ?? '0'),
      companionEarnings: typeof b.companionEarnings === 'number' ? b.companionEarnings : parseFloat(b.companionEarnings ?? '0'),
      isPaid: b.isPaid ?? false,
      companion: {
        id: rawCompanion.id ?? '',
        name: rawCompanion.name ?? '',
        rating: rawCompanion.rating ?? 0,
        photo: rawCompanion.photo ?? rawCompanion.photos?.[0]?.url ?? null,
      },
    } as Booking;
  },

  getMyBookings: async (filter: 'all' | 'pending' | 'upcoming' | 'past' = 'all', page = 1) => {
    const response = await apiRequest<
      { bookings: Booking[]; total: number } | { asSeeker: Booking[]; asCompanion: Booking[] }
    >(`/bookings?filter=${filter}&page=${page}`);

    // Handle both API response shapes
    const raw = 'bookings' in response
      ? response.bookings
      : [...(response.asSeeker || []), ...(response.asCompanion || [])];

    // Normalize field names (API may send dateTime/totalPrice instead of date/total)
    // companion is always normalized to a safe object with defaults so callers never crash
    const bookings = raw.map((b: any) => {
      const rawCompanion = b.companion ?? {};
      return {
        ...b,
        date: b.date ?? b.dateTime,
        total: typeof b.total === 'number' ? b.total : parseFloat(b.totalPrice ?? b.total ?? '0'),
        subtotal: typeof b.subtotal === 'number' ? b.subtotal : parseFloat(b.subtotal ?? '0'),
        platformFee: typeof b.platformFee === 'number' ? b.platformFee : parseFloat(b.platformFee ?? '0'),
        hourlyRate: typeof b.hourlyRate === 'number' ? b.hourlyRate : parseFloat(b.hourlyRate ?? rawCompanion.hourlyRate ?? '0'),
        companionEarnings: typeof b.companionEarnings === 'number' ? b.companionEarnings : parseFloat(b.companionEarnings ?? '0'),
        isPaid: b.isPaid ?? false,
        companion: {
          id: rawCompanion.id ?? '',
          name: rawCompanion.name ?? '',
          rating: rawCompanion.rating ?? 0,
          photo: rawCompanion.photo ?? rawCompanion.photos?.[0]?.url ?? null,
        },
      };
    });

    return { bookings, total: 'bookings' in response ? (response as any).total : bookings.length };
  },

  getRequests: (status: 'pending' | 'accepted' | 'completed' = 'pending') =>
    apiRequest<{ bookings: Booking[]; total: number }>(`/bookings/requests?status=${status}`),

  getCancelPreview: (id: string) =>
    apiRequest<{ refundPercent: number; refundAmount: number; totalPrice: number; cancelledByRole: string }>(
      `/bookings/${id}/cancel-preview`,
    ),

  updateStatus: (id: string, status: 'accepted' | 'declined' | 'cancelled', reason?: string) => {
    if (status === 'accepted') {
      return apiRequest<Booking>(`/bookings/${id}/confirm`, { method: 'PUT' });
    } else {
      return apiRequest<Booking>(`/bookings/${id}/cancel`, { method: 'PUT', body: { reason } });
    }
  },

  complete: (id: string) =>
    apiRequest<Booking>(`/bookings/${id}/complete`, {
      method: 'PUT',
    }),

  createReview: (id: string, rating: number, comment?: string) =>
    apiRequest<{ id: string; rating: number; comment?: string }>(`/bookings/${id}/review`, {
      method: 'POST',
      body: { rating, comment },
    }),
};

// Messages API
export interface Message {
  id: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  isOwn?: boolean;
}

export interface Chat {
  id: string; // conversation id
  otherUser: {
    id: string;
    name: string;
    photos?: any[];
  };
  lastMessage?: string | null;
  lastMessageAt?: string;
  unreadCount?: number;
}

export const messagesApi = {
  getChats: () =>
    apiRequest<Chat[]>('/messages/conversations'),

  getMessages: (userId: string, page = 1, limit = 50) =>
    apiRequest<any[]>(`/messages/${userId}?limit=${limit}&offset=${(page - 1) * limit}`),

  sendMessage: (userId: string, content: string) =>
    apiRequest<any>(`/messages/${userId}`, {
      method: 'POST',
      body: { content },
    }),

  getUnreadCount: () =>
    apiRequest<{ count: number }>('/messages/unread-count'),

  getPreChatStatus: (userId: string) =>
    apiRequest<PreChatStatus>(`/messages/${userId}/pre-chat`),
};

// Payments API
export const paymentsApi = {
  createConnectAccount: () =>
    apiRequest<{ url: string }>(
      `/payments/connect/onboard${Platform.OS !== 'web' ? '?platform=native' : ''}`,
      { method: 'POST' },
    ),

  getConnectStatus: () =>
    apiRequest<{ complete: boolean; payoutsEnabled: boolean }>('/payments/connect/status'),

  createPaymentIntent: (bookingId: string) =>
    apiRequest<{
      clientSecret: string;
      feeBreakdown?: {
        subtotal: number;
        platformFee: number;
        stripeFee: number;
        totalCharged: number;
      };
    }>(`/payments/bookings/${bookingId}/pay`, {
      method: 'POST',
    }),

  getEarnings: () =>
    apiRequest<{
      totalEarnings: number;
      pendingPayouts: number;
      completedBookings: number;
    }>('/payments/earnings'),

  getEarningsHistory: (page = 1, limit = 20) =>
    apiRequest<{
      transactions: {
        id: string;
        type: 'earning' | 'payout';
        amount: number;
        status: 'completed' | 'pending' | 'failed';
        description: string;
        seekerName?: string;
        activity?: string;
        createdAt: string;
      }[];
      total: number;
      page: number;
      totalPages: number;
    }>(`/payments/earnings/history?page=${page}&limit=${limit}`),

  getPayoutBalance: () =>
    apiRequest<{
      available: number;
      pending: number;
      currency: string;
    }>('/payments/payouts/balance'),

  createPayout: (amount?: number) =>
    apiRequest<{
      success: boolean;
      payoutId?: string;
      amount?: number;
      message: string;
    }>('/payments/payouts/create', {
      method: 'POST',
      body: amount ? { amount } : {},
    }),

  getPayoutHistory: (limit = 10) =>
    apiRequest<{
      payouts: {
        id: string;
        amount: number;
        status: string;
        arrivalDate: string;
        createdAt: string;
      }[];
    }>(`/payments/payouts/history?limit=${limit}`),

  createSetupIntent: () =>
    apiRequest<{ clientSecret: string }>('/payments/methods/setup', {
      method: 'POST',
    }),

  listPaymentMethods: () =>
    apiRequest<{
      paymentMethods: {
        id: string;
        brand: string;
        last4: string;
        expMonth: number;
        expYear: number;
      }[];
    }>('/payments/methods'),

  deletePaymentMethod: (paymentMethodId: string) =>
    apiRequest<{ success: boolean }>(`/payments/methods/${paymentMethodId}`, {
      method: 'DELETE',
    }),
};

// Calendar API
export const calendarApi = {
  blockDates: (dates: string[], reason?: string) =>
    apiRequest<{ blocked: number }>('/calendar/block', {
      method: 'POST',
      body: { dates, reason },
    }),

  unblockDates: (dates: string[]) =>
    apiRequest<{ unblocked: number }>('/calendar/block', {
      method: 'DELETE',
      body: { dates },
    }),

  getBlockedDates: (year?: number, month?: number) => {
    const query = new URLSearchParams();
    if (year) query.append('year', String(year));
    if (month) query.append('month', String(month));
    const queryStr = query.toString();
    return apiRequest<{ dates: string[] | { date: string; reason?: string }[] }>(
      `/calendar/blocked${queryStr ? `?${queryStr}` : ''}`
    );
  },
};

// Verification API
export const verificationApi = {
  start: () =>
    apiRequest<Verification>('/verification/start', { method: 'POST' }),

  getStatus: () =>
    apiRequest<Verification>('/verification/status'),

  submitSSN: (ssnLast4: string) =>
    apiRequest<Verification>('/verification/ssn', {
      method: 'POST',
      body: { ssnLast4 },
    }),

  uploadId: async (uri: string): Promise<Verification> => {
    const token = await getToken();
    const formData = new FormData();
    const extension = uri.split('.').pop() || 'jpg';
    const type = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    formData.append('file', {
      uri,
      type,
      name: `id-photo.${extension}`,
    } as unknown as Blob);
    const response = await fetch(`${API_BASE_URL}/verification/upload-id`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status);
    }
    return data;
  },

  uploadSelfie: async (uri: string): Promise<Verification> => {
    const token = await getToken();
    const formData = new FormData();
    const extension = uri.split('.').pop() || 'jpg';
    const type = `image/${extension === 'jpg' ? 'jpeg' : extension}`;
    formData.append('file', {
      uri,
      type,
      name: `selfie.${extension}`,
    } as unknown as Blob);
    const response = await fetch(`${API_BASE_URL}/verification/selfie`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status);
    }
    return data;
  },

  uploadVideo: async (uri: string): Promise<Verification> => {
    const token = await getToken();
    const formData = new FormData();
    const extension = uri.split('.').pop() || 'mp4';
    const type = `video/${extension}`;
    formData.append('file', {
      uri,
      type,
      name: `video.${extension}`,
    } as unknown as Blob);
    const response = await fetch(`${API_BASE_URL}/verification/video`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new ApiError(data.message || 'Upload failed', response.status);
    }
    return data;
  },

  submitReferences: (refs: VerificationReference[]) =>
    apiRequest<Verification>('/verification/references', {
      method: 'POST',
      body: { references: refs },
    }),

  submitConsent: (consentGiven: boolean) =>
    apiRequest<Verification>('/verification/consent', {
      method: 'POST',
      body: { consentGiven },
    }),

  submit: () =>
    apiRequest<Verification>('/verification/submit', { method: 'POST' }),

  createIdentitySession: () =>
    apiRequest<{ url: string; sessionId: string }>('/verification/identity-session', {
      method: 'POST',
    }),

  getIdentityStatus: () =>
    apiRequest<{ status: string; verificationStatus: string }>('/verification/identity-status'),
};

// Referral API
export const referralApi = {
  getMyCode: () =>
    apiRequest<{ code: string }>('/referral/my-code'),

  applyCode: (code: string) =>
    apiRequest<{ success: boolean; message: string }>('/referral/apply', {
      method: 'POST',
      body: { code },
    }),

  getMyBonus: () =>
    apiRequest<{ hasBgcDiscount: boolean; discountPercent: number }>('/referral/my-bonus'),

  getMyStats: () =>
    apiRequest<{ invited: number; credited: number }>('/referral/my-stats'),
};

// Packages API
export interface DatePackageTemplate {
  id: string;
  slug: string;
  name: string;
  nameRu: string;
  description: string;
  descriptionRu: string;
  defaultDuration: number;
  defaultActivity: string;
  icon: string;
}

export interface DatePackage {
  id: string;
  companionId: string;
  templateId: string;
  price: number;
  customDescription?: string;
  isActive: boolean;
  template?: DatePackageTemplate;
  createdAt: string;
  updatedAt: string;
}

export const packagesApi = {
  getTemplates: () =>
    apiRequest<DatePackageTemplate[]>('/packages/templates'),

  getCompanionPackages: (companionId: string) =>
    apiRequest<DatePackage[]>(`/packages/companion/${companionId}`),

  getMyPackages: () =>
    apiRequest<DatePackage[]>('/packages/my'),

  createPackage: (data: { templateId: string; price: number; customDescription?: string }) =>
    apiRequest<DatePackage>('/packages/my', {
      method: 'POST',
      body: data,
    }),

  updatePackage: (id: string, data: { price?: number; customDescription?: string; isActive?: boolean }) =>
    apiRequest<DatePackage>(`/packages/my/${id}`, {
      method: 'PUT',
      body: data,
    }),

  deletePackage: (id: string) =>
    apiRequest<{ success: boolean }>(`/packages/my/${id}`, {
      method: 'DELETE',
    }),
};

export interface City {
  id: string;
  name: string;
  state: string;
  isActive: boolean;
}

export const citiesApi = {
  getActive: () =>
    apiRequest<City[]>('/cities?active=true', { auth: false }),

  // Admin endpoints
  adminGetAll: () =>
    apiRequest<City[]>('/admin/cities'),

  adminCreate: (data: { name: string; state: string }) =>
    apiRequest<City>('/admin/cities', {
      method: 'POST',
      body: data,
    }),

  adminToggle: (id: string, isActive: boolean) =>
    apiRequest<City>(`/admin/cities/${id}`, {
      method: 'PATCH',
      body: { isActive },
    }),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'seeker' | 'companion';
  isAdmin?: boolean;
  age?: number;
  bio?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  hourlyRate?: number;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  verificationStatus?: import('../types').VerificationStatus;
  photos?: { id: string; url: string; order: number; isPrimary: boolean }[];
  profileVideoUrl?: string;
  stripeOnboardingComplete?: boolean;
  isPublicProfile?: boolean;
  expoPushToken?: string;
  notificationsEnabled?: boolean;
  notificationPreferences?: {
    bookings: boolean;
    messages: boolean;
    reminders: boolean;
    payments: boolean;
  };
  createdAt: string;
}
