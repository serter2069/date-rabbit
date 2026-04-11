import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader } from '../NavComponents';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

const CODE_LENGTH = 6;

// ===========================================================================
// PageShell — full-screen wrapper with header
// ===========================================================================
function PageShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;
  return (
    <View style={s.shell}>
      <ProtoHeader variant="back" onBack={() => router.push('/proto/states/auth-login')} />
      <View style={[s.shellContent, isDesktop && s.shellDesktop]}>
        {children}
      </View>
    </View>
  );
}

// ===========================================================================
// Shared OTP digit boxes component
// ===========================================================================
function OtpBoxes({
  digits,
  onChangeDigit,
  hasError,
}: {
  digits: string[];
  onChangeDigit: (index: number, value: string) => void;
  hasError?: boolean;
}) {
  return (
    <View style={s.codeRow}>
      {digits.map((d, i) => (
        <TextInput
          key={i}
          style={[
            s.codeBox,
            d ? s.codeBoxFilled : null,
            hasError ? s.codeBoxError : null,
          ]}
          value={d}
          onChangeText={(val) => onChangeDigit(i, val.replace(/\D/g, '').slice(-1))}
          keyboardType="number-pad"
          maxLength={1}
          textAlign="center"
        />
      ))}
    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Enter OTP code
// ===========================================================================
function DefaultState() {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);

  const handleChange = (index: number, value: string) => {
    const next = [...digits];
    next[index] = value;
    setDigits(next);
  };

  return (
    <View style={s.page}>
      <View style={s.iconCircle}>
        <Feather name="mail" size={28} color={colors.primary} />
      </View>

      <Text style={s.title}>Check your email</Text>
      <Text style={s.subtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={s.emailHighlight}>jessica@email.com</Text>
      </Text>

      <OtpBoxes digits={digits} onChangeDigit={handleChange} />

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-role-select')}>
        <Text style={s.ctaPrimaryText}>VERIFY CODE</Text>
        <Feather name="arrow-right" size={16} color={colors.textInverse} />
      </Pressable>

      <View style={s.resendRow}>
        <Text style={s.resendLabel}>Didn't get it? </Text>
        <Pressable style={s.resendDisabled} disabled>
          <Text style={s.resendDisabledText}>Resend in 59s</Text>
        </Pressable>
      </View>

      <Pressable style={s.changeEmailLink} onPress={() => router.push('/proto/states/auth-login')}>
        <Feather name="edit-2" size={14} color={colors.textMuted} />
        <Text style={s.changeEmailText}>Change email address</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// STATE 2: ERROR — Invalid code entered
// ===========================================================================
function ErrorState() {
  const [digits, setDigits] = useState<string[]>(['4', '8', '2', '7', '1', '5']);

  const handleChange = (index: number, value: string) => {
    const next = [...digits];
    next[index] = value;
    setDigits(next);
  };

  return (
    <View style={s.page}>
      <View style={[s.iconCircle, s.iconCircleError]}>
        <Feather name="alert-triangle" size={28} color={colors.error} />
      </View>

      <Text style={s.title}>Check your email</Text>
      <Text style={s.subtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={s.emailHighlight}>jessica@email.com</Text>
      </Text>

      <OtpBoxes digits={digits} onChangeDigit={handleChange} hasError />
      <View style={s.errorBanner}>
        <Feather name="alert-circle" size={14} color={colors.error} />
        <Text style={s.errorText}>Invalid code. Please try again.</Text>
      </View>

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-role-select')}>
        <Text style={s.ctaPrimaryText}>VERIFY CODE</Text>
        <Feather name="arrow-right" size={16} color={colors.textInverse} />
      </Pressable>

      <View style={s.resendRow}>
        <Text style={s.resendLabel}>Didn't get it? </Text>
        <Pressable style={s.resendActive}>
          <Text style={s.resendActiveText}>Resend code</Text>
        </Pressable>
      </View>

      <Pressable style={s.changeEmailLink} onPress={() => router.push('/proto/states/auth-login')}>
        <Feather name="edit-2" size={14} color={colors.textMuted} />
        <Text style={s.changeEmailText}>Change email address</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// STATE 3: RESEND_SENT — Confirmation banner + timer
// ===========================================================================
function ResendSentState() {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);

  const handleChange = (index: number, value: string) => {
    const next = [...digits];
    next[index] = value;
    setDigits(next);
  };

  return (
    <View style={s.page}>
      <View style={s.successBanner}>
        <Feather name="check-circle" size={16} color={colors.success} />
        <Text style={s.successBannerText}>New code sent to jessica@email.com</Text>
      </View>

      <View style={s.iconCircle}>
        <Feather name="mail" size={28} color={colors.primary} />
      </View>

      <Text style={s.title}>Check your email</Text>
      <Text style={s.subtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={s.emailHighlight}>jessica@email.com</Text>
      </Text>

      <OtpBoxes digits={digits} onChangeDigit={handleChange} />

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-role-select')}>
        <Text style={s.ctaPrimaryText}>VERIFY CODE</Text>
        <Feather name="arrow-right" size={16} color={colors.textInverse} />
      </Pressable>

      <View style={s.resendRow}>
        <Text style={s.resendLabel}>Didn't get it? </Text>
        <Pressable style={s.resendDisabled} disabled>
          <Text style={s.resendDisabledText}>Resend in 59s</Text>
        </Pressable>
      </View>

      <Pressable style={s.changeEmailLink} onPress={() => router.push('/proto/states/auth-login')}>
        <Feather name="edit-2" size={14} color={colors.textMuted} />
        <Text style={s.changeEmailText}>Change email address</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function AuthOtpStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Fresh OTP entry, resend on cooldown">
        <PageShell>
          <DefaultState />
        </PageShell>
      </StateSection>
      <StateSection title="ERROR" description="Invalid code, boxes red, resend active">
        <PageShell>
          <ErrorState />
        </PageShell>
      </StateSection>
      <StateSection title="RESEND_SENT" description="Success banner, timer countdown">
        <PageShell>
          <ResendSentState />
        </PageShell>
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  shell: {
    minHeight: 844,
    backgroundColor: colors.background,
    flex: 1,
  },
  shellContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  shellDesktop: {
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  page: { gap: 16, paddingVertical: 16, alignItems: 'center' },

  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconCircleError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },

  title: { ...typography.h1, color: colors.text, textAlign: 'center' },
  subtitle: { ...typography.body, color: colors.textMuted, lineHeight: 24, textAlign: 'center' },
  emailHighlight: { ...typography.bodyMedium, color: colors.primary },

  codeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  codeBox: {
    width: 48,
    height: 56,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 56,
  },
  codeBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  codeBoxError: {
    borderColor: colors.error,
    borderWidth: borderWidth.normal,
    backgroundColor: colors.errorLight,
  },

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.errorLight,
    borderWidth: borderWidth.thin,
    borderColor: colors.error,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
  },

  ctaPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  ctaPrimaryText: { ...typography.button, color: colors.textInverse },

  resendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendLabel: { ...typography.bodySmall, color: colors.textMuted },
  resendDisabled: { paddingVertical: 4 },
  resendDisabledText: { ...typography.bodySmall, color: colors.textLight },

  resendActive: { paddingVertical: 4 },
  resendActiveText: { ...typography.bodyMedium, color: colors.text, textDecorationLine: 'underline' },

  changeEmailLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  changeEmailText: { ...typography.caption, color: colors.textMuted, textDecorationLine: 'underline' },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.successLight,
    borderWidth: borderWidth.thin,
    borderColor: colors.success,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: '100%',
  },
  successBannerText: { ...typography.bodyMedium, color: colors.success },
});
