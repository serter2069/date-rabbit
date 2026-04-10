import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — Profile under review
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      {/* Icon + heading */}
      <View style={s.header}>
        <View style={[s.iconCircle, shadows.md]}>
          <Feather name={"clock" as any} size={36} color={colors.text} />
        </View>
        <Text style={s.heading}>Your Profile is Under Review</Text>
        <Text style={s.sub}>
          Our team reviews all companion profiles within 24 hours.
        </Text>
      </View>

      {/* Status card */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>Submission Status</Text>
        <Text style={s.timestamp}>Submitted: April 9, 2026 at 2:34 PM</Text>

        <View style={s.checklistGroup}>
          {[
            { label: 'Profile', status: 'Complete' },
            { label: 'Photos 4/4', status: 'Complete' },
            { label: 'Verification submitted', status: 'Complete' },
          ].map(item => (
            <View key={item.label} style={s.checkRow}>
              <Feather name={"check-circle" as any} size={16} color={colors.success} />
              <Text style={s.checkLabel}>{item.label}</Text>
              <View style={s.checkBadge}>
                <Text style={s.checkBadgeText}>{item.status}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Tips card */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.tipRow}>
          <Feather name={"bell" as any} size={18} color={colors.accent} />
          <Text style={s.tipText}>
            While you wait: Make sure your notification settings are on
          </Text>
        </View>
      </View>

      {/* Actions */}
      <Pressable style={[s.btnGhost, shadows.sm]} onPress={() => router.push('/proto/states/comp-onboard-step2' as any)}>
        <Text style={s.btnGhostText}>EDIT PROFILE</Text>
      </Pressable>

      <Pressable style={s.linkBtn} onPress={() => router.push('/proto/states/comp-onboard-approved' as any)}>
        <Text style={s.linkBtnText}>Contact Support</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function CompOnboardPendingStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Companion profile under review, awaiting approval">
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
  page: { gap: 16, width: '100%' },

  // Header
  header: { alignItems: 'center', gap: 8 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: colors.warningLight,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heading: { ...typography.h2, color: colors.text, textAlign: 'center' },
  sub: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 8 },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
  },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: 4 },
  timestamp: { ...typography.caption, color: colors.textMuted, marginBottom: 12 },

  // Checklist
  checklistGroup: { gap: 10 },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkLabel: { ...typography.bodySmall, color: colors.text, flex: 1 },
  checkBadge: {
    backgroundColor: colors.successLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  checkBadgeText: { ...typography.caption, color: colors.success, fontSize: 10 },

  // Tip
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tipText: { ...typography.bodySmall, color: colors.text, flex: 1 },

  // Buttons
  btnGhost: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnGhostText: { ...typography.button, color: colors.text },

  linkBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  linkBtnText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
