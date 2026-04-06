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
import { colors, spacing, typography, PAGE_PADDING } from '../../src/constants/theme';

const STEPS = ['Intro', 'Pending', 'Done'];

export default function SeekerConsentScreen() {
  const insets = useSafeAreaInsets();
  const [agreed, setAgreed] = useState(false);
  const { submitConsent, submitForReview, isLoading, error: apiError } = useVerificationStore();

  const handleSubmit = async () => {
    if (!agreed) return;
    const consentOk = await submitConsent();
    if (!consentOk) {
      Alert.alert('Submission Failed', apiError || 'Failed to submit consent. Please try again.');
      return;
    }
    const reviewOk = await submitForReview();
    if (!reviewOk) {
      Alert.alert('Submission Failed', apiError || 'Failed to submit for review. Please try again.');
      return;
    }
    // After consent, send seeker to Stripe Identity verification (intro.tsx handles the session)
    router.push('/(seeker-verify)/intro');
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
        <ProgressBar currentStep={2} totalSteps={3} labels={STEPS} />

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
});
