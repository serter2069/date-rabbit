import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — First-time visitor welcome
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      <View style={s.logoArea}>
        <Image source={{ uri: 'https://picsum.photos/seed/daterabbit-logo-art/120/120' }} style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#000' }} />
      </View>

      <Text style={s.headline}>Find Your{'\n'}Perfect Date</Text>
      <Text style={s.subtext}>Verified companions, real experiences</Text>

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-login')}>
        <Text style={s.ctaPrimaryText}>GET STARTED</Text>
        <Feather name="arrow-right" size={18} color={colors.textInverse} />
      </Pressable>

      <Pressable style={s.linkButton} onPress={() => router.push('/proto/states/auth-login')}>
        <Text style={s.linkText}>I have an account</Text>
      </Pressable>

      <View style={[s.badge21, shadows.sm]}>
        <Feather name="shield" size={14} color={colors.text} />
        <Text style={s.badge21Text}>21+ ONLY</Text>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 2: RETURNING — Returning user variant
// ===========================================================================
function ReturningState() {
  return (
    <View style={s.page}>
      <View style={s.logoArea}>
        <Image source={{ uri: 'https://picsum.photos/seed/daterabbit-logo-art/120/120' }} style={{ width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#000' }} />
      </View>

      <Text style={s.headline}>Welcome{'\n'}Back</Text>
      <Text style={s.subtext}>Pick up where you left off</Text>

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-login')}>
        <Text style={s.ctaPrimaryText}>CONTINUE</Text>
        <Feather name="arrow-right" size={18} color={colors.textInverse} />
      </Pressable>

      <Pressable style={s.linkButton} onPress={() => router.push('/proto/states/auth-login')}>
        <Text style={s.linkText}>Use a different account</Text>
      </Pressable>

      <View style={[s.badge21, shadows.sm]}>
        <Feather name="shield" size={14} color={colors.text} />
        <Text style={s.badge21Text}>21+ ONLY</Text>
      </View>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function AuthWelcomeStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="First-time visitor welcome screen">
        <DefaultState />
      </StateSection>
      <StateSection title="RETURNING" description="Welcome back variant for returning users">
        <ReturningState />
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16, alignItems: 'center', paddingHorizontal: 20, paddingVertical: 32 },

  logoArea: { marginBottom: 8 },

  headline: {
    ...typography.display,
    color: colors.text,
    textAlign: 'center',
  },
  subtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 8,
  },

  ctaPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
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

  linkButton: { paddingVertical: 12 },
  linkText: {
    ...typography.bodyMedium,
    color: colors.text,
    textDecorationLine: 'underline',
  },

  badge21: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 8,
  },
  badge21Text: { ...typography.label, color: colors.text, fontSize: 11 },
});
