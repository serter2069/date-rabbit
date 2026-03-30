import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter, Redirect } from 'expo-router';
import { useTheme, spacing, typography, borderRadius, borderWidth, shadows } from '../src/constants/theme';
import { useAuthStore } from '../src/store/authStore';

export default function NotFoundScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isAuthenticated, hasSeenOnboarding } = useAuthStore();

  // Only redirect if auth store is already hydrated — avoid showing wrong content.
  // If not yet hydrated, show the 404 UI; NavigationGuard in _layout.tsx will
  // redirect unauthenticated users once hydration completes.
  const hydrated = useAuthStore.persist.hasHydrated();

  if (hydrated && !isAuthenticated) {
    if (!hasSeenOnboarding) {
      return <Redirect href="/onboarding" />;
    }
    return <Redirect href="/(auth)/welcome?redirect=1" />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.emoji}>🐰</Text>
      <Text style={[styles.title, { color: colors.text }]}>Page Not Found</Text>
      <Text style={[styles.subtitle, { color: colors.textMuted }]}>
        Oops! This page doesn't exist.
      </Text>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.primary,
            borderColor: colors.border,
          },
          shadows.sm,
        ]}
        onPress={() => router.replace('/')}
        activeOpacity={0.8}
        accessibilityLabel="Go to home screen"
        accessibilityRole="button"
      >
        <Text style={[styles.buttonText, { color: colors.textInverse }]}>Go Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700' as const,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  button: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: borderWidth.thick,
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600' as const,
  },
});