import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { ProgressBar } from '../../src/components/verification';
import { useVerificationStore } from '../../src/store/verificationStore';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

const REQUIREMENTS = [
  { icon: 'lock', label: 'SSN last 4 digits', description: 'For identity verification' },
  { icon: 'credit-card', label: 'Photo ID', description: 'Passport, license, or govt ID' },
  { icon: 'camera', label: 'Selfie photo', description: 'Match your ID photo' },
  { icon: 'video', label: 'Video introduction', description: '30–60 second intro clip' },
  { icon: 'users', label: 'Two references', description: 'People who can vouch for you' },
  { icon: 'check-circle', label: 'Consent & authorization', description: 'Background check agreement' },
];

export default function CompStep1Screen() {
  const insets = useSafeAreaInsets();
  const { startVerification, isLoading } = useVerificationStore();

  useEffect(() => {
    startVerification();
  }, []);

  const handleNext = () => {
    router.push('/(comp-onboard)/verify');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ProgressBar currentStep={0} totalSteps={7} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Icon name="sparkles" size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Become a Companion</Text>
        <Text style={styles.subtitle}>
          Complete verification to start accepting bookings
        </Text>
      </View>

      {/* Requirements list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What you'll need</Text>
        {REQUIREMENTS.map((req, index) => (
          <View key={index} style={styles.requirementRow}>
            <View style={styles.requirementIcon}>
              <Icon name={req.icon as any} size={18} color={colors.accent} />
            </View>
            <View style={styles.requirementText}>
              <Text style={styles.requirementLabel}>{req.label}</Text>
              <Text style={styles.requirementDescription}>{req.description}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Time estimate */}
      <View style={styles.timeEstimate}>
        <Icon name="clock" size={16} color={colors.textMuted} />
        <Text style={styles.timeText}>Estimated time: 5 minutes</Text>
      </View>

      <Button
        title="Let's Go"
        onPress={handleNext}
        loading={isLoading}
        variant="pink"
        fullWidth
        size="lg"
        testID="comp-step1-next-btn"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg + 4,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(248, 180, 196, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.md,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  requirementIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(184, 169, 232, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  requirementText: {
    flex: 1,
    paddingTop: 2,
  },
  requirementLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: 2,
  },
  requirementDescription: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  timeEstimate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  timeText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
