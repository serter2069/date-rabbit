import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { useFonts } from 'expo-font';
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import {
  Fraunces_400Regular,
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium_Italic,
} from '@expo-google-fonts/fraunces';
import { colors } from '../src/constants/theme';

export default function RootLayout() {
  const { isAuthenticated, hasSeenOnboarding } = useAuthStore();

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Fraunces_400Regular,
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_400Regular_Italic,
    Fraunces_500Medium_Italic,
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
        ) : (
          <Stack.Screen name="(tabs)" />
        )}
        <Stack.Screen name="index" />
        <Stack.Screen name="booking/[id]" />
        <Stack.Screen name="chat/[id]" />
        <Stack.Screen name="profile/[id]" />
        <Stack.Screen name="reviews/[id]" />
        <Stack.Screen name="favorites/index" />
        <Stack.Screen name="settings/edit-profile" />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="settings/verification" />
        <Stack.Screen name="settings/delete-account" />
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
