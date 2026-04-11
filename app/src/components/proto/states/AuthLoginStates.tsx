import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, StyleSheet, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader } from '../NavComponents';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// PageShell — full-screen wrapper with header
// ===========================================================================
function PageShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;
  return (
    <View style={s.shell}>
      <ProtoHeader variant="back" onBack={() => router.push('/proto/states/auth-welcome')} />
      <View style={[s.shellContent, isDesktop && s.shellDesktop]}>
        {children}
      </View>
    </View>
  );
}

// ===========================================================================
// EmailForm — reusable across states
// ===========================================================================
function EmailForm({ email, setEmail, error, loading }: { email: string; setEmail: (v: string) => void; error?: boolean; loading?: boolean }) {
  return (
    <View style={s.form}>
      <Text style={s.label}>EMAIL ADDRESS</Text>
      <View style={[s.inputWrap, error && s.inputError]}>
        <Feather name="mail" size={18} color={error ? colors.error : colors.textLight} />
        <TextInput
          style={s.input}
          placeholder="email@example.com"
          placeholderTextColor={colors.textLight}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading}
        />
        {email.length > 0 && !loading && (
          <Pressable onPress={() => setEmail('')} hitSlop={8}>
            <Feather name="x" size={16} color={colors.textLight} />
          </Pressable>
        )}
      </View>
      {error && (
        <View style={s.errorRow}>
          <Feather name="alert-circle" size={14} color={colors.error} />
          <Text style={s.errorText}>Please enter a valid email address</Text>
        </View>
      )}
    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Email input form
// ===========================================================================
function DefaultState() {
  const [email, setEmail] = useState('jessica@email.com');

  return (
    <View style={s.page}>
      <Text style={s.title}>Sign in</Text>
      <Text style={s.subtitle}>Enter your email to sign in or create an account</Text>

      <EmailForm email={email} setEmail={setEmail} />

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-otp')}>
        <Text style={s.ctaPrimaryText}>SEND OTP CODE</Text>
        <Feather name="arrow-right" size={16} color={colors.textInverse} />
      </Pressable>

      <View style={s.divider}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>or</Text>
        <View style={s.dividerLine} />
      </View>

      <Pressable style={[s.ctaGhost, shadows.sm]} onPress={() => {}}>
        <Feather name="external-link" size={18} color={colors.text} />
        <Text style={s.ctaGhostText}>CONTINUE WITH GOOGLE</Text>
      </Pressable>

      <Text style={s.termsNote}>By continuing, you agree to our{'\n'}<Text style={s.termsLink}>Terms of Service</Text> and <Text style={s.termsLink}>Privacy Policy</Text></Text>

      <View style={s.securityNote}>
        <Feather name="lock" size={14} color={colors.success} />
        <Text style={s.securityText}>We'll send a verification code to your email</Text>
      </View>
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
      <Text style={s.title}>Sign in</Text>
      <Text style={s.subtitle}>Enter your email to sign in or create an account</Text>

      <EmailForm email={email} setEmail={setEmail} error />

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-otp')}>
        <Text style={s.ctaPrimaryText}>SEND OTP CODE</Text>
        <Feather name="arrow-right" size={16} color={colors.textInverse} />
      </Pressable>

      <View style={s.divider}>
        <View style={s.dividerLine} />
        <Text style={s.dividerText}>or</Text>
        <View style={s.dividerLine} />
      </View>

      <Pressable style={[s.ctaGhost, shadows.sm]} onPress={() => {}}>
        <Feather name="external-link" size={18} color={colors.text} />
        <Text style={s.ctaGhostText}>CONTINUE WITH GOOGLE</Text>
      </Pressable>

      <Text style={s.termsNote}>By continuing, you agree to our{'\n'}<Text style={s.termsLink}>Terms of Service</Text> and <Text style={s.termsLink}>Privacy Policy</Text></Text>
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
      <Text style={s.title}>Sign in</Text>
      <Text style={s.subtitle}>Enter your email to sign in or create an account</Text>

      <EmailForm email={email} setEmail={setEmail} loading />

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

      <Text style={s.termsNote}>By continuing, you agree to our{'\n'}<Text style={s.termsLink}>Terms of Service</Text> and <Text style={s.termsLink}>Privacy Policy</Text></Text>
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
        <PageShell>
          <DefaultState />
        </PageShell>
      </StateSection>
      <StateSection title="VALIDATION_ERROR" description="Invalid email, field highlighted red">
        <PageShell>
          <ValidationErrorState />
        </PageShell>
      </StateSection>
      <StateSection title="LOADING" description="Sending OTP code, button shows spinner">
        <PageShell>
          <LoadingState />
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
  page: { gap: 16, paddingVertical: 16 },

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
    backgroundColor: colors.errorLight,
  },
  input: {
    ...typography.body,
    flex: 1,
    color: colors.text,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
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
  termsLink: {
    textDecorationLine: 'underline',
    color: colors.text,
  },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successLight,
    borderWidth: borderWidth.thin,
    borderColor: colors.success,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  securityText: {
    ...typography.caption,
    color: colors.success,
  },
});
