import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator, StyleSheet, AppState } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { usersApi } from '../src/services/api';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useEffect, useRef, useCallback } from 'react';
import { colors } from '../src/constants/theme';
import { StripeProvider } from '../src/components/StripeProvider';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { useNetworkStore } from '../src/store/networkStore';

// Listen to browser online/offline events (web only)
function useWebNetworkStatus() {
  const { setOffline, setOnline } = useNetworkStore();
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handleOnline = () => setOnline();
    const handleOffline = () => setOffline();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    // Sync initial state — delayed 1s to avoid false offline on cold start
    // (navigator.onLine can briefly read as false before the network stack is ready)
    setTimeout(() => {
      if (typeof navigator !== 'undefined' && !navigator.onLine) setOffline();
    }, 1000);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOffline, setOnline]);
}

// Send heartbeat to update lastSeen (debounced, max once per 60s)
const HEARTBEAT_INTERVAL_MS = 60_000;

function useHeartbeat() {
  const { isAuthenticated } = useAuthStore();
  const lastHeartbeatRef = useRef(0);

  const sendHeartbeat = useCallback(() => {
    if (!isAuthenticated) return;
    const now = Date.now();
    if (now - lastHeartbeatRef.current < HEARTBEAT_INTERVAL_MS) return;
    lastHeartbeatRef.current = now;
    usersApi.heartbeat().catch(() => {
      // Silently ignore heartbeat failures
    });
  }, [isAuthenticated]);

  useEffect(() => {
    // Send on mount
    sendHeartbeat();

    // Listen for app returning to foreground (native only)
    if (Platform.OS !== 'web') {
      const subscription = AppState.addEventListener('change', (state) => {
        if (state === 'active') {
          sendHeartbeat();
        }
      });
      return () => subscription.remove();
    }
  }, [sendHeartbeat]);
}

// Strip __EXPO_ROUTER_key from browser URL bar (Expo Router internal param)
function useCleanUrl() {
  const pathname = usePathname();
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const timer = setTimeout(() => {
      try {
        const url = new URL(window.location.href);
        if (url.searchParams.has('__EXPO_ROUTER_key')) {
          url.searchParams.delete('__EXPO_ROUTER_key');
          window.history.replaceState(null, '', url.pathname + url.search + url.hash);
        }
      } catch {
        // ignore
      }
    }, 50);
    return () => clearTimeout(timer);
  }, [pathname]);
}

// Public routes accessible without authentication
const PUBLIC_ROUTES = ['terms', 'privacy', 'safety', 'onboarding', '(auth)', '(dev)', 'landing', 'proto'];

// Authenticated non-tab routes — accessible to all authenticated users (verified or not)
const NON_TAB_AUTH_ROUTES = [
  'chat',
  'profile',
  'reviews',
  'favorites',
  'settings',
  'date',
  'booking',
];

// Routes that REQUIRE verification — unverified users get redirected to verification prompt
// NOTE: browse/(tabs) is intentionally NOT in this list.
// Checkr background check deferred to v2. Browse = JWT auth only. Seeker verified = Stripe Identity passed.
const VERIFICATION_REQUIRED_ROUTES = [
  'payment',
  'stripe',
];

