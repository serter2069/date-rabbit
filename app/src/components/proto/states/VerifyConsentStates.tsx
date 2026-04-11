import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// Progress bar component
// ===========================================================================
function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={s.progressBarOuter}>
      <View style={[s.progressBarInner, { width: `${percent}%` }]} />
    </View>
  );
}

// ===========================================================================
// Checkbox component
// ===========================================================================
function Checkbox({
  checked,
  onToggle,
  label,
}: {
  checked: boolean;
  onToggle: () => void;
  label: string;
}) {
  return (
    <Pressable style={s.checkboxRow} onPress={onToggle}>
      <View style={[s.checkboxBox, checked && s.checkboxBoxChecked]}>
        {checked && <Feather name="check" size={14} color={colors.textInverse} />}
      </View>
      <Text style={s.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Consent form with checkboxes
// ===========================================================================
function DefaultState() {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const allChecked = ageConfirmed && termsAccepted;

  return (
    <View style={s.page}>
      <Text style={s.stepHeader}>Step 3 of 3: Consent</Text>
      <ProgressBar percent={100} />

      <Text style={s.headline}>Identity Verification Consent</Text>

      {/* Legal text scroll area */}
      <View style={[s.legalCard, shadows.sm]}>
        <ScrollView style={s.legalScroll} nestedScrollEnabled>
          <Text style={s.legalText}>
            By continuing, you consent to Stripe Identity collecting and
            processing your biometric data for age and identity verification.
            Your data is stored securely and used only for verification
            purposes. Stripe may retain your information as required by
            applicable law. You can request deletion of your data at any time
            by contacting support.
          </Text>
        </ScrollView>
      </View>

      {/* Checkboxes */}
      <View style={s.checkboxGroup}>
        <Checkbox
          checked={ageConfirmed}
          onToggle={() => setAgeConfirmed(!ageConfirmed)}
          label="I am 21 years of age or older"
        />
        <Checkbox
          checked={termsAccepted}
          onToggle={() => setTermsAccepted(!termsAccepted)}
          label="I agree to the Stripe Identity Terms of Service"
        />
      </View>

      {/* Submit */}
      <Pressable
        style={[
          s.ctaPrimary,
          shadows.button,
          !allChecked && s.ctaDisabled,
        ]}
        disabled={!allChecked}
        onPress={() => allChecked && router.push('/proto/states/verify-pending' as any)}
      >
        <Text
          style={[
            s.ctaPrimaryText,
            !allChecked && s.ctaDisabledText,
          ]}
        >
          SUBMIT FOR VERIFICATION
        </Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function VerifyConsentStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Consent form with interactive checkboxes">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16 },

  stepHeader: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },

  progressBarOuter: {
    width: '100%',
    height: 8,
    backgroundColor: colors.backgroundWarm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  headline: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },

  legalCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  legalScroll: {
    maxHeight: 160,
  },
  legalText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  checkboxGroup: {
    gap: 14,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: colors.primary,
  },
  checkboxLabel: {
    ...typography.bodyMedium,
    color: colors.text,
    flex: 1,
  },

  ctaPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryText: {
    ...typography.button,
    color: colors.textInverse,
  },
  ctaDisabled: {
    backgroundColor: colors.backgroundWarm,
    borderColor: colors.borderLight,
  },
  ctaDisabledText: {
    color: colors.textLight,
  },
});
