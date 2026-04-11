import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — Connect bank account
// ===========================================================================
function DefaultState() {
  const benefits = [
    { icon: 'zap', text: 'Same-day payouts' },
    { icon: 'shield', text: 'Bank-level security' },
    { icon: 'bar-chart-2', text: 'Track all earnings' },
    { icon: 'file-text', text: 'Tax documents included' },
  ];

  return (
    <View style={s.page}>
      <View style={[s.card, shadows.md, { alignItems: 'center' as const }]}>
        <View style={s.iconCircle}>
          <Feather name={"dollar-sign" as any} size={32} color={colors.primary} />
        </View>
        <Text style={s.heading}>Connect Your Bank Account</Text>
        <Text style={s.description}>
          Connect via Stripe Connect to receive secure, fast payouts after each date.
        </Text>

        {/* Benefits */}
        <View style={s.benefitsList}>
          {benefits.map(b => (
            <View key={b.text} style={s.benefitRow}>
              <View style={s.benefitIcon}>
                <Feather name={b.icon as any} size={16} color={colors.primary} />
              </View>
              <Text style={s.benefitText}>{b.text}</Text>
            </View>
          ))}
        </View>

        <Pressable style={[s.btnPrimary, shadows.button, { width: '100%' }]}>
          <Text style={s.btnPrimaryText}>CONNECT WITH STRIPE</Text>
        </Pressable>

        <Text style={s.note}>
          You will be redirected to Stripe to complete setup securely.
        </Text>

        {/* Stripe logo placeholder */}
        <View style={[s.stripeLogo, shadows.sm]}>
          <Text style={s.stripeLogoText}>Stripe Connect</Text>
        </View>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 2: CONNECTED — Bank connected success
// ===========================================================================
function ConnectedState() {
  return (
    <View style={s.page}>
      <View style={[s.card, shadows.md, { alignItems: 'center' as const }]}>
        <View style={[s.iconCircle, { backgroundColor: colors.successLight }]}>
          <Feather name={"check-circle" as any} size={32} color={colors.success} />
        </View>
        <Text style={s.heading}>Bank Account Connected!</Text>

        {/* Connected account card */}
        <View style={[s.accountCard, shadows.sm]}>
          <View style={s.accountRow}>
            <Feather name={"credit-card" as any} size={18} color={colors.text} />
            <View style={{ flex: 1 }}>
              <Text style={s.accountName}>Chase Checking ****1234</Text>
              <Text style={s.accountDate}>Connected on Apr 9, 2026</Text>
            </View>
            <View style={s.activeBadge}>
              <Text style={s.activeBadgeText}>Active</Text>
            </View>
          </View>
        </View>

        <Pressable style={{ marginTop: 4 }}>
          <Text style={s.changeLink}>Change Account</Text>
        </Pressable>

        <Pressable style={[s.btnPrimary, shadows.button, { width: '100%', marginTop: 16 }]} onPress={() => router.push('/proto/states/comp-earnings' as any)}>
          <Text style={s.btnPrimaryText}>GO TO EARNINGS</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function CompStripeConnectStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Connect bank account via Stripe">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="CONNECTED" description="Bank account connected success">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <ConnectedState />
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
  page: { gap: 12, width: '100%' },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 24,
    gap: 12,
  },

  // Icon circle
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.badge.pink.bg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Text
  heading: { ...typography.h2, color: colors.text, textAlign: 'center' },
  description: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  note: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },

  // Benefits
  benefitsList: { width: '100%', gap: 8 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  benefitIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.badge.pink.bg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { ...typography.bodyMedium, color: colors.text },

  // Primary button
  btnPrimary: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: { ...typography.button, color: colors.textInverse },

  // Stripe logo placeholder
  stripeLogo: {
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  stripeLogoText: { ...typography.bodyMedium, color: colors.textMuted, fontWeight: '700' },

  // Account card
  accountCard: {
    width: '100%',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 14,
  },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  accountName: { ...typography.bodyMedium, color: colors.text },
  accountDate: { ...typography.caption, color: colors.textMuted },

  // Active badge
  activeBadge: {
    backgroundColor: colors.successLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  activeBadgeText: { ...typography.caption, color: colors.success, fontWeight: '700' },

  // Change link
  changeLink: { ...typography.caption, color: colors.textMuted, textDecorationLine: 'underline' },
});
