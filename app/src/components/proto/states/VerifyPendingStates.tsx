import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, ScrollView, useWindowDimensions, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader } from '../NavComponents';
import { colors, typography, borderRadius, borderWidth, shadows, spacing } from '../../../constants/theme';

// ===========================================================================
// PageShell
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
// STATE 1: DEFAULT — Verification in progress
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      {/* Animated clock area */}
      <View style={s.iconArea}>
        <View style={[s.iconCircle, shadows.md]}>
          <Feather name="clock" size={56} color={colors.warning} />
        </View>
      </View>

      <Text style={s.headline}>Verification In Progress</Text>
      <Text style={s.body}>
        We are reviewing your submission. This usually takes 1-5 minutes for Stripe Identity checks.
      </Text>

      {/* Spinner */}
      <View style={s.spinnerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={s.spinnerText}>Processing...</Text>
      </View>

      {/* Status card with steps */}
      <View style={[s.statusCard, shadows.sm]}>
        <Text style={s.statusCardTitle}>VERIFICATION STEPS</Text>
        {[
          { icon: 'check-circle', label: 'Government ID uploaded', done: true },
          { icon: 'check-circle', label: 'Selfie captured', done: true },
          { icon: 'check-circle', label: 'Consent submitted', done: true },
          { icon: 'loader', label: 'Stripe Identity review', done: false },
        ].map((step, i) => (
          <View key={i} style={s.statusStep}>
            <Feather name={step.icon as any} size={16} color={step.done ? colors.success : colors.warning} />
            <Text style={[s.statusStepText, !step.done && s.statusStepPending]}>{step.label}</Text>
          </View>
        ))}
      </View>

      {/* Timeline card */}
      <View style={s.timelineCard}>
        <Text style={s.timelineTitle}>What happens next</Text>
        <View style={s.timelineRow}>
          <Feather name="mail" size={14} color={colors.primary} />
          <Text style={s.timelineText}>You'll receive an email confirmation</Text>
        </View>
        <View style={s.timelineRow}>
          <Feather name="shield" size={14} color={colors.success} />
          <Text style={s.timelineText}>Stripe verifies your age (21+) and identity</Text>
        </View>
        <View style={s.timelineRow}>
          <Feather name="home" size={14} color={colors.accent} />
          <Text style={s.timelineText}>Full access to browse companions</Text>
        </View>
      </View>

      {/* Tip */}
      <View style={s.tipCard}>
        <Feather name="info" size={14} color={colors.info} />
        <Text style={s.tip}>
          You can close this screen — we will notify you via email when verification is complete.
        </Text>
      </View>

      {/* Actions */}
      <Pressable style={[s.ghostButton, shadows.button]} onPress={() => router.push('/proto/states/verify-approved' as any)}>
        <Feather name="arrow-right" size={16} color={colors.text} />
        <Text style={s.ghostButtonText}>GO TO DASHBOARD</Text>
      </Pressable>

      <Pressable style={s.linkButton} onPress={() => router.push('/proto/states/verify-approved' as any)}>
        <Text style={s.linkButtonText}>Refresh Status</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function VerifyPendingStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Verification pending / in review with status steps">
        <PageShell><DefaultState /></PageShell>
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

  iconArea: { marginTop: 16, marginBottom: 8 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.warningLight,
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

  spinnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spinnerText: { ...typography.caption, color: colors.textMuted },

  statusCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    width: '100%',
    gap: 10,
  },
  statusCardTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: 4,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusStepText: { ...typography.bodySmall, color: colors.text },
  statusStepPending: { color: colors.warning, fontWeight: '600' },

  timelineCard: {
    backgroundColor: colors.backgroundWarm,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 14,
    width: '100%',
    gap: 8,
  },
  timelineTitle: { ...typography.caption, color: colors.text, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  timelineText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },

  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.infoLight,
    borderWidth: borderWidth.thin,
    borderColor: colors.info,
    borderRadius: borderRadius.sm,
    padding: 12,
    width: '100%',
  },
  tip: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 20,
  },

  ghostButton: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  ghostButtonText: {
    ...typography.button,
    color: colors.text,
  },

  linkButton: {
    paddingVertical: 8,
  },
  linkButtonText: {
    ...typography.bodySmall,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
