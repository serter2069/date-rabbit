import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { ProgressBar } from '../../src/components/verification/ProgressBar';
import { IDUpload } from '../../src/components/verification/IDUpload';
import { useVerificationStore } from '../../src/store/verificationStore';
import { colors, spacing, typography, borderRadius, PAGE_PADDING } from '../../src/constants/theme';

const STEPS = ['Intro', 'SSN', 'Photo ID', 'Selfie', 'Consent'];

const ACCEPTED_FORMATS = [
  "Driver's License",
  'Passport',
  'State ID Card',
];

export default function SeekerPhotoIDScreen() {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | undefined>();
  const { uploadId, isLoading } = useVerificationStore();

  const handleContinue = async () => {
    if (!imageUri) return;
    await uploadId(imageUri);
    router.push('/(seeker-verify)/selfie');
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
        <ProgressBar currentStep={2} totalSteps={5} labels={STEPS} />

        <View style={styles.header}>
          <Text style={styles.title}>Government-Issued ID</Text>
          <Text style={styles.subtitle}>
            Driver's license, passport, or state ID
          </Text>
        </View>

        <IDUpload
          imageUri={imageUri}
          onImageSelected={setImageUri}
        />

        <View style={styles.formatsContainer}>
          <View style={styles.formatsHeader}>
            <Icon name="info" size={16} color={colors.textMuted} />
            <Text style={styles.formatsTitle}>Accepted formats</Text>
          </View>
          <View style={styles.formatsList}>
            {ACCEPTED_FORMATS.map((format) => (
              <View key={format} style={styles.formatItem}>
                <View style={styles.formatDot} />
                <Text style={styles.formatText}>{format}</Text>
              </View>
            ))}
          </View>
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={isLoading}
          disabled={!imageUri || isLoading}
          variant="pink"
          fullWidth
          size="lg"
          testID="seeker-photo-id-continue-btn"
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
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    lineHeight: 24,
  },
  formatsContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  formatsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  formatsTitle: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  formatsList: {
    gap: spacing.xs,
  },
  formatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  formatDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  formatText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
});
