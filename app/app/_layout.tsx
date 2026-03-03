import { Stack, useRouter, useSegments } from 'expo-router';
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

function NavigationGuard() {
  const { isAuthenticated, hasSeenOnboarding, user } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const currentSegment = segments[0];
    const needsVerification = isAuthenticated && user?.verificationStatus !== 'approved';
    const isSeeker = user?.role === 'seeker';

    if (!hasSeenOnboarding) {
      // Show onboarding intro slides
      if (currentSegment !== 'onboarding') {
        router.replace('/onboarding');
      }
      return;
    }

    if (!isAuthenticated) {
      // Not logged in — redirect to auth
      const inAuthGroup = currentSegment === '(auth)';
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome');
      }
      return;
    }

    if (needsVerification) {
      // Authenticated but not yet verified — send to verification flow
      if (isSeeker) {
        const inSeekerVerify = currentSegment === '(seeker-verify)';
        if (!inSeekerVerify) {
          router.replace('/(seeker-verify)/intro');
        }
      } else {
        const inCompOnboard = currentSegment === '(comp-onboard)';
        if (!inCompOnboard) {
          router.replace('/(comp-onboard)/step1');
        }
      }
      return;
    }

    // Fully authenticated and verified
    const inTabsGroup = currentSegment === '(tabs)';
    if (!inTabsGroup) {
      const isCompanion = user?.role === 'companion';
      router.replace(isCompanion ? '/(tabs)/female' : '/(tabs)/male');
    }
  }, [isAuthenticated, hasSeenOnboarding, user, segments, router]);

  return null;
}

export default function RootLayout() {
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
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background,
            ...(Platform.OS === 'web' ? {
              width: '100%',
              maxWidth: 430,
              minWidth: 320,
              marginLeft: 'auto',
              marginRight: 'auto',
            } : {}),
          }
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(seeker-verify)" />
        <Stack.Screen name="(comp-onboard)" />
        <Stack.Screen name="booking/[id]" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="profile/[id]" />
        <Stack.Screen name="reviews/[id]" />
        <Stack.Screen name="payment/[bookingId]" />
        <Stack.Screen name="stripe/return" />
        <Stack.Screen name="stripe/refresh" />
        <Stack.Screen name="favorites/index" />
        <Stack.Screen name="settings/edit-profile" />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="settings/verification" />
        <Stack.Screen name="settings/delete-account" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="privacy" />
      </Stack>
      <NavigationGuard />
    </StripeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
