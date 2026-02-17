import { act, renderHook } from '@testing-library/react-native';
import { useAuthStore } from '../../store/authStore';
import * as api from '../../services/api';

// Mock API module
jest.mock('../../services/api', () => ({
  authApi: {
    requestOtp: jest.fn(),
    verifyOtp: jest.fn(),
    register: jest.fn(),
  },
  usersApi: {
    getMe: jest.fn(),
    updateProfile: jest.fn(),
  },
  setToken: jest.fn(),
  getToken: jest.fn(),
  ApiError: class ApiError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
      pendingEmail: null,
    });
    jest.clearAllMocks();
  });

  describe('requestOtp', () => {
    it('should request OTP successfully', async () => {
      const mockRequestOtp = api.authApi.requestOtp as jest.Mock;
      mockRequestOtp.mockResolvedValue({ message: 'OTP sent' });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.requestOtp('test@example.com');
        expect(response.success).toBe(true);
      });

      expect(mockRequestOtp).toHaveBeenCalledWith('test@example.com');
      expect(result.current.pendingEmail).toBe('test@example.com');
    });

    it('should handle OTP request failure', async () => {
      const mockRequestOtp = api.authApi.requestOtp as jest.Mock;
      mockRequestOtp.mockRejectedValue(new api.ApiError('Invalid email', 400));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        const response = await result.current.requestOtp('invalid');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Invalid email');
      });
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP and login existing user', async () => {
      const mockVerifyOtp = api.authApi.verifyOtp as jest.Mock;
      const mockGetMe = api.usersApi.getMe as jest.Mock;

      mockVerifyOtp.mockResolvedValue({
        token: 'test-token',
        isNewUser: false,
      });

      mockGetMe.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'seeker',
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        result.current.pendingEmail = 'test@example.com';
        const response = await result.current.verifyOtp('123456');
        expect(response.success).toBe(true);
        expect(response.isNewUser).toBe(false);
      });

      expect(api.setToken).toHaveBeenCalledWith('test-token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('test@example.com');
    });

    it('should handle new user registration flow', async () => {
      const mockVerifyOtp = api.authApi.verifyOtp as jest.Mock;

      mockVerifyOtp.mockResolvedValue({
        token: 'temp-token',
        isNewUser: true,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        result.current.pendingEmail = 'new@example.com';
        const response = await result.current.verifyOtp('123456');
        expect(response.success).toBe(true);
        expect(response.isNewUser).toBe(true);
      });

      // User should NOT be authenticated yet - needs to complete registration
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle invalid OTP code', async () => {
      const mockVerifyOtp = api.authApi.verifyOtp as jest.Mock;
      mockVerifyOtp.mockRejectedValue(new api.ApiError('Invalid OTP code', 400));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        result.current.pendingEmail = 'test@example.com';
        const response = await result.current.verifyOtp('000000');
        expect(response.success).toBe(false);
        expect(response.error).toBe('Invalid OTP code');
      });
    });
  });

  describe('register', () => {
    it('should register new user successfully', async () => {
      const mockRegister = api.authApi.register as jest.Mock;
      mockRegister.mockResolvedValue({
        token: 'new-user-token',
        user: {
          id: 'user-new',
          email: 'new@example.com',
          name: 'New User',
          role: 'seeker',
        },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        result.current.pendingEmail = 'new@example.com';
        const response = await result.current.register({
          name: 'New User',
          role: 'seeker',
          age: 25,
        });
        expect(response.success).toBe(true);
      });

      expect(api.setToken).toHaveBeenCalledWith('new-user-token');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.name).toBe('New User');
    });

    it('should register companion with hourly rate', async () => {
      const mockRegister = api.authApi.register as jest.Mock;
      mockRegister.mockResolvedValue({
        token: 'companion-token',
        user: {
          id: 'companion-1',
          email: 'companion@example.com',
          name: 'Sarah',
          role: 'companion',
          hourlyRate: 100,
        },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        result.current.pendingEmail = 'companion@example.com';
        const response = await result.current.register({
          name: 'Sarah',
          role: 'companion',
          age: 25,
          hourlyRate: 100,
        });
        expect(response.success).toBe(true);
      });

      expect(result.current.user?.role).toBe('companion');
      expect(result.current.user?.hourlyRate).toBe(100);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const mockUpdateProfile = api.usersApi.updateProfile as jest.Mock;
      mockUpdateProfile.mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        name: 'Updated Name',
        bio: 'New bio',
        role: 'seeker',
      });

      const { result } = renderHook(() => useAuthStore());

      // Set initial user
      await act(async () => {
        useAuthStore.setState({
          user: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Old Name',
            role: 'seeker',
          },
          isAuthenticated: true,
        });
      });

      await act(async () => {
        const response = await result.current.updateProfile({
          name: 'Updated Name',
          bio: 'New bio',
        });
        expect(response.success).toBe(true);
      });

      expect(result.current.user?.name).toBe('Updated Name');
      expect(result.current.user?.bio).toBe('New bio');
    });
  });

  describe('logout', () => {
    it('should clear user state and token', async () => {
      const { result } = renderHook(() => useAuthStore());

      // Set authenticated state
      await act(async () => {
        useAuthStore.setState({
          user: {
            id: 'user-1',
            email: 'test@example.com',
            name: 'Test',
            role: 'seeker',
          },
          isAuthenticated: true,
        });
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(api.setToken).toHaveBeenCalledWith(null);
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });
});
