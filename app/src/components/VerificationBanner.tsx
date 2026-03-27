import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from './Icon';
import { colors, spacing, typography, borderRadius, borderWidth } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

interface VerificationBannerProps {
  /** Compact mode shows a smaller single-line banner */
  compact?: boolean;
}

/**
 * Banner reminding unverified users to complete verification.
 * Renders nothing if the user is already verified.
 */
export function VerificationBanner({ compact = false }: VerificationBannerProps) {
  const { user } = useAuthStore();
  const router = useRouter();

  const isVerified = user?.verificationStatus === 'approved';
  const isPending = user?.verificationStatus === 'pending';

  if (isVerified) return null;

  const handlePress = () => {
    if (user?.role === 'seeker') {
      router.push('/(seeker-verify)/intro');
    } else {
      router.push('/(comp-onboard)/step1');
    }
  };

  if (isPending) {
    return (
      <View style={[styles.banner, styles.pendingBanner, compact && styles.compact]}>
        <Icon name="clock" size={compact ? 16 : 20} color={colors.badge.warning.text} />
        <Text style={[styles.text, styles.pendingText, compact && styles.compactText]}>
          Verification under review
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.banner, styles.warningBanner, compact && styles.compact]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityLabel="Complete verification"
      accessibilityRole="button"
      accessibilityHint="Opens identity verification flow"
    >
      <View style={styles.content}>
        <Icon name="shield-alert" size={compact ? 16 : 20} color={colors.warning} />
        <Text style={[styles.text, compact && styles.compactText]}>
          {compact
            ? 'Verify to unlock booking'
            : 'Complete verification to unlock booking and payments'}
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: borderWidth.thin,
    borderColor: colors.black,
  },
  compact: {
    paddingVertical: spacing.sm,
    marginVertical: spacing.xs,
  },
  warningBanner: {
    backgroundColor: colors.warningLight,
  },
  pendingBanner: {
    backgroundColor: colors.badge.warning.bg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: spacing.sm,
  },
  text: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.textPrimary,
    flex: 1,
  },
  compactText: {
    fontSize: typography.sizes.xs,
  },
  pendingText: {
    marginLeft: spacing.sm,
  },
});
