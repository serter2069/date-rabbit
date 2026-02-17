import { create } from 'zustand';
import { paymentsApi, ApiError } from '../services/api';

interface EarningsData {
  totalEarnings: number;
  pendingPayouts: number;
  completedBookings: number;
}

interface ConnectStatus {
  complete: boolean;
  payoutsEnabled: boolean;
}

interface EarningsState {
  earnings: EarningsData;
  connectStatus: ConnectStatus | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEarnings: () => Promise<void>;
  fetchConnectStatus: () => Promise<void>;
  startStripeOnboarding: () => Promise<{ success: boolean; url?: string; error?: string }>;
  createPaymentIntent: (bookingId: string) => Promise<{ success: boolean; clientSecret?: string; error?: string }>;

  // Utility
  clearError: () => void;
}

export const useEarningsStore = create<EarningsState>((set) => ({
  earnings: {
    totalEarnings: 0,
    pendingPayouts: 0,
    completedBookings: 0,
  },
  connectStatus: null,
  isLoading: false,
  error: null,

  fetchEarnings: async () => {
    set({ isLoading: true, error: null });

    try {
      const earnings = await paymentsApi.getEarnings();
      set({ earnings, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch earnings';
      set({ error: message, isLoading: false });
    }
  },

  fetchConnectStatus: async () => {
    set({ isLoading: true, error: null });

    try {
      const status = await paymentsApi.getConnectStatus();
      set({ connectStatus: status, isLoading: false });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch connect status';
      set({ error: message, isLoading: false });
    }
  },

  startStripeOnboarding: async () => {
    set({ isLoading: true, error: null });

    try {
      const result = await paymentsApi.createConnectAccount();
      set({ isLoading: false });
      return { success: true, url: result.url };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to start onboarding';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  createPaymentIntent: async (bookingId) => {
    set({ isLoading: true, error: null });

    try {
      const result = await paymentsApi.createPaymentIntent(bookingId);
      set({ isLoading: false });
      return { success: true, clientSecret: result.clientSecret };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create payment';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  clearError: () => set({ error: null }),
}));
