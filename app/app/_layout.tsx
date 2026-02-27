import { Stack } from 'expo-router';
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
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  const { isAuthenticated, hasSeenOnboarding, user } = useAuthStore();
  const needsVerification = isAuthenticated && user?.verificationStatus !== 'approved';
  const isSeeker = user?.role === 'seeker';

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
    <>
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
        {!hasSeenOnboarding ? (
          <Stack.Screen name="onboarding" />
        ) : !isAuthenticated ? (
          <Stack.Screen name="(auth)" />
        ) : needsVerification ? (
          isSeeker ? (
            <Stack.Screen name="(seeker-verify)" />
          ) : (
            <Stack.Screen name="(comp-onboard)" />
          )
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
        <Stack.Screen name="index" />
        <Stack.Screen name="(seeker-verify)" />
        <Stack.Screen name="(comp-onboard)" />
        <Stack.Screen name="booking/[id]" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="profile/[id]" />
        <Stack.Screen name="reviews/[id]" />
        <Stack.Screen name="favorites/index" />
        <Stack.Screen name="settings/edit-profile" />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="settings/verification" />
        <Stack.Screen name="settings/delete-account" />
        <Stack.Screen name="terms" />
        <Stack.Screen name="privacy" />
      </Stack>
    </>
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
