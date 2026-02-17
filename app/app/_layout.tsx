import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { useAuthStore } from '../src/store/authStore';

export default function RootLayout() {
  const { isAuthenticated, hasSeenOnboarding } = useAuthStore();

  return (
    <>
      <StatusBar style="dark" />
      <Stack 
        screenOptions={{ 
          headerShown: false,
          contentStyle: {
            backgroundColor: '#FFFFFF',
            maxWidth: Platform.OS === 'web' ? 430 : undefined,
            marginLeft: Platform.OS === 'web' ? 'auto' : undefined,
            marginRight: Platform.OS === 'web' ? 'auto' : undefined,
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
        <Stack.Screen name="favorites" />
        <Stack.Screen name="settings/edit-profile" />
        <Stack.Screen name="settings/notifications" />
        <Stack.Screen name="settings/verification" />
        <Stack.Screen name="settings/delete-account" />
      </Stack>
    </>
  );
}
