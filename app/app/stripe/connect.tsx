import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, Linking, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { Button } from '../../src/components/Button';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import { useEarningsStore } from '../../src/store/earningsStore';

export default function StripeConnectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { connectStatus, fetchConnectStatus, startStripeOnboarding } = useEarningsStore();

  const [loading, setLoading] = useState(true);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  useEffect(() => {
    fetchConnectStatus().finally(() => setLoading(false));
  }, []);

  const isConnected = connectStatus?.complete === true;
  const payoutsEnabled = connectStatus?.payoutsEnabled === true;

  const handleSetup = async () => {
    setOnboardingLoading(true);
    const result = await startStripeOnboarding();
    setOnboardingLoading(false);

    if (result.success && result.url) {
      if (Platform.OS === 'web') {
        Linking.openURL(result.url);
      } else {
        await WebBrowser.openAuthSessionAsync(result.url, 'daterabbit://');
        // Re-check status after returning
        fetchConnectStatus();
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Already connected
  if (isConnected) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xl }]}>
        <View style={styles.content}>
          <View style={[styles.iconCircle, { backgroundColor: colors.successLight }]}>
            <Icon name="check" size={48} color={colors.success} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            {payoutsEnabled ? 'Payouts Active' : 'Account Connected'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {payoutsEnabled
              ? 'Your Stripe account is connected and payouts are enabled. You will receive earnings from completed bookings.'
              : 'Your Stripe account is connected but payouts are pending verification. Stripe is reviewing your account.'}
          </Text>
          <Button
            title="Go to Earnings"
            onPress={() => router.replace('/(tabs)/female/earnings')}
            style={{ marginTop: spacing.lg, width: '100%' }}
          />
        </View>
      </View>
    );
  }

  // Not connected - show setup flow
  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
          <Icon name="credit-card" size={48} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Set Up Payouts</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Connect your bank account through Stripe to receive earnings from completed bookings.
        </Text>

        {/* Steps */}
        <View style={[styles.stepsCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
          {[
            { icon: 'user', label: 'Verify your identity' },
            { icon: 'building', label: 'Add your bank account' },
            { icon: 'dollar-sign', label: 'Start receiving payouts' },
          ].map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={[styles.stepNumberText, { color: colors.white }]}>{index + 1}</Text>
              </View>
              <Text style={[styles.stepLabel, { color: colors.text }]}>{step.label}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.securityNote, { color: colors.textMuted }]}>
          Your information is securely handled by Stripe, a PCI-certified payment processor.
        </Text>

        <Button
          title={onboardingLoading ? 'Redirecting to Stripe...' : 'Set Up with Stripe'}
          onPress={handleSetup}
          disabled={onboardingLoading}
          loading={onboardingLoading}
          style={{ width: '100%', marginTop: spacing.lg }}
        />
        <Button
          title="Back"
          onPress={() => router.back()}
          variant="outline"
          style={{ width: '100%', marginTop: spacing.sm }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
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
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  stepsCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    gap: spacing.lg,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
  },
  stepLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
  },
  securityNote: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.lg,
    lineHeight: 20,
  },
});
