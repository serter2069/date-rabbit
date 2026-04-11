import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
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
          <Feather name={"x" as any} size={64} color={colors.error} />
        </View>
        <Text style={s.heroTitle}>Request Declined</Text>
      </View>

      <Text style={s.declinedMessage}>
        Jessica Martinez is unavailable for this time slot.
      </Text>

      <View style={[s.card, shadows.sm]}>
        <Text style={s.suggestTitle}>What you can do</Text>
        <Text style={s.suggestText}>Try a different time or browse other companions</Text>
      </View>

      <Pressable style={[s.primaryBtn, shadows.button]} onPress={() => router.push('/proto/states/booking-detail' as any)}>
        <Text style={s.primaryBtnText}>TRY AGAIN</Text>
      </Pressable>

      <Pressable style={[s.ghostBtn, shadows.sm]} onPress={() => router.push('/proto/states/seeker-home' as any)}>
        <Text style={s.ghostBtnText}>Browse Companions</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function BookingDeclinedStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Booking request declined">
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

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16 },

  heroCenter: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.errorLight,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { ...typography.h2, color: colors.text },

  declinedMessage: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 6,
  },
  suggestTitle: { ...typography.h3, color: colors.text },
  suggestText: { ...typography.bodySmall, color: colors.textMuted },

  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  primaryBtnText: { ...typography.button, color: colors.textInverse },

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
});
