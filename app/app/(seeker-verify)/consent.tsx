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
import { ProgressBar } from '../../src/components/verification/ProgressBar';
import { ConsentForm } from '../../src/components/verification/ConsentForm';
import { useVerificationStore } from '../../src/store/verificationStore';
import { colors, spacing, typography } from '../../src/constants/theme';

const STEPS = ['Intro', 'SSN', 'Photo ID', 'Selfie', 'Consent'];

export default function SeekerConsentScreen() {
  const insets = useSafeAreaInsets();
  const [agreed, setAgreed] = useState(false);
  const { submitConsent, submitForReview, isLoading } = useVerificationStore();

  const handleSubmit = async () => {
    if (!agreed) return;

    const consentSuccess = await submitConsent();
    if (!consentSuccess) {
      const storeError = useVerificationStore.getState().error;
      Alert.alert('Error', storeError || 'Failed to submit consent. Please try again.');
      return;
    }

    const reviewSuccess = await submitForReview();
    if (reviewSuccess) {
      router.push('/(seeker-verify)/pending');
    } else {
      const storeError = useVerificationStore.getState().error;
      Alert.alert('Error', storeError || 'Failed to submit for review. Please try again.');
    }
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
        <ProgressBar currentStep={4} totalSteps={5} labels={STEPS} />

        <View style={styles.header}>
          <Text style={styles.title}>Background Check Consent</Text>
          <Text style={styles.subtitle}>
            Please read and agree to the terms below
          </Text>
        </View>

        <ConsentForm agreed={agreed} onToggle={setAgreed} />

        <Button
          title="I Agree & Submit"
          onPress={handleSubmit}
          loading={isLoading}
          disabled={!agreed || isLoading}
          variant="pink"
          fullWidth
          size="lg"
          testID="seeker-consent-submit-btn"
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
    paddingHorizontal: spacing.lg + 4,
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
});
