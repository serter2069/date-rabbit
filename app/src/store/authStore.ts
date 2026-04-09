import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, UserRole, VerificationStatus } from '../types';
import {
  authApi,
  usersApi,
  setToken,
  getToken,
  setRefreshToken,
  getRefreshToken,
  attemptTokenRefresh,
  ApiError,
  User as ApiUser,
} from '../services/api';
import { useFavoritesStore } from './favoritesStore';

// Proactive refresh: renew access token 20 minutes after last successful auth/refresh
const PROACTIVE_REFRESH_INTERVAL_MS = 20 * 60 * 1000;

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
  // Optional email override (used when registering without OTP flow)
  email?: string;
}

interface ProfileUpdateData {
  name?: string;
  bio?: string;
  location?: string;
  hourlyRate?: number;
  notificationsEnabled?: boolean;
  expoPushToken?: string;
  notificationPreferences?: {
    bookings: boolean;
    messages: boolean;
    reminders: boolean;
    payments: boolean;
  };
  isPublicProfile?: boolean;
  emergencyContactName?: string;
  emergencyContactEmail?: string;
  photos?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  hasSeenOnboarding: boolean; // Intro slides (not profile setup)
  hasSeenTour: boolean; // Post-registration onboarding tour (modal cards)
  _hasHydrated: boolean; // True once zustand persist has loaded from AsyncStorage
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
  setTourSeen: () => void;
  setHasHydrated: (value: boolean) => void;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
  setPendingEmail: (email: string) => void;
}

// Convert API user to local User type
function mapApiUserToUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: apiUser.role,
    isAdmin: apiUser.isAdmin,
    age: apiUser.age,
    location: apiUser.location,
    bio: apiUser.bio,
    photos: apiUser.photos,
    profileVideoUrl: apiUser.profileVideoUrl,
    hourlyRate: apiUser.hourlyRate,
    rating: apiUser.rating,
    reviewCount: apiUser.reviewCount,
    isVerified: apiUser.isVerified,
    verificationStatus: apiUser.verificationStatus as VerificationStatus | undefined,
    stripeOnboardingComplete: apiUser.stripeOnboardingComplete,
    isPublicProfile: apiUser.isPublicProfile,
    latitude: apiUser.latitude,
    longitude: apiUser.longitude,
    notificationsEnabled: apiUser.notificationsEnabled,
    expoPushToken: apiUser.expoPushToken,
    notificationPreferences: apiUser.notificationPreferences,
    createdAt: apiUser.createdAt,
  };
}

