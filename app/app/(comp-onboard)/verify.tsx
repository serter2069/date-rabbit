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
import {
  ProgressBar,
  SSNInput,
  IDUpload,
  SelfieCapture,
} from '../../src/components/verification';
import { useVerificationStore } from '../../src/store/verificationStore';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function CompVerifyScreen() {
  const insets = useSafeAreaInsets();
  const { submitSSN, uploadId, uploadSelfie, isLoading } = useVerificationStore();

  const [ssn, setSsn] = useState('');
  const [idUri, setIdUri] = useState<string | undefined>();
  const [selfieUri, setSelfieUri] = useState<string | undefined>();
  const [errors, setErrors] = useState<{ ssn?: string; id?: string; selfie?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (ssn.length !== 4) newErrors.ssn = 'Enter all 4 digits';
    if (!idUri) newErrors.id = 'Please upload your photo ID';
    if (!selfieUri) newErrors.selfie = 'Please take a selfie photo';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    setSubmitting(true);

    const ssnOk = await submitSSN(ssn);
    if (!ssnOk) {
      setSubmitting(false);
      Alert.alert('Error', 'Failed to submit SSN. Please try again.');
      return;
    }

    const idOk = await uploadId(idUri!);
    if (!idOk) {
      setSubmitting(false);
      Alert.alert('Error', 'Failed to upload ID photo. Please try again.');
      return;
    }

    const selfieOk = await uploadSelfie(selfieUri!);
    if (!selfieOk) {
      setSubmitting(false);
      Alert.alert('Error', 'Failed to upload selfie. Please try again.');
      return;
    }

    setSubmitting(false);
    router.push('/(comp-onboard)/video');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar currentStep={2} totalSteps={7} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Identity Verification</Text>
          <Text style={styles.subtitle}>
            We need to verify your identity to keep the platform safe
          </Text>
        </View>

        {/* Section 1: SSN */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>1</Text>
            </View>
            <Text style={styles.sectionTitle}>Social Security Number</Text>
          </View>
          <SSNInput
            value={ssn}
            onChange={(v) => {
              setSsn(v);
              setErrors((e) => ({ ...e, ssn: undefined }));
            }}
            error={errors.ssn}
          />
        </View>

        {/* Section 2: Photo ID */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>2</Text>
            </View>
            <Text style={styles.sectionTitle}>Photo ID</Text>
          </View>
          <IDUpload
            imageUri={idUri}
            onImageSelected={(uri) => {
              setIdUri(uri);
              setErrors((e) => ({ ...e, id: undefined }));
            }}
            error={errors.id}
          />
        </View>

        {/* Section 3: Selfie */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>3</Text>
            </View>
            <Text style={styles.sectionTitle}>Selfie Photo</Text>
          </View>
          <SelfieCapture
            imageUri={selfieUri}
            onImageCaptured={(uri) => {
              setSelfieUri(uri);
              setErrors((e) => ({ ...e, selfie: undefined }));
            }}
            error={errors.selfie}
          />
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={submitting || isLoading}
          variant="pink"
          fullWidth
          size="lg"
          testID="comp-verify-continue-btn"
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
  content: {
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
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBadgeText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.white,
  },
  sectionTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
});
