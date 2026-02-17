import { act, renderHook } from '@testing-library/react-native';
import { useBookingsStore } from '../../store/bookingsStore';
import * as api from '../../services/api';

jest.mock('../../services/api', () => ({
  bookingsApi: {
    create: jest.fn(),
    getMyBookings: jest.fn(),
    getRequests: jest.fn(),
    getById: jest.fn(),
    updateStatus: jest.fn(),
    complete: jest.fn(),
    createReview: jest.fn(),
  },
  ApiError: class ApiError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

const mockBooking: api.Booking = {
  id: 'booking-1',
  status: 'pending',
  activity: 'Dinner',
  date: '2024-03-15T19:00:00Z',
  duration: 2,
  location: 'Downtown Restaurant',
  hourlyRate: 100,
  subtotal: 200,
  platformFee: 30,
  total: 230,
  companionEarnings: 170,
  isPaid: false,
  seeker: { id: 'seeker-1', name: 'John', photo: undefined },
  companion: { id: 'companion-1', name: 'Sarah', photo: undefined, rating: 4.8 },
  createdAt: '2024-03-10T10:00:00Z',
};

describe('bookingsStore', () => {
  beforeEach(() => {
    useBookingsStore.setState({
      bookings: [],
      requests: [],
      total: 0,
      isLoading: false,
      error: null,
      currentFilter: 'all',
    });
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    it('should create booking successfully', async () => {
      const mockCreate = api.bookingsApi.create as jest.Mock;
      mockCreate.mockResolvedValue(mockBooking);

      const { result } = renderHook(() => useBookingsStore());

      await act(async () => {
        const response = await result.current.createBooking({
          companionId: 'companion-1',
          activity: 'Dinner',
          date: '2024-03-15T19:00:00Z',
          duration: 2,
          location: 'Downtown Restaurant',
        });
        expect(response.success).toBe(true);
        expect(response.booking).toEqual(mockBooking);
      });

      expect(result.current.bookings).toHaveLength(1);
      expect(result.current.bookings[0].id).toBe('booking-1');
    });

    it('should handle booking creation error', async () => {
      const mockCreate = api.bookingsApi.create as jest.Mock;
      mockCreate.mockRejectedValue(new api.ApiError('Companion not available', 400));

      const { result } = renderHook(() => useBookingsStore());

      await act(async () => {
        const response = await result.current.createBooking({
          companionId: 'companion-1',
          activity: 'Dinner',
          date: '2024-03-15T19:00:00Z',
          duration: 2,
        });
        expect(response.success).toBe(false);
        expect(response.error).toBe('Companion not available');
      });

      expect(result.current.error).toBe('Companion not available');
    });

    it('should validate booking has required fields', async () => {
      const mockCreate = api.bookingsApi.create as jest.Mock;
      mockCreate.mockResolvedValue(mockBooking);

      const { result } = renderHook(() => useBookingsStore());

      await act(async () => {
        await result.current.createBooking({
          companionId: 'companion-1',
          activity: 'Dinner',
          date: '2024-03-15T19:00:00Z',
          duration: 2,
        });
      });

      expect(mockCreate).toHaveBeenCalledWith({
        companionId: 'companion-1',
        activity: 'Dinner',
        date: '2024-03-15T19:00:00Z',
        duration: 2,
      });
    });
  });

  describe('fetchMyBookings', () => {
    it('should fetch bookings with filter', async () => {
      const mockGetBookings = api.bookingsApi.getMyBookings as jest.Mock;
      mockGetBookings.mockResolvedValue({
        bookings: [mockBooking],
        total: 1,
      });

      const { result } = renderHook(() => useBookingsStore());

      await act(async () => {
        await result.current.fetchMyBookings('pending', 1);
      });

      expect(mockGetBookings).toHaveBeenCalledWith('pending', 1);
      expect(result.current.bookings).toHaveLength(1);
      expect(result.current.total).toBe(1);
      expect(result.current.currentFilter).toBe('pending');
    });

    it('should append bookings on pagination', async () => {
      const mockGetBookings = api.bookingsApi.getMyBookings as jest.Mock;

      // First page
      mockGetBookings.mockResolvedValueOnce({
        bookings: [mockBooking],
        total: 2,
      });

      const { result } = renderHook(() => useBookingsStore());

      await act(async () => {
        await result.current.fetchMyBookings('all', 1);
      });

      // Second page
      const secondBooking = { ...mockBooking, id: 'booking-2' };
      mockGetBookings.mockResolvedValueOnce({
        bookings: [secondBooking],
        total: 2,
      });

      await act(async () => {
        await result.current.fetchMyBookings('all', 2);
      });

      expect(result.current.bookings).toHaveLength(2);
    });
  });

  describe('acceptRequest (companion flow)', () => {
    it('should accept booking request', async () => {
      const acceptedBooking = { ...mockBooking, status: 'accepted' as const };
      const mockUpdateStatus = api.bookingsApi.updateStatus as jest.Mock;
      mockUpdateStatus.mockResolvedValue(acceptedBooking);

      const { result } = renderHook(() => useBookingsStore());

      // Set initial request
      await act(async () => {
        useBookingsStore.setState({ requests: [mockBooking] });
      });

      await act(async () => {
        const response = await result.current.acceptRequest('booking-1');
        expect(response.success).toBe(true);
      });

      expect(mockUpdateStatus).toHaveBeenCalledWith('booking-1', 'accepted');
      expect(result.current.requests[0].status).toBe('accepted');
    });
  });

  describe('declineRequest (companion flow)', () => {
    it('should decline booking request with reason', async () => {
      const declinedBooking = { ...mockBooking, status: 'declined' as const };
      const mockUpdateStatus = api.bookingsApi.updateStatus as jest.Mock;
      mockUpdateStatus.mockResolvedValue(declinedBooking);

      const { result } = renderHook(() => useBookingsStore());

      await act(async () => {
        useBookingsStore.setState({ requests: [mockBooking] });
      });

      await act(async () => {
        const response = await result.current.declineRequest('booking-1', 'Not available');
        expect(response.success).toBe(true);
      });

      expect(mockUpdateStatus).toHaveBeenCalledWith('booking-1', 'declined', 'Not available');
    });
  });

  describe('cancelBooking', () => {
    it('should cancel booking', async () => {
      const cancelledBooking = { ...mockBooking, status: 'cancelled' as const };
      const mockUpdateStatus = api.bookingsApi.updateStatus as jest.Mock;
      mockUpdateStatus.mockResolvedValue(cancelledBooking);

      const { result } = renderHook(() => useBookingsStore());

      await act(async () => {
        useBookingsStore.setState({ bookings: [mockBooking] });
      });

      await act(async () => {
        const response = await result.current.cancelBooking('booking-1', 'Changed plans');
        expect(response.success).toBe(true);
      });

      expect(result.current.bookings[0].status).toBe('cancelled');
    });
  });

  describe('completeBooking', () => {
    it('should complete booking after date', async () => {
      const completedBooking = { ...mockBooking, status: 'completed' as const };
      const mockComplete = api.bookingsApi.complete as jest.Mock;
      mockComplete.mockResolvedValue(completedBooking);

      const { result } = renderHook(() => useBookingsStore());

      await act(async () => {
        useBookingsStore.setState({ bookings: [mockBooking] });
      });

      await act(async () => {
        const response = await result.current.completeBooking('booking-1');
        expect(response.success).toBe(true);
      });

      expect(result.current.bookings[0].status).toBe('completed');
    });
  });

  describe('createReview', () => {
    it('should create review for completed booking', async () => {
      const mockCreateReview = api.bookingsApi.createReview as jest.Mock;
      mockCreateReview.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useBookingsStore());

      await act(async () => {
        const response = await result.current.createReview('booking-1', 5, 'Great experience!');
        expect(response.success).toBe(true);
      });

      expect(mockCreateReview).toHaveBeenCalledWith('booking-1', 5, 'Great experience!');
    });

    it('should validate rating is between 1-5', async () => {
      const mockCreateReview = api.bookingsApi.createReview as jest.Mock;
      mockCreateReview.mockRejectedValue(new api.ApiError('Rating must be 1-5', 400));

      const { result } = renderHook(() => useBookingsStore());

      await act(async () => {
        const response = await result.current.createReview('booking-1', 10, 'Great!');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Rating must be 1-5');
      });
    });
  });
});