// Module-level timer — survives re-renders, cleared on logout
let proactiveRefreshTimer: ReturnType<typeof setInterval> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      hasCompletedOnboarding: false,
      hasSeenOnboarding: false,
      hasSeenTour: false,
      _hasHydrated: false,
      authStep: 'idle',
      pendingEmail: null,
      error: null,

      // Initialize - check if we have a saved token and fetch user.
      // Level 3 refresh: attempt proactive token refresh on app start so the
      // access token is always fresh (avoids first-request 401 after 15m).
      initialize: async () => {
        const [accessToken, storedRefreshToken] = await Promise.all([
          getToken(),
          getRefreshToken(),
        ]);

        if (!accessToken && !storedRefreshToken) {
          // No session at all
          return;
        }

        // If we have a refresh token, eagerly rotate it on start so the
        // access token won't expire mid-session.
        if (storedRefreshToken) {
          try {
            await attemptTokenRefresh();
          } catch {
            // Refresh token expired/invalid — clear session
            await setToken(null);
            await setRefreshToken(null);
            set({ user: null, isAuthenticated: false, authStep: 'idle' });
            return;
          }
        }

        try {
          const apiUser = await usersApi.getMe();
          set({
            user: mapApiUserToUser(apiUser),
            isAuthenticated: true,
            hasCompletedOnboarding: true,
            authStep: 'authenticated',
          });
          // Sync favorites from server after successful auth
          useFavoritesStore.getState().syncFromServer();

          // Level 2 refresh: proactive 20-minute interval keeps access token alive
          // without waiting for a 401. Timer is module-scoped so it survives re-renders.
          if (!proactiveRefreshTimer) {
            proactiveRefreshTimer = setInterval(async () => {
              const rt = await getRefreshToken();
              if (!rt) return;
              try {
                await attemptTokenRefresh();
              } catch {
                // Proactive refresh failed — clear session, user will see 401 on next request
                clearInterval(proactiveRefreshTimer!);
                proactiveRefreshTimer = null;
                await setToken(null);
                await setRefreshToken(null);
                useAuthStore.getState().setUser(null);
              }
            }, PROACTIVE_REFRESH_INTERVAL_MS);
          }
        } catch {
          // Access token invalid and refresh already attempted — clear session
          await setToken(null);
          await setRefreshToken(null);
          set({
            user: null,
            isAuthenticated: false,
            authStep: 'idle',
          });
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

      // Step 2: User enters 6-digit code
      verifyCode: async (code) => {
        const { pendingEmail } = get();
        if (!pendingEmail) {
          return { success: false, error: 'No email address provided' };
        }

        set({ isLoading: true, error: null });

        try {
          const result = await authApi.verifyOtp(pendingEmail, code);

          // Save both tokens (accessToken + refreshToken)
          await setToken(result.accessToken || result.token);
          await setRefreshToken(result.refreshToken);

          // Fetch user profile to determine if onboarding is needed
          try {
            const apiUser = await usersApi.getMe();
            const needsOnboarding = !apiUser.age;

            if (needsOnboarding) {
              // New/incomplete user - needs onboarding
              set({
                user: mapApiUserToUser(apiUser),
                authStep: 'onboarding',
                isLoading: false,
              });
            } else {
              // Complete user - go to dashboard
              set({
                user: mapApiUserToUser(apiUser),
                authStep: 'authenticated',
                isAuthenticated: true,
                hasCompletedOnboarding: true,
                hasSeenOnboarding: true,
                isLoading: false,
                pendingEmail: null,
              });
              // Sync favorites from server after login
              useFavoritesStore.getState().syncFromServer();
            }
          } catch {
            // Could not fetch profile - clear token and reset auth state
            await setToken(null);
            set({
              isAuthenticated: false,
              user: null,
              authStep: 'idle',
              isLoading: false,
              error: 'Failed to load profile. Please try again.',
            });
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
        const email = data.email || pendingEmail || '';

        set({ isLoading: true, error: null });

        try {
          const result = await authApi.register({
            email,
            name: data.name,
            role: data.role,
            age: data.age,
            bio: data.bio,
            location: data.location,
            hourlyRate: data.role === 'companion' ? data.hourlyRate : undefined,
          });

          // Save both tokens
          await setToken(result.accessToken || result.token);
          await setRefreshToken(result.refreshToken);

          set({
            user: mapApiUserToUser(result.user),
            isAuthenticated: true,
            hasCompletedOnboarding: true,
            authStep: 'authenticated',
            pendingEmail: null,
            isLoading: false,
          });

          // Sync favorites from server after registration
          useFavoritesStore.getState().syncFromServer();

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
          const apiUser = await usersApi.updateProfile(data as Parameters<typeof usersApi.updateProfile>[0]);
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
        // Stop proactive refresh interval
        if (proactiveRefreshTimer) {
          clearInterval(proactiveRefreshTimer);
          proactiveRefreshTimer = null;
        }

        // Revoke refresh tokens server-side (best-effort, non-blocking)
        authApi.logout().catch(() => {});

        await setToken(null);
        await setRefreshToken(null);
        useFavoritesStore.getState().clearFavorites();
        set({
          user: null,
          isAuthenticated: false,
          hasCompletedOnboarding: false,
          hasSeenTour: false,
          authStep: 'idle',
          pendingEmail: null,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      setOnboardingSeen: () => set({ hasSeenOnboarding: true }),

      setTourSeen: () => set({ hasSeenTour: true }),

      setHasHydrated: (value) => set({ _hasHydrated: value }),

      setPendingEmail: (email) => set({ pendingEmail: email }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        hasSeenOnboarding: state.hasSeenOnboarding,
        hasSeenTour: state.hasSeenTour,
        hasCompletedOnboarding: state.hasCompletedOnboarding,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (!error) {
          useAuthStore.getState().setHasHydrated(true);
        }
      },
    }
  )
);
