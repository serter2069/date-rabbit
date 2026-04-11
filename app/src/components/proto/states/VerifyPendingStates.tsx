import React from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — Verification in progress
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      {/* Clock icon */}
      <View style={s.iconContainer}>
        <Feather name="clock" size={64} color={colors.warning} />
      </View>

      <Text style={s.headline}>Verification In Progress</Text>
      <Text style={s.body}>
        We are reviewing your submission. This usually takes 1-5 minutes.
      </Text>

      {/* Spinner */}
      <ActivityIndicator size="large" color={colors.primary} />

      {/* Status card */}
      <View style={[s.statusCard, shadows.sm]}>
        <Text style={s.statusLabel}>SUBMITTED</Text>
        <Text style={s.statusValue}>just now</Text>
      </View>

      {/* Tips */}
      <Text style={s.tip}>
        You can close this screen — we will notify you when ready.
      </Text>

      {/* Actions */}
      <Pressable style={[s.ghostButton, shadows.sm]} onPress={() => router.push('/proto/states/verify-approved' as any)}>
        <Text style={s.ghostButtonText}>GO TO DASHBOARD</Text>
      </Pressable>

      <Pressable style={s.linkButton} onPress={() => router.push('/proto/states/verify-approved' as any)}>
        <Text style={s.linkButtonText}>Check Status</Text>
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
      <StateSection title="DEFAULT" description="Verification pending / in review">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
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
  page: { gap: 16, alignItems: 'center' },

  iconContainer: {
    marginTop: 24,
    marginBottom: 8,
  },

  headline: {
    ...typography.h2,
    color: colors.text,
    textAlign: 'center',
  },
  body: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  statusCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  statusLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  statusValue: {
    ...typography.bodyMedium,
    color: colors.text,
  },

  tip: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textAlign: 'center',
    paddingHorizontal: 16,
  },

  ghostButton: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
