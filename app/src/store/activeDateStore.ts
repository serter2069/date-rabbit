import { create } from 'zustand';
import { activeDateApi, ActiveBooking } from '../services/activeDateApi';

interface ActiveDateState {
  activeBooking: ActiveBooking | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchActive: () => Promise<void>;
  fetchBooking: (id: string) => Promise<void>;
  startDate: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  seekerCheckin: (bookingId: string, coords?: { lat: number; lon: number }) => Promise<{ success: boolean; error?: string }>;
  companionCheckin: (bookingId: string, coords?: { lat: number; lon: number }) => Promise<{ success: boolean; error?: string }>;
  safetyCheckin: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  extendDate: (bookingId: string, additionalHours: number) => Promise<{ success: boolean; error?: string }>;
  endEarly: (bookingId: string) => Promise<{ success: boolean; error?: string }>;
  triggerSOS: (bookingId: string, coords?: { lat: number; lon: number }) => Promise<{ success: boolean; error?: string }>;
  clearError: () => void;
  clearActive: () => void;
}

export const useActiveDateStore = create<ActiveDateState>((set) => ({
  activeBooking: null,
  isLoading: false,
  error: null,

  fetchActive: async () => {
    set({ isLoading: true, error: null });
    try {
      const booking = await activeDateApi.getActive();
      set({ activeBooking: booking, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to fetch active date', isLoading: false });
    }
  },

  fetchBooking: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const booking = await activeDateApi.getBookingById(id);
      set({ activeBooking: booking, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Failed to fetch booking', isLoading: false });
    }
  },

  startDate: async (bookingId: string) => {
    try {
      const booking = await activeDateApi.startDate(bookingId);
      set({ activeBooking: booking });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to start date' };
    }
  },

  seekerCheckin: async (bookingId: string, coords?) => {
    try {
      const booking = await activeDateApi.seekerCheckin(bookingId, coords);
      set({ activeBooking: booking });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Check-in failed' };
    }
  },

  companionCheckin: async (bookingId: string, coords?) => {
    try {
      const booking = await activeDateApi.companionCheckin(bookingId, coords);
      set({ activeBooking: booking });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Check-in failed' };
    }
  },

  safetyCheckin: async (bookingId: string) => {
    try {
      await activeDateApi.safetyCheckin(bookingId);
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Safety check-in failed' };
    }
  },

  extendDate: async (bookingId: string, additionalHours: number) => {
    try {
      const booking = await activeDateApi.extendDate(bookingId, additionalHours);
      set({ activeBooking: booking });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Extend request failed' };
    }
  },

  endEarly: async (bookingId: string) => {
    try {
      const booking = await activeDateApi.endEarly(bookingId);
      set({ activeBooking: booking });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to end date' };
    }
  },

  triggerSOS: async (bookingId: string, coords?) => {
    try {
      const booking = await activeDateApi.triggerSOS(bookingId, coords);
      set({ activeBooking: booking });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'SOS failed' };
    }
  },

  clearError: () => set({ error: null }),
  clearActive: () => set({ activeBooking: null }),
}));
