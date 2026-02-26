import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { ProgressBar } from '../../src/components/verification/ProgressBar';
import { SSNInput } from '../../src/components/verification/SSNInput';
import { useVerificationStore } from '../../src/store/verificationStore';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

const STEPS = ['Intro', 'SSN', 'Photo ID', 'Selfie', 'Consent'];

export default function SeekerSSNScreen() {
  const insets = useSafeAreaInsets();
  const [ssn, setSsn] = useState('');
  const [error, setError] = useState('');
  const { submitSSN, isLoading } = useVerificationStore();

  const handleContinue = async () => {
    if (ssn.length !== 4) {
      setError('Please enter all 4 digits');
      return;
    }
    setError('');
    const success = await submitSSN(ssn);
    if (success) {
      router.push('/(seeker-verify)/photo-id');
    } else {
      const storeError = useVerificationStore.getState().error;
      Alert.alert('Error', storeError || 'Failed to submit SSN. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar currentStep={1} totalSteps={5} labels={STEPS} />

        <View style={styles.header}>
          <Text style={styles.title}>Social Security Number</Text>
          <Text style={styles.subtitle}>We only store the last 4 digits</Text>
        </View>

        <SSNInput
          value={ssn}
          onChange={(val) => {
            setSsn(val);
            if (error) setError('');
          }}
          error={error}
        />

        <View style={styles.privacyNotice}>
          <Icon name="lock" size={16} color={colors.accent} />
          <Text style={styles.privacyText}>
            Your SSN is encrypted and only used for background verification
          </Text>
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={isLoading}
          disabled={ssn.length !== 4 || isLoading}
          variant="pink"
          fullWidth
          size="lg"
          testID="seeker-ssn-continue-btn"
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  privacyNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: 'rgba(184, 169, 232, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  privacyText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});
