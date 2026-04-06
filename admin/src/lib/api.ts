import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import {
  User,
  Booking,
  Transaction,
  VerificationSubmission,
  Review,
  Dispute,
  DisputeStatus,
  PlatformSettings,
  PaginatedResponse,
  DashboardStats,
  BookingStatus,
  UserRole,
  UserStatus,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://daterabbit-api.smartlaunchhub.com/api';

const TOKEN_COOKIE = 'admin_token';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor: attach token
    this.client.interceptors.request.use((config) => {
      const token = Cookies.get(TOKEN_COOKIE);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor: handle 401
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          Cookies.remove(TOKEN_COOKIE);
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  setToken(token: string) {
    Cookies.set(TOKEN_COOKIE, token, { expires: 7, secure: true, sameSite: 'strict' });
  }

  removeToken() {
    Cookies.remove(TOKEN_COOKIE);
  }

  getToken(): string | undefined {
    return Cookies.get(TOKEN_COOKIE);
  }

  // Auth endpoints
  async sendOtp(email: string): Promise<{ message: string }> {
    const res = await this.client.post<{ message: string }>('/auth/send-otp', { email });
    return res.data;
  }

  async verifyOtp(email: string, otp: string): Promise<{ accessToken: string; user: User }> {
    const res = await this.client.post<{ accessToken: string; user: User }>('/auth/verify-otp', { email, otp });
    return res.data;
  }

  async getCurrentUser(): Promise<User> {
    const res = await this.client.get<User>('/auth/me');
    return res.data;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await this.client.get<DashboardStats>('/admin/stats');
    return res.data;
  }

  // Users
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: UserRole | 'ALL';
    status?: UserStatus | 'ALL';
  }): Promise<PaginatedResponse<User>> {
    const res = await this.client.get<PaginatedResponse<User>>('/admin/users', { params });
    return res.data;
  }

  async getUserById(id: string): Promise<User> {
    const res = await this.client.get<User>(`/admin/users/${id}`);
    return res.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const res = await this.client.patch<User>(`/admin/users/${id}`, data);
    return res.data;
  }

  async banUser(id: string, reason?: string): Promise<User> {
    const res = await this.client.post<User>(`/admin/users/${id}/ban`, { reason });
    return res.data;
  }

  async unbanUser(id: string): Promise<User> {
    const res = await this.client.post<User>(`/admin/users/${id}/unban`);
    return res.data;
  }

  async getUserBookings(userId: string, params?: { page?: number; limit?: number }): Promise<PaginatedResponse<Booking>> {
    const res = await this.client.get<PaginatedResponse<Booking>>(`/admin/users/${userId}/bookings`, { params });
    return res.data;
  }

  // Bookings
  async getBookings(params: {
    page?: number;
    limit?: number;
    status?: BookingStatus | 'ALL';
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }): Promise<PaginatedResponse<Booking>> {
    const res = await this.client.get<PaginatedResponse<Booking>>('/admin/bookings', { params });
    return res.data;
  }

  async getBookingById(id: string): Promise<Booking> {
    const res = await this.client.get<Booking>(`/admin/bookings/${id}`);
    return res.data;
  }

  async cancelBooking(id: string, reason: string): Promise<Booking> {
    const res = await this.client.post<Booking>(`/admin/bookings/${id}/cancel`, { reason });
    return res.data;
  }

  // Payments
  async getTransactions(params: {
    page?: number;
    limit?: number;
    type?: string;
    status?: string;
    userId?: string;
  }): Promise<PaginatedResponse<Transaction>> {
    const res = await this.client.get<PaginatedResponse<Transaction>>('/admin/transactions', { params });
    return res.data;
  }

  async getRevenueStats(): Promise<{
    thisMonth: number;
    lastMonth: number;
    total: number;
    byDay: { date: string; revenue: number }[];
  }> {
    const res = await this.client.get('/admin/revenue');
    return res.data;
  }

  // Verifications
  async getVerifications(params: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<PaginatedResponse<VerificationSubmission>> {
    const res = await this.client.get<PaginatedResponse<VerificationSubmission>>('/admin/verifications', { params });
    return res.data;
  }

  async approveVerification(id: string): Promise<VerificationSubmission> {
    const res = await this.client.post<VerificationSubmission>(`/admin/verifications/${id}/approve`);
    return res.data;
  }

  async rejectVerification(id: string, reason: string): Promise<VerificationSubmission> {
    const res = await this.client.post<VerificationSubmission>(`/admin/verifications/${id}/reject`, { reason });
    return res.data;
  }

  // Reviews
  async getReviews(params: {
    page?: number;
    limit?: number;
    userId?: string;
  }): Promise<PaginatedResponse<Review>> {
    const res = await this.client.get<PaginatedResponse<Review>>('/admin/reviews', { params });
    return res.data;
  }

  async deleteReview(id: string): Promise<void> {
    await this.client.delete(`/admin/reviews/${id}`);
  }

  // Disputes
  async getDisputes(params: {
    page?: number;
    limit?: number;
    status?: DisputeStatus | 'ALL';
  }): Promise<PaginatedResponse<Dispute>> {
    const { status, ...rest } = params;
    const res = await this.client.get<{ items: Dispute[]; total: number; page: number; limit: number }>(
      '/admin/disputes',
      { params: { ...rest, status: status && status !== 'ALL' ? status : undefined } },
    );
    const { items, total, page, limit } = res.data;
    return { data: items, total, page, limit, totalPages: Math.ceil(total / (limit || 20)) };
  }

  async getDisputeById(id: string): Promise<Dispute> {
    const res = await this.client.get<Dispute>(`/admin/disputes/${id}`);
    return res.data;
  }

  async resolveDispute(
    id: string,
    body: { status: 'resolved' | 'closed'; adminNote?: string },
  ): Promise<Dispute> {
    const res = await this.client.patch<Dispute>(`/admin/disputes/${id}/resolve`, body);
    return res.data;
  }

  // Settings
  async getSettings(): Promise<PlatformSettings> {
    const res = await this.client.get<PlatformSettings>('/admin/settings');
    return res.data;
  }

  async updateSettings(data: Partial<PlatformSettings>): Promise<PlatformSettings> {
    const res = await this.client.patch<PlatformSettings>('/admin/settings', data);
    return res.data;
  }
}

export const api = new ApiClient();
