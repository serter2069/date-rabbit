// API Client for DateRabbit Backend
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Verification, VerificationReference } from '../types';

const API_BASE_URL = 'https://daterabbit-api.smartlaunchhub.com/api';

// Token management
let authToken: string | null = null;

export async function getToken(): Promise<string | null> {
  if (authToken) return authToken;
  authToken = await AsyncStorage.getItem('authToken');
  return authToken;
}

export async function setToken(token: string | null): Promise<void> {
  authToken = token;
  if (token) {
    await AsyncStorage.setItem('authToken', token);
  } else {
    await AsyncStorage.removeItem('authToken');
  }
}

// API request helper
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  auth?: boolean;
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
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

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
export const authApi = {
  requestOtp: (email: string) =>
    apiRequest<{ success: boolean; isNewUser: boolean }>('/auth/start', {
      method: 'POST',
      body: { email },
      auth: false,
    }),

  verifyOtp: (email: string, code: string) =>
    apiRequest<{ success: boolean; token: string; user: User }>('/auth/verify', {
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
    apiRequest<{ success: boolean; token: string; user: User }>('/auth/register', {
      method: 'POST',
      body: data,
      auth: false,
    }),
};

// Users API
export const usersApi = {
  getMe: () =>
    apiRequest<User>('/users/me'),

  updateProfile: (data: Partial<User>) =>
    apiRequest<User>('/users/me', {
      method: 'PUT',
      body: data,
    }),

  updateLocation: (latitude: number, longitude: number) =>
    apiRequest<{ success: boolean }>('/users/me/location', {
      method: 'PATCH',
      body: { latitude, longitude },
    }),

  savePushToken: (pushToken: string) =>
    apiRequest<{ success: boolean }>('/users/me/push-token', {
      method: 'POST',
      body: { pushToken },
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
};

// Companions API
export interface SearchCompanionsParams {
  priceMin?: number;
  priceMax?: number;
  maxDistance?: number;
  minRating?: number;
  ageMin?: number;
  ageMax?: number;
  sortBy?: 'recommended' | 'price_low' | 'price_high' | 'rating' | 'distance';
  latitude?: number;
  longitude?: number;
  search?: string;
  page?: number;
  limit?: number;
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
}

export interface CompanionDetail extends CompanionListItem {
  bio?: string;
  photos: { id: string; url: string; order: number }[];
  interests?: string[];
  languages?: string[];
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
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        query.append(key, String(value));
      }
    });
    return apiRequest<CompanionsResponse>(`/companions?${query}`, { auth: false });
  },

  getById: (id: string, latitude?: number, longitude?: number) => {
    const query = new URLSearchParams();
    if (latitude !== undefined) query.append('latitude', String(latitude));
    if (longitude !== undefined) query.append('longitude', String(longitude));
    const queryStr = query.toString();
    return apiRequest<CompanionDetail>(
      `/companions/${id}${queryStr ? `?${queryStr}` : ''}`,
      { auth: false }
    );
  },
};

// Bookings API
export type BookingStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'confirmed'
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
  createdAt: string;
}

export interface CreateBookingData {
  companionId: string;
  activity: string;
  date: string;
  duration: number;
  location?: string;
  latitude?: number;
  longitude?: number;
  message?: string;
}

export const bookingsApi = {
  create: (data: CreateBookingData) =>
    apiRequest<Booking>('/bookings', {
      method: 'POST',
      body: data,
    }),

  getById: (id: string) =>
    apiRequest<Booking>(`/bookings/${id}`),

  getMyBookings: (filter: 'all' | 'pending' | 'upcoming' | 'past' = 'all', page = 1) =>
    apiRequest<{ bookings: Booking[]; total: number }>(`/bookings?filter=${filter}&page=${page}`),

  getRequests: (status: 'pending' | 'accepted' | 'completed' = 'pending') =>
    apiRequest<{ bookings: Booking[]; total: number }>(`/bookings/requests?status=${status}`),

  updateStatus: (id: string, status: 'accepted' | 'declined' | 'cancelled', reason?: string) =>
    apiRequest<Booking>(`/bookings/${id}/status`, {
      method: 'PATCH',
      body: { status, reason },
    }),

  complete: (id: string) =>
    apiRequest<Booking>(`/bookings/${id}/complete`, {
      method: 'POST',
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
  bookingId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface Chat {
  bookingId: string;
  otherUser: {
    id: string;
    name: string;
    photo?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
    isRead: boolean;
  };
  unreadCount: number;
}

export const messagesApi = {
  getChats: () =>
    apiRequest<Chat[]>('/messages/chats'),

  getMessages: (bookingId: string, page = 1) =>
    apiRequest<{ messages: Message[]; total: number }>(`/messages/${bookingId}?page=${page}`),

  sendMessage: (bookingId: string, content: string) =>
    apiRequest<Message>('/messages', {
      method: 'POST',
      body: { bookingId, content },
    }),

  markAsRead: (bookingId: string) =>
    apiRequest<{ success: boolean }>(`/messages/${bookingId}/read`, {
      method: 'POST',
    }),

  getUnreadCount: () =>
    apiRequest<{ count: number }>('/messages/unread-count'),
};

// Payments API
export const paymentsApi = {
  createConnectAccount: () =>
    apiRequest<{ url: string }>('/payments/connect/onboard', {
      method: 'POST',
    }),

  getConnectStatus: () =>
    apiRequest<{ complete: boolean; payoutsEnabled: boolean }>('/payments/connect/status'),

  createPaymentIntent: (bookingId: string) =>
    apiRequest<{ clientSecret: string }>(`/payments/bookings/${bookingId}/pay`, {
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
};

// Media API
export const mediaApi = {
  uploadPhoto: async (uri: string): Promise<{ id: string; url: string }> => {
    const token = await getToken();
    const formData = new FormData();

    // Get file extension
    const extension = uri.split('.').pop() || 'jpg';
    const type = `image/${extension === 'jpg' ? 'jpeg' : extension}`;

    formData.append('photo', {
      uri,
      type,
      name: `photo.${extension}`,
    } as unknown as Blob);

    const response = await fetch(`${API_BASE_URL}/media/photos`, {
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

  deletePhoto: (id: string) =>
    apiRequest<{ success: boolean }>(`/media/photos/${id}`, {
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
    formData.append('photo', {
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
    formData.append('photo', {
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
    formData.append('video', {
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
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'seeker' | 'companion';
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
  stripeOnboardingComplete?: boolean;
  expoPushToken?: string;
  createdAt: string;
}
