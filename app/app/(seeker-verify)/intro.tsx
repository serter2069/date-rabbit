import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showAlert } from '../../src/utils/alert';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { useVerificationStore } from '../../src/store/verificationStore';
import { colors, spacing, typography, borderRadius, PAGE_PADDING } from '../../src/constants/theme';

type ScreenState = 'intro' | 'loading' | 'pending' | 'success' | 'failed';

export default function SeekerVerifyIntroScreen() {
  const insets = useSafeAreaInsets();
  const { startIdentitySession, checkIdentityStatus, isLoading } = useVerificationStore();
  const [screenState, setScreenState] = useState<ScreenState>('intro');
  const [submitting, setSubmitting] = useState(false);

  const handleStartVerification = async () => {
    setSubmitting(true);
    setScreenState('loading');

    const session = await startIdentitySession();
    if (!session) {
      setSubmitting(false);
      setScreenState('intro');
      showAlert('Error', 'Could not start identity verification. Please try again.');
      return;
    }

    // Open Stripe Identity hosted page via WebBrowser (same pattern as companion verify.tsx)
    if (Platform.OS === 'web') {
      // On web: open in same tab since deep links are not available
      window.location.href = session.url;
      return;
    }

    await WebBrowser.openAuthSessionAsync(session.url, 'daterabbit://');

    // After returning from the browser, check the status
    setSubmitting(false);
    await handleCheckStatus();
  };

  const handleCheckStatus = async () => {
    setSubmitting(true);
    const result = await checkIdentityStatus();
    setSubmitting(false);

    if (!result) {
      showAlert('Error', 'Could not check verification status. Please try again.');
      return;
    }

    if (result.status === 'verified') {
      setScreenState('success');
    } else if (result.status === 'processing' || result.verificationStatus === 'pending_review') {
      setScreenState('pending');
    } else {
      // requires_input or canceled — let user retry
      setScreenState('failed');
    }
  };

  const handleContinuePending = () => {
    router.push('/(seeker-verify)/pending');
  };

  const handleContinueApproved = () => {
    router.push('/(seeker-verify)/approved');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Intro / Loading state */}
        {(screenState === 'intro' || screenState === 'loading') && (
          <>
            <View style={styles.heroContainer}>
              <View style={styles.heroIconContainer}>
                <Icon name="shield" size={48} color={colors.primary} />
              </View>
            </View>

            <View style={styles.header}>
              <Text style={styles.title}>Identity Verification</Text>
              <Text style={styles.subtitle}>
                We need to verify your identity to keep the platform safe
              </Text>
            </View>

            <View style={styles.infoCard}>
              <Text style={styles.infoTitle}>How it works</Text>
              {[
                'Take a photo of your government-issued ID',
                'Take a quick selfie to match your ID',
                'Stripe securely verifies your identity',
              ].map((step, i) => (
                <View key={i} style={styles.stepRow}>
                  <View style={styles.stepBadge}>
                    <Text style={styles.stepBadgeText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <View style={styles.timeBadge}>
              <Icon name="clock" size={16} color={colors.accent} />
              <Text style={styles.timeBadgeText}>Takes about 2 minutes</Text>
            </View>

            <Text style={styles.privacyNote}>
              Your information is securely handled by Stripe, a PCI-certified verification provider. DateRabbit does not store your ID photos.
            </Text>

            <Button
              title={submitting ? 'Opening verification...' : 'Start Identity Verification'}
              onPress={handleStartVerification}
              loading={submitting || isLoading}
              disabled={submitting || isLoading}
              variant="pink"
              fullWidth
              size="lg"
              testID="seeker-verify-start-btn"
            />
          </>
        )}

        {/* Pending state */}
        {screenState === 'pending' && (
          <>
            <View style={styles.statusCard}>
              <Text style={styles.statusIcon}>...</Text>
              <Text style={styles.statusTitle}>Verification in Review</Text>
              <Text style={styles.statusBody}>
                Your identity is being reviewed by Stripe. This usually takes a few minutes.
              </Text>
            </View>
            <Button
              title="Check Status"
              onPress={handleContinuePending}
              variant="pink"
              fullWidth
              size="lg"
              testID="seeker-verify-check-status-btn"
            />
            <Button
              title="Check Again"
              onPress={handleCheckStatus}
              loading={submitting}
              variant="outline"
              fullWidth
              size="lg"
              style={styles.secondaryBtn}
            />
          </>
        )}

        {/* Success state */}
        {screenState === 'success' && (
          <>
            <View style={styles.statusCard}>
              <Text style={styles.statusIcon}>OK</Text>
              <Text style={styles.statusTitle}>Identity Verified</Text>
              <Text style={styles.statusBody}>
                Your identity has been successfully verified.
              </Text>
            </View>
            <Button
              title="Continue"
              onPress={handleContinueApproved}
              variant="pink"
              fullWidth
              size="lg"
              testID="seeker-verify-continue-btn"
            />
          </>
        )}

        {/* Failed / retry state */}
        {screenState === 'failed' && (
          <>
            <View style={[styles.statusCard, styles.statusCardError]}>
              <Text style={styles.statusIcon}>!</Text>
              <Text style={styles.statusTitle}>Verification Incomplete</Text>
              <Text style={styles.statusBody}>
                The verification session did not complete. Please try again or contact support if the issue persists.
              </Text>
            </View>
            <Button
              title="Try Again"
              onPress={handleStartVerification}
              loading={submitting}
              variant="pink"
              fullWidth
              size="lg"
              testID="seeker-verify-retry-btn"
            />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web' ? { height: '100vh' as any } : {}),
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: PAGE_PADDING,
  },
  heroContainer: {
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  heroIconContainer: {
    width: 96,
    height: 96,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    borderWidth: 3,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  infoTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.lg,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.white,
  },
  stepText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.text,
    flex: 1,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.black,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },
  timeBadgeText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.black,
  },
  privacyNote: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  statusCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
  },
  statusCardError: {
    borderWidth: 2,
    borderColor: colors.error,
  },
  statusIcon: {
    fontFamily: typography.fonts.heading,
    fontSize: 40,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  statusTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    color: colors.text,
    textAlign: 'center',
  },
  statusBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  secondaryBtn: {
    marginTop: spacing.sm,
  },
});
