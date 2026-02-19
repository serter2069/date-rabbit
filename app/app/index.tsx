import { useEffect } from 'react';
import { router } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../src/store/authStore';
import { colors } from '../src/constants/theme';

export default function Index() {
  const { isAuthenticated, hasSeenOnboarding, user } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!isAuthenticated) {
        // Not logged in - go to welcome with redirect message
        router.replace('/(auth)/welcome?redirect=1');
      } else if (!hasSeenOnboarding) {
        // Logged in but hasn't seen onboarding - show it after registration
        router.replace('/onboarding');
      } else {
        // Fully authenticated - go to main app based on role
        // In Expo Router, /male is equivalent to /male/index when index.tsx exists
        const isCompanion = user?.role === 'companion';
        router.replace(isCompanion ? '/female' : '/male');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [isAuthenticated, hasSeenOnboarding, user]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
