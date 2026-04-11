import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — Approved, welcome screen
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      {/* Icon + heading */}
      <View style={s.header}>
        <View style={[s.iconCircle, shadows.md]}>
          <Feather name={"star" as any} size={36} color={colors.textInverse} />
        </View>
        <Text style={s.heading}>Welcome to DateRabbit!</Text>
        <Text style={s.sub}>
          Your profile has been approved! You can now receive booking requests.
        </Text>
      </View>

      {/* Stats preview card */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.statsRow}>
          <View style={s.statItem}>
            <Text style={s.statValue}>0</Text>
            <Text style={s.statLabel}>bookings</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <Text style={s.statValue}>$0</Text>
            <Text style={s.statLabel}>earned</Text>
          </View>
          <View style={s.statDivider} />
          <View style={s.statItem}>
            <View style={s.newBadge}>
              <Text style={s.newBadgeText}>NEW</Text>
            </View>
            <Text style={s.statLabel}>companion</Text>
          </View>
        </View>
      </View>

      {/* Quick setup checklist */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>Quick Setup</Text>
        {[
          {
            icon: 'credit-card',
            title: 'Connect bank account',
            desc: 'Required for payouts',
            accent: colors.accent,
          },
          {
            icon: 'calendar',
            title: 'Set availability',
            desc: 'Let clients know when you are free',
            accent: colors.primary,
          },
          {
            icon: 'bell',
            title: 'Turn on notifications',
            desc: 'Never miss a booking request',
            accent: colors.warning,
          },
        ].map(item => (
          <Pressable key={item.title} style={[s.setupRow, shadows.sm]}>
            <View style={[s.setupIcon, { backgroundColor: item.accent + '22' }]}>
              <Feather name={item.icon as any} size={20} color={item.accent} />
            </View>
            <View style={s.setupText}>
              <Text style={s.setupTitle}>{item.title}</Text>
              <Text style={s.setupDesc}>{item.desc}</Text>
            </View>
            <Feather name={"arrow-right" as any} size={16} color={colors.textLight} />
          </Pressable>
        ))}
      </View>

      {/* Primary CTA */}
      <Pressable style={[s.btnPrimary, shadows.button]} onPress={() => router.push('/proto/states/comp-home' as any)}>
        <Text style={s.btnPrimaryText}>GO TO DASHBOARD</Text>
        <Feather name={"arrow-right" as any} size={18} color={colors.textInverse} />
      </Pressable>

      {/* Secondary CTA */}
      <Pressable style={[s.btnSecondary, shadows.sm]} onPress={() => router.push('/proto/states/comp-stripe-connect' as any)}>
        <Feather name={"credit-card" as any} size={18} color={colors.text} />
        <Text style={s.btnSecondaryText}>CONNECT BANK FIRST</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function CompOnboardApprovedStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Companion approved, welcome + quick setup">
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
  page: { gap: 16, width: '100%' },

  // Header
  header: { alignItems: 'center', gap: 8 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: colors.primary,
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
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: 12 },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: { ...typography.h2, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textMuted },
  statDivider: {
    width: 2,
    height: 32,
    backgroundColor: colors.borderLight,
  },
  newBadge: {
    backgroundColor: colors.badge.pink.bg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newBadgeText: { ...typography.label, color: colors.primary, fontSize: 10 },

  // Setup checklist
  setupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 14,
    marginBottom: 8,
  },
  setupIcon: {
    width: 40,
    height: 40,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setupText: { flex: 1 },
  setupTitle: { ...typography.bodyMedium, color: colors.text },
  setupDesc: { ...typography.caption, color: colors.textMuted },

  // Buttons
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: { ...typography.button, color: colors.textInverse },
  btnSecondary: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnSecondaryText: { ...typography.button, color: colors.text },
});
