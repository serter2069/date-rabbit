import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader } from '../NavComponents';
import { colors, typography, borderRadius, borderWidth, shadows, spacing } from '../../../constants/theme';

// ===========================================================================
// PageShell — full-page wrapper with header
// ===========================================================================
function PageShell({ children }: { children: React.ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="auth" title="Verification" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, maxWidth: 520, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Full intro screen
// ===========================================================================
function DefaultState() {
  return (
    <PageShell>
      <View style={s.page}>
        {/* Shield icon */}
        <View style={s.iconContainer}>
          <View style={s.iconCircle}>
            <Feather name="shield" size={48} color={colors.primary} />
          </View>
        </View>

        {/* Headline */}
        <Text style={s.headline}>Verify Your Identity</Text>
        <Text style={s.body}>
          DateRabbit requires all seekers to complete identity verification via
          Stripe Identity. This keeps everyone safe.
        </Text>

        {/* Steps list */}
        <View style={[s.card, shadows.md]}>
          {[
            { num: '1', icon: 'credit-card', label: 'Government ID scan', desc: 'Driver\'s license, passport, or state ID' },
            { num: '2', icon: 'camera', label: 'Selfie photo', desc: 'Liveness check matches your ID photo' },
            { num: '3', icon: 'check-square', label: 'Consent form', desc: 'Agree to identity verification terms' },
          ].map((step) => (
            <View key={step.num} style={s.stepRow}>
              <View style={s.stepBadge}>
                <Text style={s.stepBadgeText}>{step.num}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={s.stepLabelRow}>
                  <Feather name={step.icon as any} size={16} color={colors.primary} />
                  <Text style={s.stepLabel}>{step.label}</Text>
                </View>
                <Text style={s.stepDesc}>{step.desc}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Requirements */}
        <View style={s.reqCard}>
          <Text style={s.reqTitle}>Requirements</Text>
          <View style={s.reqRow}>
            <Feather name="user" size={14} color={colors.textMuted} />
            <Text style={s.reqText}>Must be 21 years or older</Text>
          </View>
          <View style={s.reqRow}>
            <Feather name="smartphone" size={14} color={colors.textMuted} />
            <Text style={s.reqText}>Camera required for selfie</Text>
          </View>
          <View style={s.reqRow}>
            <Feather name="clock" size={14} color={colors.textMuted} />
            <Text style={s.reqText}>Takes about 3 minutes</Text>
          </View>
        </View>

        {/* Trust note */}
        <View style={s.trustNote}>
          <Feather name="lock" size={14} color={colors.textMuted} />
          <Text style={s.trustNoteText}>
            Your data is encrypted and never shared with companions. We only verify your age and identity.
          </Text>
        </View>

        {/* CTA */}
        <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/verify-photo-id' as any)}>
          <Feather name="shield" size={18} color={colors.textInverse} />
          <Text style={s.ctaPrimaryText}>START VERIFICATION</Text>
        </Pressable>

        <Pressable style={s.ghostLink}>
          <Text style={s.ghostLinkText}>Learn more about identity verification</Text>
        </Pressable>
      </View>
    </PageShell>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function VerifyIntroStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Full intro screen for identity verification with requirements">
        <DefaultState />
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16, alignItems: 'center', paddingVertical: 24 },

  iconContainer: {
    marginTop: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.badge.pink.bg,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headline: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 22,
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
    width: '100%',
    gap: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700',
  },
  stepLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  stepLabel: {
    ...typography.bodyMedium,
    color: colors.text,
  },
  stepDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },

  reqCard: {
    backgroundColor: colors.backgroundWarm,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 16,
    width: '100%',
    gap: 8,
  },
  reqTitle: { ...typography.caption, color: colors.text, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  reqRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  reqText: { ...typography.bodySmall, color: colors.textSecondary },

  trustNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  trustNoteText: {
    ...typography.caption,
    color: colors.textMuted,
    flex: 1,
  },

  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    width: '100%',
  },
  ctaPrimaryText: {
    ...typography.button,
    color: colors.textInverse,
  },

  ghostLink: {
    paddingVertical: 8,
  },
  ghostLinkText: {
    ...typography.bodySmall,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
