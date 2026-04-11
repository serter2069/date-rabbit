import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

const CODE_LENGTH = 6;

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
      <Pressable style={[s.backBtn, shadows.sm]}>
        <Feather name="arrow-left" size={20} color={colors.text} />
      </Pressable>

      <Text style={s.title}>Check your email</Text>
      <Text style={s.subtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={s.emailHighlight}>jessica@email.com</Text>
      </Text>

      <OtpBoxes digits={digits} onChangeDigit={handleChange} />

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-role-select')}>
        <Text style={s.ctaPrimaryText}>VERIFY CODE</Text>
      </Pressable>

      <Pressable style={s.resendDisabled} disabled>
        <Text style={s.resendDisabledText}>Resend code</Text>
      </Pressable>

      <Pressable style={s.backLink}>
        <Text style={s.backLinkText}>Back</Text>
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
      <Pressable style={[s.backBtn, shadows.sm]}>
        <Feather name="arrow-left" size={20} color={colors.text} />
      </Pressable>

      <Text style={s.title}>Check your email</Text>
      <Text style={s.subtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={s.emailHighlight}>jessica@email.com</Text>
      </Text>

      <OtpBoxes digits={digits} onChangeDigit={handleChange} hasError />
      <Text style={s.errorText}>Invalid code. Try again.</Text>

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-role-select')}>
        <Text style={s.ctaPrimaryText}>VERIFY CODE</Text>
      </Pressable>

      <Pressable style={s.resendActive}>
        <Text style={s.resendActiveText}>Resend code</Text>
      </Pressable>

      <Pressable style={s.backLink}>
        <Text style={s.backLinkText}>Back</Text>
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
      <Pressable style={[s.backBtn, shadows.sm]}>
        <Feather name="arrow-left" size={20} color={colors.text} />
      </Pressable>

      <View style={s.successBanner}>
        <Feather name="check-circle" size={16} color={colors.success} />
        <Text style={s.successBannerText}>New code sent!</Text>
      </View>

      <Text style={s.title}>Check your email</Text>
      <Text style={s.subtitle}>
        We sent a 6-digit code to{'\n'}
        <Text style={s.emailHighlight}>jessica@email.com</Text>
      </Text>

      <OtpBoxes digits={digits} onChangeDigit={handleChange} />

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-role-select')}>
        <Text style={s.ctaPrimaryText}>VERIFY CODE</Text>
      </Pressable>

      <Pressable style={s.resendDisabled} disabled>
        <Text style={s.resendDisabledText}>Resend in 59s</Text>
      </Pressable>

      <Pressable style={s.backLink}>
        <Text style={s.backLinkText}>Back</Text>
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
      <StateSection title="DEFAULT" description="Fresh OTP entry, resend disabled">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="ERROR" description="Invalid code, boxes red, resend active">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <ErrorState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="RESEND_SENT" description="Success banner, timer countdown">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <ResendSentState />
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
  page: { gap: 16, paddingHorizontal: 20, paddingVertical: 24 },

  backBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },

  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, lineHeight: 24 },
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

  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    textAlign: 'center',
    marginTop: -8,
  },

  ctaPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryText: { ...typography.button, color: colors.textInverse },

  resendDisabled: { alignSelf: 'center', paddingVertical: 8 },
  resendDisabledText: { ...typography.bodySmall, color: colors.textLight },

  resendActive: { alignSelf: 'center', paddingVertical: 8 },
  resendActiveText: { ...typography.bodyMedium, color: colors.text, textDecorationLine: 'underline' },

  backLink: { alignSelf: 'center', paddingVertical: 8 },
  backLinkText: { ...typography.bodyMedium, color: colors.textMuted, textDecorationLine: 'underline' },

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
  },
  successBannerText: { ...typography.bodyMedium, color: colors.success },
});
