import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  return (
    <View style={s.page}>
      <View style={s.heroCenter}>
        <View style={s.iconWrap}>
          <Feather name={"clock" as any} size={64} color={colors.warning} />
        </View>
        <Text style={s.heroTitle}>Request Sent!</Text>
      </View>

      <View style={[s.card, shadows.sm]}>
        <View style={s.companionRow}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-request/64/64' }} style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.companionInfo}>
            <Text style={s.companionName}>Jessica Martinez</Text>
            <View style={s.metaRow}>
              <Feather name={"calendar" as any} size={13} color={colors.textMuted} />
              <Text style={s.metaText}>Tomorrow, Saturday Apr 12</Text>
            </View>
            <View style={s.metaRow}>
              <Feather name={"clock" as any} size={13} color={colors.textMuted} />
              <Text style={s.metaText}>8:00 PM - 3 hours</Text>
            </View>
            <View style={s.metaRow}>
              <Feather name={"map-pin" as any} size={13} color={colors.textMuted} />
              <Text style={s.metaText}>Le Bernardin, NYC</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={[s.infoBanner, shadows.sm]}>
        <Text style={s.infoText}>
          Waiting for confirmation. You'll be notified within 1 hour.
        </Text>
      </View>

      <Text style={s.whatNext}>
        You will receive a notification when Jessica accepts your request.
      </Text>

      <Pressable style={[s.ghostBtn, shadows.sm]} onPress={() => router.push('/proto/states/seeker-bookings' as any)}>
        <Text style={s.ghostBtnText}>View Booking</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/proto/states/seeker-home' as any)}>
        <Text style={s.linkText}>Browse More</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function BookingRequestSentStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Request sent confirmation">
        <DefaultState />
      </StateSection>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16, alignItems: 'stretch' },

  heroCenter: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.warningLight,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { ...typography.h2, color: colors.text },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
  },

  companionRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  companionInfo: { flex: 1, gap: 4 },
  companionName: { ...typography.h3, color: colors.text, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { ...typography.caption, color: colors.textMuted },

  infoBanner: {
    backgroundColor: colors.warningLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  infoText: { ...typography.bodySmall, color: colors.textSecondary, textAlign: 'center' },

  whatNext: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },

  ghostBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  ghostBtnText: { ...typography.button, color: colors.text },

  linkText: { ...typography.bodyMedium, color: colors.primary, textAlign: 'center' },
});
