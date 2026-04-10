import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, borderWidth, shadows, spacing } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — Full intro screen
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      {/* Shield icon */}
      <View style={s.iconContainer}>
        <Feather name="shield" size={80} color={colors.primary} />
      </View>

      {/* Headline */}
      <Text style={s.headline}>Verify Your Identity</Text>
      <Text style={s.body}>
        DateRabbit requires all seekers to complete identity verification via
        Stripe Identity. This keeps everyone safe.
      </Text>

      {/* Steps list */}
      <View style={[s.card, shadows.sm]}>
        {[
          { num: '1', label: 'Government ID scan' },
          { num: '2', label: 'Selfie photo' },
          { num: '3', label: 'Consent form' },
        ].map((step) => (
          <View key={step.num} style={s.stepRow}>
            <View style={s.stepBadge}>
              <Text style={s.stepBadgeText}>{step.num}</Text>
            </View>
            <Text style={s.stepLabel}>{step.label}</Text>
          </View>
        ))}
      </View>

      {/* Time estimate */}
      <Text style={s.timeEstimate}>Takes about 3 minutes</Text>

      {/* Trust note */}
      <View style={s.trustNote}>
        <Feather name="lock" size={14} color={colors.textMuted} />
        <Text style={s.trustNoteText}>
          Your data is encrypted and never shared with companions
        </Text>
      </View>

      {/* CTA */}
      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/verify-photo-id' as any)}>
        <Text style={s.ctaPrimaryText}>START VERIFICATION</Text>
      </Pressable>

      <Pressable style={s.ghostLink}>
        <Text style={s.ghostLinkText}>Learn more</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function VerifyIntroStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Full intro screen for identity verification">
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
  page: { gap: 16, alignItems: 'center' },

  iconContainer: {
    marginTop: 24,
    marginBottom: 8,
    alignItems: 'center',
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
  },

  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
    width: '100%',
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700',
  },
  stepLabel: {
    ...typography.bodyMedium,
    color: colors.text,
  },

  timeEstimate: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
  },

  trustNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
  },
  trustNoteText: {
    ...typography.caption,
    color: colors.textMuted,
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
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
