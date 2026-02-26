import React, { useState } from 'react';
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
import { ProgressBar } from '../../src/components/verification/ProgressBar';
import { useVerificationStore } from '../../src/store/verificationStore';
import { colors, spacing, typography, borderRadius, PAGE_PADDING } from '../../src/constants/theme';

const STEPS = ['Intro', 'SSN', 'Photo ID', 'Selfie', 'Consent'];

const REQUIREMENTS = [
  {
    icon: 'shield' as const,
    title: 'Last 4 of SSN',
    description: 'Used only for identity verification',
  },
  {
    icon: 'credit-card' as const,
    title: 'Government-Issued ID',
    description: 'Driver\'s license, passport, or state ID',
  },
  {
    icon: 'camera' as const,
    title: 'Selfie Photo',
    description: 'We\'ll match it with your ID photo',
  },
  {
    icon: 'check-circle' as const,
    title: 'Consent',
    description: 'Authorize the background check',
  },
];

export default function SeekerVerifyIntroScreen() {
  const insets = useSafeAreaInsets();
  const { startVerification, isLoading } = useVerificationStore();
  const [starting, setStarting] = useState(false);

  const handleGetStarted = async () => {
    setStarting(true);
    await startVerification();
    setStarting(false);
    // Navigate even if API fails — screens handle errors individually
    router.push('/(seeker-verify)/ssn');
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
        <ProgressBar currentStep={0} totalSteps={5} labels={STEPS} />

        <View style={styles.heroContainer}>
          <View style={styles.heroIconContainer}>
            <Icon name="shield" size={48} color={colors.primary} />
          </View>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Verify Your Identity</Text>
          <Text style={styles.subtitle}>Help keep our community safe</Text>
        </View>

        <View style={styles.requirementsList}>
          {REQUIREMENTS.map((item, index) => (
            <View key={index} style={styles.requirementItem}>
              <View style={styles.requirementIcon}>
                <Icon name={item.icon} size={22} color={colors.primary} />
              </View>
              <View style={styles.requirementText}>
                <Text style={styles.requirementTitle}>{item.title}</Text>
                <Text style={styles.requirementDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.timeBadge}>
          <Icon name="clock" size={16} color={colors.accent} />
          <Text style={styles.timeBadgeText}>Takes about 2 minutes</Text>
        </View>

        <Text style={styles.privacyNote}>
          All data is encrypted and used only for verification purposes.
        </Text>

        <Button
          title="Get Started"
          onPress={handleGetStarted}
          loading={starting || isLoading}
          variant="pink"
          fullWidth
          size="lg"
          testID="seeker-verify-get-started-btn"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
  requirementsList: {
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
  },
  requirementIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  requirementText: {
    flex: 1,
  },
  requirementTitle: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: 2,
  },
  requirementDescription: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.black,
    borderRadius: borderRadius.full,
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
});