function NavigationGuard() {
  const { isAuthenticated, hasSeenOnboarding, _hasHydrated, user } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();
  const isRedirectingRef = useRef(false);

  useEffect(() => {
    // Wait for AsyncStorage hydration before making any routing decisions.
    // Without this guard, NavigationGuard fires with the unhydrated initial state
    // (hasSeenOnboarding=false) and immediately redirects returning users to onboarding.
    if (!_hasHydrated) return;

    // Don't redirect 404 pages
    if (segments[0] === '+not-found') return;

    const currentSegment = segments[0];
    const needsVerification = isAuthenticated && user?.verificationStatus !== 'approved';
    const isSeeker = user?.role === 'seeker';

    // Admin routes — let the (admin) layout handle its own auth guard
    if (currentSegment === '(admin)') return;

    // Allow public routes without any redirects
    if (PUBLIC_ROUTES.includes(currentSegment)) {
      // Only redirect from onboarding/auth if already authenticated
      if (currentSegment === '(auth)' && isAuthenticated) {
        if (isRedirectingRef.current) return; // already redirecting, skip
        isRedirectingRef.current = true;
        // Authenticated user on auth page — redirect to main app
        const isCompanion = user?.role === 'companion';
        router.replace(isCompanion ? '/(tabs)/female' : '/(tabs)/male');
      }
      // terms, privacy, landing — always accessible, never redirect
      return;
    }

    // Not in auth segment — reset redirect flag
    isRedirectingRef.current = false;

    // Web-only: unauthenticated users see landing page before onboarding
    if (Platform.OS === 'web' && !isAuthenticated) {
      if (currentSegment !== 'landing') {
        router.replace('/landing');
      }
      return;
    }

    if (!hasSeenOnboarding) {
      // Show onboarding intro slides
      if (currentSegment !== 'onboarding') {
        router.replace('/onboarding');
      }
      return;
    }

    if (!isAuthenticated) {
      // Not logged in — redirect to auth with message
      const inAuthGroup = currentSegment === '(auth)';
      if (!inAuthGroup) {
        router.replace({ pathname: '/(auth)/welcome', params: { redirect: '1' } });
      }
      return;
    }

    if (needsVerification) {
      // Unverified users CAN still be in verification flow
      const inSeekerVerify = currentSegment === '(seeker-verify)';
      const inCompOnboard = currentSegment === '(comp-onboard)';

      // If user is already in a verification flow, let them stay
      if (inSeekerVerify || inCompOnboard) {
        return;
      }

      // Block verification-required routes — redirect to verification prompt
      if (VERIFICATION_REQUIRED_ROUTES.includes(currentSegment)) {
        if (isSeeker) {
          router.replace('/(seeker-verify)/intro');
        } else {
          router.replace('/(comp-onboard)/step2');
        }
        return;
      }

      // Allow unverified users to browse tabs and non-tab auth routes
      const inTabsGroup = currentSegment === '(tabs)';
      const inNonTabAuthRoute = NON_TAB_AUTH_ROUTES.includes(currentSegment);
      if (!inTabsGroup && !inNonTabAuthRoute) {
        const isCompanion = user?.role === 'companion';
        router.replace(isCompanion ? '/(tabs)/female' : '/(tabs)/male');
      }
      return;
    }

    // Fully authenticated and verified
    const inTabsGroup = currentSegment === '(tabs)';
    const inNonTabAuthRoute = NON_TAB_AUTH_ROUTES.includes(currentSegment);
    const inVerificationRequiredRoute = VERIFICATION_REQUIRED_ROUTES.includes(currentSegment);
    if (!inTabsGroup && !inNonTabAuthRoute && !inVerificationRequiredRoute) {
      const isCompanion = user?.role === 'companion';
      router.replace(isCompanion ? '/(tabs)/female' : '/(tabs)/male');
    }
  }, [isAuthenticated, hasSeenOnboarding, _hasHydrated, user, segments, router]);

  return null;
}

export default function RootLayout() {
  // Clean __EXPO_ROUTER_key from browser URL
  useCleanUrl();
  // Track web browser online/offline events
  useWebNetworkStatus();
  // Send heartbeat to update online status
  useHeartbeat();

  // Load Neo-Brutalism font
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  // Show loading screen while fonts load
  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <StripeProvider>
      <View style={styles.container}>
      <StatusBar style="dark" />
      {Platform.OS === 'web' && (
        <Head>
          <title>DateRabbit — Find Your Perfect Date</title>
          <meta name="description" content="DateRabbit connects seekers with companions for memorable date experiences. Find, book, and enjoy amazing dates." />
          <meta property="og:title" content="DateRabbit — Find Your Perfect Date" />
          <meta property="og:description" content="Connect with companions for memorable date experiences." />
          <meta property="og:image" content="https://daterabbit.smartlaunchhub.com/og-image.png" />
          <meta property="og:url" content="https://daterabbit.smartlaunchhub.com" />
          <meta property="og:type" content="website" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="DateRabbit" />
          <meta name="twitter:description" content="Connect with companions for memorable date experiences." />
          <meta name="twitter:image" content="https://daterabbit.smartlaunchhub.com/og-image.png" />
        </Head>
      )}
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: {
            backgroundColor: colors.background,
            flex: 1,
            ...(Platform.OS === 'web' ? {
              width: '100%',
              maxWidth: 430,
              minWidth: 320,
              marginLeft: 'auto',
              marginRight: 'auto',
            } as any : {}),
          }
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'fade' }} />
        <Stack.Screen name="landing/index" options={{ headerShown: false, animation: 'fade' }} />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)/forgot-password" />
        <Stack.Screen name="(dev)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(seeker-verify)" />
        <Stack.Screen name="(comp-onboard)" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="privacy" />
        <Stack.Screen name="safety" />
        <Stack.Screen name="booking/[id]" options={{ animation: 'slide_from_bottom', gestureEnabled: false }} />
        <Stack.Screen name="chat/[id]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="profile/[id]" />
        <Stack.Screen name="reviews/[id]" />
        <Stack.Screen name="payment/[bookingId]" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="stripe/return" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="stripe/refresh" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="favorites/index" />
        <Stack.Screen name="settings/index" />
        <Stack.Screen name="settings/edit-profile" />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="settings/verification" />
        <Stack.Screen name="settings/delete-account" />
        <Stack.Screen name="settings/payment-methods" />
        <Stack.Screen name="date" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <NavigationGuard />
      <OfflineBanner />
      </View>
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    ...(Platform.OS === 'web' ? {
      maxWidth: 430,
      width: '100%',
      alignSelf: 'center' as const,
    } : {}),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
