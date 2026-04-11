import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet , ScrollView, useWindowDimensions} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader, ProtoTabBar } from '../NavComponents';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';


// ===========================================================================
// PageShell
// ===========================================================================
function PageShell({ children }: { children: React.ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="companion" />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flex: 1, maxWidth: 960, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
      {isMobile && <ProtoTabBar role='companion' activeTab="earnings" />}

    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Earnings overview
// ===========================================================================
function DefaultState() {
  const [activeTab, setActiveTab] = useState<'week' | 'month' | 'all'>('month');
  const transactions = [
    { date: 'Apr 10', name: 'James W.', hours: '3h date', amount: '$450', status: 'Paid' },
    { date: 'Apr 8', name: 'Michael T.', hours: '2h date', amount: '$300', status: 'Paid' },
    { date: 'Apr 5', name: 'David K.', hours: '4h date', amount: '$600', status: 'Paid' },
    { date: 'Apr 2', name: 'Robert S.', hours: '2h date', amount: '$300', status: 'Pending' },
    { date: 'Mar 30', name: 'Alex M.', hours: '3h date', amount: '$450', status: 'Paid' },
  ];

  return (
    <View style={s.page}>
      {/* Period tabs */}
      <View style={s.tabs}>
        {([
          { key: 'week' as const, label: 'This Week' },
          { key: 'month' as const, label: 'This Month' },
          { key: 'all' as const, label: 'All Time' },
        ]).map(tab => (
          <Pressable
            key={tab.key}
            style={[s.tab, activeTab === tab.key && s.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[s.tabText, activeTab === tab.key && s.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* Summary cards */}
      <View style={s.summaryRow}>
        {[
          { label: 'This Month', value: '$2,850' },
          { label: 'This Week', value: '$450' },
          { label: 'Pending Payout', value: '$1,200' },
        ].map(card => (
          <View key={card.label} style={[s.summaryCard, shadows.sm]}>
            <Text style={s.summaryLabel}>{card.label}</Text>
            <Text style={s.summaryValue}>{card.value}</Text>
          </View>
        ))}
      </View>

      {/* Payout status */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.payoutRow}>
          <Feather name={"credit-card" as any} size={18} color={colors.textMuted} />
          <View style={{ flex: 1 }}>
            <Text style={s.payoutBank}>Chase ****1234</Text>
            <Text style={s.payoutNext}>Next payout: Thursday</Text>
          </View>
        </View>
        <Pressable style={[s.btnPrimary, shadows.button, { marginTop: 12 }]}>
          <Text style={s.btnPrimaryText}>WITHDRAW NOW</Text>
        </Pressable>
      </View>

      {/* Transaction list */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>Recent Transactions</Text>
        {transactions.map((tx, i) => (
          <View key={i}>
            {i > 0 && <View style={s.divider} />}
            <View style={s.txRow}>
              <View style={{ flex: 1 }}>
                <Text style={s.txName}>{tx.date} -- {tx.name}</Text>
                <Text style={s.txSub}>{tx.hours}</Text>
              </View>
              <View style={s.txRight}>
                <Text style={s.txAmount}>{tx.amount}</Text>
                <View style={[s.statusBadge, tx.status === 'Paid' ? s.statusPaid : s.statusPending]}>
                  <Text style={[s.statusText, tx.status === 'Paid' ? s.statusPaidText : s.statusPendingText]}>
                    {tx.status}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        ))}
        <Pressable style={{ marginTop: 12, alignSelf: 'center' as const }}>
          <Text style={s.linkText}>View Full History</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 2: NO_BANK — No Stripe account connected
// ===========================================================================
function NoBankState() {
  return (
    <View style={s.page}>
      <View style={[s.warningCard, shadows.md]}>
        <Feather name={"dollar-sign" as any} size={48} color={colors.primary} />
        <Text style={s.warningTitle}>Connect your bank to receive payouts</Text>
        <View style={s.warningNotice}>
          <Feather name={"alert-triangle" as any} size={16} color={colors.warning} />
          <Text style={s.warningNoticeText}>You cannot receive payments until a bank account is connected</Text>
        </View>
        <Pressable style={[s.btnPrimary, shadows.button, { width: '100%' }]} onPress={() => router.push('/proto/states/comp-stripe-connect' as any)}>
          <Text style={s.btnPrimaryText}>CONNECT BANK ACCOUNT</Text>
        </Pressable>
        <Text style={s.stripeNote}>Stripe Connect Express -- secure, instant payouts</Text>
      </View>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function CompEarningsStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Earnings overview with transactions">
        <PageShell><DefaultState /></PageShell>
      </StateSection>
      <StateSection title="NO_BANK" description="No Stripe account connected">
        <PageShell><NoBankState /></PageShell>
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

  // Tabs
  tabs: { flexDirection: 'row', gap: 6 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  tabTextActive: { color: colors.textInverse },

  // Summary
  summaryRow: { flexDirection: 'row', gap: 8 },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
    alignItems: 'center',
  },
  summaryLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10, marginBottom: 4 },
  summaryValue: { ...typography.h3, color: colors.text },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: 12 },

  // Payout
  payoutRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  payoutBank: { ...typography.bodyMedium, color: colors.text },
  payoutNext: { ...typography.caption, color: colors.textMuted },

  // Primary button
  btnPrimary: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { ...typography.button, color: colors.textInverse },

  // Transactions
  divider: { height: 1, backgroundColor: colors.divider, marginVertical: 8 },
  txRow: { flexDirection: 'row', alignItems: 'center' },
  txName: { ...typography.bodySmall, color: colors.text },
  txSub: { ...typography.caption, color: colors.textMuted },
  txRight: { alignItems: 'flex-end', gap: 4 },
  txAmount: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusPaid: { backgroundColor: colors.successLight },
  statusPending: { backgroundColor: colors.warningLight },
  statusText: { ...typography.caption, fontWeight: '700', fontSize: 10 },
  statusPaidText: { color: colors.success },
  statusPendingText: { color: colors.warning },

  // Link
  linkText: { ...typography.caption, color: colors.primary, textDecorationLine: 'underline' },

  // Warning card (NO_BANK)
  warningCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.warning,
    borderRadius: borderRadius.lg,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  warningTitle: { ...typography.h3, color: colors.text, textAlign: 'center' },
  warningNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warningLight,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  warningNoticeText: { ...typography.bodySmall, color: colors.warning, flex: 1 },
  stripeNote: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});
