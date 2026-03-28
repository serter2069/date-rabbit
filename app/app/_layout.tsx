import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { useFonts } from 'expo-font';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { useEffect } from 'react';
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
    // Sync initial state
    if (!navigator.onLine) setOffline();
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOffline, setOnline]);
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
const PUBLIC_ROUTES = ['terms', 'privacy', 'onboarding', '(auth)', '(dev)'];

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
const VERIFICATION_REQUIRED_ROUTES = [
  'payment',
  'stripe',
];

function NavigationGuard() {
  const { isAuthenticated, hasSeenOnboarding, _hasHydrated, user } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Wait for AsyncStorage hydration before making any routing decisions.
    // Without this guard, NavigationGuard fires with the unhydrated initial state
    // (hasSeenOnboarding=false) and immediately redirects returning users to onboarding.
    if (!_hasHydrated) return;

    const currentSegment = segments[0];
    const needsVerification = isAuthenticated && user?.verificationStatus !== 'approved';
    const isSeeker = user?.role === 'seeker';

    // Allow public routes without any redirects
    if (PUBLIC_ROUTES.includes(currentSegment)) {
      // Only redirect from onboarding/auth if already authenticated
      if (currentSegment === '(auth)' && isAuthenticated) {
        // Authenticated user on auth page — redirect to main app
        const isCompanion = user?.role === 'companion';
        router.replace(isCompanion ? '/(tabs)/female' : '/(tabs)/male');
      }
      // terms, privacy — always accessible, never redirect
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
          router.replace('/(comp-onboard)/step1');
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
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(dev)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="(seeker-verify)" />
        <Stack.Screen name="(comp-onboard)" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="privacy" />
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
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
