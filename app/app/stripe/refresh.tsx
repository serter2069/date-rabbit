import React, { useState } from 'react';
import { View, Text, StyleSheet, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Icon } from '../../src/components/Icon';
import { Button } from '../../src/components/Button';
import { useTheme, spacing, typography } from '../../src/constants/theme';
import { useEarningsStore } from '../../src/store/earningsStore';

export default function StripeRefreshScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { startStripeOnboarding } = useEarningsStore();
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    setRetrying(true);
    const result = await startStripeOnboarding();
    setRetrying(false);

    if (result.success && result.url) {
      if (Platform.OS === 'web') {
        Linking.openURL(result.url);
      } else {
        await WebBrowser.openAuthSessionAsync(result.url, 'daterabbit://');
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.warning + '20' }]}>
        <Icon name="refresh" size={48} color={colors.warning} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Session Expired</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Your Stripe onboarding session has expired. Please try again to complete your account setup.
      </Text>
      <Button
        title={retrying ? 'Redirecting...' : 'Try Again'}
        onPress={handleRetry}
        disabled={retrying}
        style={{ marginTop: spacing.lg }}
      />
      <Button
        title="Back to Earnings"
        onPress={() => router.replace('/(tabs)/female/earnings')}
        variant="outline"
        style={{ marginTop: spacing.sm }}
      />
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
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 24,
  },
});
