import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { ProgressBar } from '../../src/components/verification';
import { useVerificationStore } from '../../src/store/verificationStore';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

const POLL_INTERVAL_MS = 10_000;

export default function CompPendingScreen() {
  const insets = useSafeAreaInsets();
  const { fetchStatus, status } = useVerificationStore();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Poll for status updates
    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, POLL_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (status === 'approved') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      router.replace('/(tabs)');
    } else if (status === 'rejected') {
      if (intervalRef.current) clearInterval(intervalRef.current);
      // Stay on screen, show rejection state
    }
  }, [status]);

  const isRejected = status === 'rejected';

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
      ]}
    >
      <ProgressBar currentStep={6} totalSteps={7} />

      <View style={styles.content}>
        {isRejected ? (
          <>
            <View style={[styles.iconContainer, styles.iconContainerError]}>
              <Icon name="x-circle" size={40} color={colors.error} />
            </View>
            <Text style={styles.title}>Verification Not Approved</Text>
            <Text style={styles.subtitle}>
              Unfortunately your verification was not approved at this time.
              Please contact support for more information.
            </Text>
          </>
        ) : (
          <>
            <View style={styles.iconContainer}>
              <Icon name="clock" size={40} color={colors.accent} />
            </View>
            <Text style={styles.title}>Verification Under Review</Text>
            <Text style={styles.subtitle}>
              Our team is reviewing your submission. Companion verification is thorough
              and may take 1–3 business days.
            </Text>

            <View style={styles.pollingRow}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.pollingText}>Checking for updates…</Text>
            </View>
          </>
        )}

        {/* Info cards */}
        <View style={styles.infoCards}>
          <View style={styles.infoCard}>
            <Icon name="shield" size={20} color={colors.accent} />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>What happens next</Text>
              <Text style={styles.infoCardBody}>
                We'll notify you by email once your verification is complete.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon name="lock" size={20} color={colors.accent} />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>Your data is safe</Text>
              <Text style={styles.infoCardBody}>
                All personal information is encrypted and never shared with other users.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon name="mail" size={20} color={colors.accent} />
            <View style={styles.infoCardText}>
              <Text style={styles.infoCardTitle}>Need help?</Text>
              <Text style={styles.infoCardBody}>
                Contact us at support@daterabbit.com if you have questions.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg + 4,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(184, 169, 232, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  iconContainerError: {
    backgroundColor: colors.errorLight,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  pollingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.full,
    marginBottom: spacing.xl,
  },
  pollingText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  infoCards: {
    width: '100%',
    gap: spacing.sm,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  infoCardText: {
    flex: 1,
  },
  infoCardTitle: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: 2,
  },
  infoCardBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
});
