import { create } from 'zustand';
import { bookingsApi, Booking, CreateBookingData, ApiError } from '../services/api';

type BookingFilter = 'all' | 'pending' | 'upcoming' | 'past';

interface BookingsState {
  bookings: Booking[];
  requests: Booking[]; // For companions - incoming requests
  total: number;
  isLoading: boolean;
  error: string | null;
  currentFilter: BookingFilter;

  // Actions for seekers (creating bookings)
  createBooking: (data: CreateBookingData) => Promise<{ success: boolean; booking?: Booking; error?: string }>;

  // Actions for companions (managing requests)
  acceptRequest: (id: string) => Promise<{ success: boolean; error?: string }>;
  declineRequest: (id: string, reason?: string) => Promise<{ success: boolean; error?: string }>;

  // Shared actions
  cancelBooking: (id: string, reason?: string) => Promise<{ success: boolean; error?: string }>;
  completeBooking: (id: string) => Promise<{ success: boolean; error?: string }>;
  createReview: (bookingId: string, rating: number, comment?: string) => Promise<{ success: boolean; error?: string }>;

  // Fetch actions
  fetchMyBookings: (filter?: BookingFilter, page?: number) => Promise<void>;
  fetchRequests: (status?: 'pending' | 'accepted' | 'completed') => Promise<void>;
  getBookingById: (id: string) => Promise<Booking | null>;

  // Utility
  clearError: () => void;
  setFilter: (filter: BookingFilter) => void;
}

export const useBookingsStore = create<BookingsState>((set, get) => ({
  bookings: [],
  requests: [],
  total: 0,
  isLoading: false,
  error: null,
  currentFilter: 'all',

  createBooking: async (data) => {
    set({ isLoading: true, error: null });

    try {
      const booking = await bookingsApi.create(data);
      set((state) => ({
        bookings: [booking, ...state.bookings],
        isLoading: false,
      }));
      return { success: true, booking };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create booking';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  acceptRequest: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const updated = await bookingsApi.updateStatus(id, 'accepted');
      set((state) => ({
        requests: state.requests.map((r) => (r.id === id ? updated : r)),
        isLoading: false,
      }));
      return { success: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to accept request';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  declineRequest: async (id, reason) => {
    set({ isLoading: true, error: null });

    try {
      const updated = await bookingsApi.updateStatus(id, 'declined', reason);
      set((state) => ({
        requests: state.requests.map((r) => (r.id === id ? updated : r)),
        isLoading: false,
      }));
      return { success: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to decline request';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  cancelBooking: async (id, reason) => {
    set({ isLoading: true, error: null });

    try {
      const updated = await bookingsApi.updateStatus(id, 'cancelled', reason);
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? updated : b)),
        requests: state.requests.map((r) => (r.id === id ? updated : r)),
        isLoading: false,
      }));
      return { success: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to cancel booking';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  completeBooking: async (id) => {
    set({ isLoading: true, error: null });

    try {
      const updated = await bookingsApi.complete(id);
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === id ? updated : b)),
        requests: state.requests.map((r) => (r.id === id ? updated : r)),
        isLoading: false,
      }));
      return { success: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to complete booking';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  createReview: async (bookingId, rating, comment) => {
    set({ isLoading: true, error: null });

    try {
      await bookingsApi.createReview(bookingId, rating, comment);
      set({ isLoading: false });
      return { success: true };
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to create review';
      set({ error: message, isLoading: false });
      return { success: false, error: message };
    }
  },

  fetchMyBookings: async (filter = 'all', page = 1) => {
    set({ isLoading: true, error: null, currentFilter: filter });

    try {
      const response = await bookingsApi.getMyBookings(filter, page);
      set({
        bookings: page === 1 ? response.bookings : [...get().bookings, ...response.bookings],
        total: response.total,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch bookings';
      set({ error: message, isLoading: false });
    }
  },

  fetchRequests: async (status = 'pending') => {
    set({ isLoading: true, error: null });

    try {
      const response = await bookingsApi.getRequests(status);
      set({
        requests: response.bookings,
        isLoading: false,
      });
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Failed to fetch requests';
      set({ error: message, isLoading: false });
    }
  },

  getBookingById: async (id) => {
    try {
      const booking = await bookingsApi.getById(id);
      return booking;
    } catch {
      return null;
    }
  },

  clearError: () => set({ error: null }),

  setFilter: (filter) => {
    set({ currentFilter: filter });
    get().fetchMyBookings(filter);
  },
}));
