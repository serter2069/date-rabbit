import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader } from '../NavComponents';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// PageShell — full-screen wrapper with header for auth pages
// ===========================================================================
function PageShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;
  return (
    <View style={s.shell}>
      <ProtoHeader variant="auth" onLogoPress={() => router.push('/proto')} />
      <View style={[s.shellContent, isDesktop && s.shellDesktop]}>
        {children}
      </View>
    </View>
  );
}

// ===========================================================================
// TrustBadges — shared trust indicators
// ===========================================================================
function TrustBadges() {
  return (
    <View style={s.trustRow}>
      <View style={[s.trustItem, shadows.sm]}>
        <Feather name="shield" size={14} color={colors.primary} />
        <Text style={s.trustText}>ID Verified</Text>
      </View>
      <View style={[s.trustItem, shadows.sm]}>
        <Feather name="lock" size={14} color={colors.primary} />
        <Text style={s.trustText}>Secure</Text>
      </View>
      <View style={[s.trustItem, shadows.sm]}>
        <Feather name="dollar-sign" size={14} color={colors.primary} />
        <Text style={s.trustText}>Refund</Text>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — First-time visitor welcome
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      <View style={s.logoArea}>
        <Image source={{ uri: 'https://picsum.photos/seed/daterabbit-logo-art/120/120' }} style={s.logoImage} />
      </View>

      <Text style={s.headline}>Find Your{'\n'}Perfect Date</Text>
      <Text style={s.subtext}>Verified companions, real experiences.{'\n'}Book real offline dates in minutes.</Text>

      <TrustBadges />

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-login')}>
        <Text style={s.ctaPrimaryText}>GET STARTED</Text>
        <Feather name="arrow-right" size={18} color={colors.textInverse} />
      </Pressable>

      <Pressable style={s.linkButton} onPress={() => router.push('/proto/states/auth-login')}>
        <Text style={s.linkText}>I already have an account</Text>
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
        <Image source={{ uri: 'https://picsum.photos/seed/daterabbit-logo-art/120/120' }} style={s.logoImage} />
      </View>

      <Text style={s.headline}>Welcome{'\n'}Back</Text>
      <Text style={s.subtext}>Pick up where you left off.</Text>

      <View style={[s.recentAccount, shadows.sm]}>
        <Image source={{ uri: 'https://picsum.photos/seed/user-recent/40/40' }} style={s.recentAvatar} />
        <View style={s.recentInfo}>
          <Text style={s.recentEmail}>jessica@email.com</Text>
          <Text style={s.recentLabel}>Last used account</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.textMuted} />
      </View>

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
        <PageShell>
          <DefaultState />
        </PageShell>
      </StateSection>
      <StateSection title="RETURNING" description="Welcome back variant for returning users">
        <PageShell>
          <ReturningState />
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
  page: {
    gap: 16,
    alignItems: 'center',
    paddingVertical: 16,
  },

  logoArea: { marginBottom: 8 },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
  },

  headline: {
    ...typography.display,
    color: colors.text,
    textAlign: 'center',
  },
  subtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 22,
  },

  trustRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  trustText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
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

  recentAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    width: '100%',
  },
  recentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  recentInfo: { flex: 1 },
  recentEmail: { ...typography.bodyMedium, color: colors.text },
  recentLabel: { ...typography.caption, color: colors.textMuted },
});
