import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — Email input form
// ===========================================================================
function DefaultState() {
  const [email, setEmail] = useState('jessica@email.com');

  return (
    <View style={s.page}>
      <Pressable style={[s.backBtn, shadows.sm]}>
        <Feather name="arrow-left" size={20} color={colors.text} />
      </Pressable>

      <Text style={s.title}>Sign in</Text>
      <Text style={s.subtitle}>Enter your email to sign in or create an account</Text>

      <View style={s.form}>
        <Text style={s.label}>Email</Text>
        <View style={s.inputWrap}>
          <Feather name="mail" size={18} color={colors.textLight} />
          <TextInput
            style={s.input}
            placeholder="email@example.com"
            placeholderTextColor={colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-otp')}>
        <Text style={s.ctaPrimaryText}>SEND OTP CODE</Text>
      </Pressable>

      <View style={s.divider}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>or</Text>
        <View style={s.dividerLine} />
      </View>

      <Pressable style={[s.ctaGhost, shadows.sm]}>
        <Feather name="external-link" size={18} color={colors.text} />
        <Text style={s.ctaGhostText}>CONTINUE WITH GOOGLE</Text>
      </Pressable>

      <Text style={s.termsNote}>By continuing, you agree to our Terms of Service and Privacy Policy</Text>
    </View>
  );
}

// ===========================================================================
// STATE 2: VALIDATION_ERROR — Invalid email highlighted
// ===========================================================================
function ValidationErrorState() {
  const [email, setEmail] = useState('jessica@email');

  return (
    <View style={s.page}>
      <Pressable style={[s.backBtn, shadows.sm]}>
        <Feather name="arrow-left" size={20} color={colors.text} />
      </Pressable>

      <Text style={s.title}>Sign in</Text>
      <Text style={s.subtitle}>Enter your email to sign in or create an account</Text>

      <View style={s.form}>
        <Text style={s.label}>Email</Text>
        <View style={[s.inputWrap, s.inputError]}>
          <Feather name="mail" size={18} color={colors.error} />
          <TextInput
            style={s.input}
            placeholder="email@example.com"
            placeholderTextColor={colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
        <Text style={s.errorText}>Please enter a valid email address</Text>
      </View>

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-otp')}>
        <Text style={s.ctaPrimaryText}>SEND OTP CODE</Text>
      </Pressable>

      <View style={s.divider}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>or</Text>
        <View style={s.dividerLine} />
      </View>

      <Pressable style={[s.ctaGhost, shadows.sm]}>
        <Feather name="external-link" size={18} color={colors.text} />
        <Text style={s.ctaGhostText}>CONTINUE WITH GOOGLE</Text>
      </Pressable>

      <Text style={s.termsNote}>By continuing, you agree to our Terms of Service and Privacy Policy</Text>
    </View>
  );
}

// ===========================================================================
// STATE 3: LOADING — Sending OTP in progress
// ===========================================================================
function LoadingState() {
  const [email, setEmail] = useState('jessica@email.com');

  return (
    <View style={s.page}>
      <Pressable style={[s.backBtn, shadows.sm]}>
        <Feather name="arrow-left" size={20} color={colors.text} />
      </Pressable>

      <Text style={s.title}>Sign in</Text>
      <Text style={s.subtitle}>Enter your email to sign in or create an account</Text>

      <View style={s.form}>
        <Text style={s.label}>Email</Text>
        <View style={s.inputWrap}>
          <Feather name="mail" size={18} color={colors.textLight} />
          <TextInput
            style={s.input}
            placeholder="email@example.com"
            placeholderTextColor={colors.textLight}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={false}
          />
        </View>
      </View>

      <Pressable style={[s.ctaPrimaryDisabled, shadows.button]} disabled>
        <ActivityIndicator size="small" color={colors.textInverse} />
        <Text style={s.ctaPrimaryText}>SENDING...</Text>
      </Pressable>

      <View style={s.divider}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>or</Text>
        <View style={s.dividerLine} />
      </View>

      <Pressable style={[s.ctaGhost, shadows.sm, { opacity: 0.5 }]} disabled>
        <Feather name="external-link" size={18} color={colors.text} />
        <Text style={s.ctaGhostText}>CONTINUE WITH GOOGLE</Text>
      </Pressable>

      <Text style={s.termsNote}>By continuing, you agree to our Terms of Service and Privacy Policy</Text>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function AuthLoginStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Email input form with Google option">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="VALIDATION_ERROR" description="Invalid email, field highlighted red">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <ValidationErrorState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="LOADING" description="Sending OTP code, button shows spinner">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <LoadingState />
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
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: -8 },

  form: { gap: 6 },
  label: { ...typography.caption, color: colors.text, textTransform: 'uppercase', letterSpacing: 1 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: borderWidth.normal,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.error,
    marginTop: 2,
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
  },
  ctaPrimaryDisabled: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ctaPrimaryText: { ...typography.button, color: colors.textInverse },

  ctaGhost: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ctaGhostText: { ...typography.button, color: colors.text },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.divider },
  dividerText: { ...typography.caption, color: colors.textLight },

  termsNote: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
});
