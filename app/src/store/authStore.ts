import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserRole, VerificationStatus } from '../types';
import { authApi, usersApi, setToken, getToken, ApiError, User as ApiUser } from '../services/api';

type AuthStep = 'idle' | 'email' | 'otp' | 'onboarding' | 'authenticated';

interface OnboardingData {
  name: string;
  age: number;
  role: UserRole;
  bio: string;
  photos: string[];
  location: string;
  // Companion-specific
  hourlyRate?: number;
}

interface ProfileUpdateData {
  name?: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  notificationsEnabled?: boolean;
  expoPushToken?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  hasSeenOnboarding: boolean; // Intro slides (not profile setup)
  authStep: AuthStep;
  pendingEmail: string | null;
  error: string | null;

  // OTP Auth Actions
  startAuth: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyCode: (code: string) => Promise<{ success: boolean; error?: string }>;
  resendCode: () => Promise<{ success: boolean; error?: string }>;

  // Onboarding Actions
  completeOnboarding: (data: OnboardingData) => Promise<{ success: boolean; error?: string }>;
  skipOnboarding: () => void;

  // Profile Actions
  updateProfile: (data: ProfileUpdateData) => Promise<{ success: boolean; error?: string }>;

  // General Actions
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  clearError: () => void;
  setOnboardingSeen: () => void;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

// Convert API user to local User type
function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role,
    age: apiUser.age,
    location: apiUser.location,
    bio: apiUser.bio,
    photos: apiUser.photos,
    hourlyRate: apiUser.hourlyRate,
    rating: apiUser.rating,
    reviewCount: apiUser.reviewCount,
    isVerified: apiUser.isVerified,
    verificationStatus: apiUser.verificationStatus as VerificationStatus | undefined,
    stripeOnboardingComplete: apiUser.stripeOnboardingComplete,
    latitude: apiUser.latitude,
    longitude: apiUser.longitude,
    notificationsEnabled: (apiUser as any).notificationsEnabled,
    expoPushToken: apiUser.expoPushToken,
    createdAt: apiUser.createdAt,
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasCompletedOnboarding: false,
      hasSeenOnboarding: false,
      authStep: 'idle',
      pendingEmail: null,
      error: null,

      // Initialize - check if we have a saved token and fetch user
      initialize: async () => {
        const token = await getToken();
        if (token) {
          try {
            const apiUser = await usersApi.getMe();
            set({
              user: mapApiUserToUser(apiUser),
              isAuthenticated: true,
              hasCompletedOnboarding: true,
              authStep: 'authenticated',
            });
          } catch {
            // Token invalid, clear it
            await setToken(null);
            set({
              user: null,
              isAuthenticated: false,
              authStep: 'idle',
            });
          }
        }
      },

      // Step 1: User enters email, we send OTP
      startAuth: async (email) => {
        set({ isLoading: true, error: null });

        try {
          await authApi.requestOtp(email);
          set({
            pendingEmail: email,
            authStep: 'otp',
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Failed to send code';
          set({
            error: message,
            isLoading: false,
          });
          return { success: false, error: message };
        }
      },

      // Step 2: User enters 8-digit code
      verifyCode: async (code) => {
        const { pendingEmail } = get();
        if (!pendingEmail) {
          return { success: false, error: 'No email address provided' };
        }

        set({ isLoading: true, error: null });

        try {
          const result = await authApi.verifyOtp(pendingEmail, code);

          // Save the token
          await setToken(result.token);

          if (result.isNewUser) {
            // New user - needs onboarding
            set({
              authStep: 'onboarding',
              isLoading: false,
            });
          } else {
            // Existing user - fetch their profile
            try {
              const apiUser = await usersApi.getMe();
              set({
                user: mapApiUserToUser(apiUser),
                authStep: 'authenticated',
                isAuthenticated: true,
                hasCompletedOnboarding: true,
                isLoading: false,
                pendingEmail: null,
              });
            } catch {
              // Could not fetch profile, but we have token
              set({
                authStep: 'authenticated',
                isAuthenticated: true,
                hasCompletedOnboarding: true,
                isLoading: false,
              });
            }
          }
          return { success: true };
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Invalid code';
          set({
            error: message,
            isLoading: false,
          });
          return { success: false, error: message };
        }
      },

      // Resend OTP code
      resendCode: async () => {
        const { pendingEmail } = get();
        if (!pendingEmail) {
          return { success: false, error: 'No email address' };
        }
        return get().startAuth(pendingEmail);
      },

      // Step 3: User completes profile after OTP verification
      completeOnboarding: async (data) => {
        const { pendingEmail } = get();

        set({ isLoading: true, error: null });

        try {
          const result = await authApi.register({
            email: pendingEmail || '',
            name: data.name,
            role: data.role,
            age: data.age,
            bio: data.bio,
            location: data.location,
            hourlyRate: data.role === 'companion' ? data.hourlyRate : undefined,
          });

          // Save the new token
          await setToken(result.token);

          set({
            user: mapApiUserToUser(result.user),
            isAuthenticated: true,
            hasCompletedOnboarding: true,
            authStep: 'authenticated',
            pendingEmail: null,
            isLoading: false,
          });

          return { success: true };
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Registration failed';
          set({
            error: message,
            isLoading: false,
          });
          return { success: false, error: message };
        }
      },

      skipOnboarding: () => {
        // Allow user to skip (will need to complete later)
        set({
          hasCompletedOnboarding: false,
          authStep: 'authenticated',
          isAuthenticated: true,
        });
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });

        try {
          const apiUser = await usersApi.updateProfile(data);
          set({
            user: mapApiUserToUser(apiUser),
            isLoading: false,
          });
          return { success: true };
        } catch (err) {
          const message = err instanceof ApiError ? err.message : 'Update failed';
          set({
            error: message,
            isLoading: false,
          });
          return { success: false, error: message };
        }
      },

      refreshUser: async () => {
        try {
          const apiUser = await usersApi.getMe();
          set({ user: mapApiUserToUser(apiUser) });
        } catch {
          // Silently fail
        }
      },

      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
        authStep: user ? 'authenticated' : 'idle',
      }),

      logout: async () => {
        await setToken(null);
        set({
          user: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          authStep: 'idle',
          pendingEmail: null,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      setOnboardingSeen: () => set({ hasSeenOnboarding: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
        // Persist user state for demo mode (when API is unavailable)
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
    }
  )
);
