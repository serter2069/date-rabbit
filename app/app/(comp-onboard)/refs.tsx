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
import { Input } from '../../src/components/Input';
import { Icon } from '../../src/components/Icon';
import { ProgressBar, ConsentForm } from '../../src/components/verification';
import { useVerificationStore } from '../../src/store/verificationStore';
import type { VerificationReference } from '../../src/types';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

interface RefForm {
  name: string;
  phone: string;
  relationship: string;
}

const EMPTY_REF: RefForm = { name: '', phone: '', relationship: '' };

export default function CompRefsScreen() {
  const insets = useSafeAreaInsets();
  const { submitReferences, submitConsent, submitForReview, isLoading } = useVerificationStore();

  const [refs, setRefs] = useState<[RefForm, RefForm]>([{ ...EMPTY_REF }, { ...EMPTY_REF }]);
  const [consentGiven, setConsentGiven] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const updateRef = (index: 0 | 1, field: keyof RefForm, value: string) => {
    setRefs((prev) => {
      const next: [RefForm, RefForm] = [{ ...prev[0] }, { ...prev[1] }];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setErrors((prev) => ({ ...prev, [`ref${index}_${field}`]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    refs.forEach((ref, i) => {
      if (!ref.name.trim()) newErrors[`ref${i}_name`] = 'Name is required';
      if (!ref.phone.trim()) {
        newErrors[`ref${i}_phone`] = 'Phone is required';
      } else if (!/^\+?[\d\s\-().]{7,}$/.test(ref.phone.trim())) {
        newErrors[`ref${i}_phone`] = 'Enter a valid phone number';
      }
      if (!ref.relationship.trim()) newErrors[`ref${i}_relationship`] = 'Relationship is required';
    });

    if (!consentGiven) newErrors.consent = 'You must agree to the terms to continue';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = async () => {
    if (!validate()) return;

    setSubmitting(true);

    const refsPayload: VerificationReference[] = refs.map((r) => ({
      name: r.name.trim(),
      phone: r.phone.trim(),
      relationship: r.relationship.trim(),
    }));

    const refsOk = await submitReferences(refsPayload);
    if (!refsOk) {
      setSubmitting(false);
      Alert.alert('Error', 'Failed to submit references. Please try again.');
      return;
    }

    const consentOk = await submitConsent();
    if (!consentOk) {
      setSubmitting(false);
      Alert.alert('Error', 'Failed to submit consent. Please try again.');
      return;
    }

    const reviewOk = await submitForReview();
    if (!reviewOk) {
      setSubmitting(false);
      Alert.alert('Error', 'Failed to submit for review. Please try again.');
      return;
    }

    setSubmitting(false);
    router.push('/(comp-onboard)/pending');
  };

  const renderRefForm = (index: 0 | 1) => (
    <View style={styles.refCard} key={index}>
      <View style={styles.refHeader}>
        <View style={styles.refBadge}>
          <Icon name="user" size={16} color={colors.accent} />
        </View>
        <Text style={styles.refTitle}>Reference {index + 1}</Text>
      </View>

      <Input
        label="Full Name"
        placeholder="Jane Smith"
        value={refs[index].name}
        onChangeText={(v) => updateRef(index, 'name', v)}
        error={errors[`ref${index}_name`]}
        autoCapitalize="words"
        leftIcon={<Icon name="user" size={18} color={colors.textLight} />}
        testID={`ref${index}-name-input`}
      />

      <Input
        label="Phone Number"
        placeholder="+1 (555) 000-0000"
        value={refs[index].phone}
        onChangeText={(v) => updateRef(index, 'phone', v)}
        error={errors[`ref${index}_phone`]}
        keyboardType="phone-pad"
        leftIcon={<Icon name="phone" size={18} color={colors.textLight} />}
        testID={`ref${index}-phone-input`}
      />

      <Input
        label="Relationship"
        placeholder="e.g. Former employer, Colleague, Friend"
        value={refs[index].relationship}
        onChangeText={(v) => updateRef(index, 'relationship', v)}
        error={errors[`ref${index}_relationship`]}
        autoCapitalize="sentences"
        leftIcon={<Icon name="users" size={18} color={colors.textLight} />}
        testID={`ref${index}-relationship-input`}
      />
    </View>
  );

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
        <ProgressBar currentStep={5} totalSteps={7} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Professional References</Text>
          <Text style={styles.subtitle}>
            Provide 2 references who can vouch for your character
          </Text>
        </View>

        {/* Reference forms */}
        {renderRefForm(0)}
        {renderRefForm(1)}

        {/* Consent section */}
        <View style={styles.consentSection}>
          <ConsentForm
            agreed={consentGiven}
            onToggle={setConsentGiven}
          />
          {errors.consent && (
            <Text style={styles.consentError}>{errors.consent}</Text>
          )}
        </View>

        <Button
          title="Submit for Review"
          onPress={handleContinue}
          loading={submitting || isLoading}
          variant="pink"
          fullWidth
          size="lg"
          testID="comp-refs-submit-btn"
        />

        <Text style={styles.disclaimer}>
          By submitting, you confirm all information provided is accurate and truthful.
        </Text>
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
  refCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  refHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  refBadge: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(184, 169, 232, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  refTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  consentSection: {
    marginBottom: spacing.lg,
  },
  consentError: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  disclaimer: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
  },
});
