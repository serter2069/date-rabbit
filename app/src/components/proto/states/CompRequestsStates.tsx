import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, shadows } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — Pending requests
// ===========================================================================
function DefaultState() {
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'declined'>('pending');
  const [accepted, setAccepted] = useState<Record<string, boolean>>({});
  const [declined, setDeclined] = useState<Record<string, boolean>>({});

  const handleAccept = (name: string) => {
    setAccepted(prev => ({ ...prev, [name]: true }));
  };
  const handleDecline = (name: string) => {
    setDeclined(prev => ({ ...prev, [name]: true }));
  };

  return (
    <View style={s.page}>
      {/* Tabs */}
      <View style={s.tabs}>
        {([
          { key: 'pending' as const, label: 'Pending (2)' },
          { key: 'accepted' as const, label: 'Accepted' },
          { key: 'declined' as const, label: 'Declined' },
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

      {/* Request Card 1 */}
      <View style={[s.card, shadows.md]}>
        <View style={s.expiryBadge}>
          <Feather name={"clock" as any} size={12} color={colors.warning} />
          <Text style={s.expiryText}>Expires in 2h 34m</Text>
        </View>
        <View style={s.cardHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/michael-seeker/56/56' }} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.cardInfo}>
            <Text style={s.cardName}>Michael T.</Text>
            <View style={s.verifiedBadge}>
              <Feather name={"check-circle" as any} size={12} color={colors.success} />
              <Text style={s.verifiedText}>Verified Seeker</Text>
            </View>
          </View>
        </View>
        <View style={s.detailsGrid}>
          <DetailRow icon={<Feather name={"clock" as any} size={14} color={colors.textMuted} />} label="Tonight, 9:00 PM" sub="2 hours" />
          <DetailRow icon={<Feather name={"map-pin" as any} size={14} color={colors.textMuted} />} label="Midtown Manhattan" />
        </View>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>$300</Text>
        </View>
        <Pressable onPress={() => router.push('/proto/states/booking-detail' as any)}>
          <Text style={s.linkText}>View Profile</Text>
        </Pressable>
        <View style={s.actionsRow}>
          <Pressable style={[s.btnAccept, shadows.sm, accepted['michael'] && { opacity: 0.5 }]} onPress={() => handleAccept('michael')}>
            <Text style={s.btnAcceptText}>{accepted['michael'] ? 'ACCEPTED' : 'ACCEPT'}</Text>
          </Pressable>
          <Pressable style={[s.btnDecline, shadows.sm, declined['michael'] && { opacity: 0.5 }]} onPress={() => handleDecline('michael')}>
            <Text style={s.btnDeclineText}>{declined['michael'] ? 'DECLINED' : 'DECLINE'}</Text>
          </Pressable>
        </View>
      </View>

      {/* Request Card 2 */}
      <View style={[s.card, shadows.md]}>
        <View style={s.expiryBadge}>
          <Feather name={"clock" as any} size={12} color={colors.warning} />
          <Text style={s.expiryText}>Expires in 5h 12m</Text>
        </View>
        <View style={s.cardHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/david-seeker/56/56' }} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.cardInfo}>
            <Text style={s.cardName}>David K.</Text>
            <View style={s.verifiedBadge}>
              <Feather name={"check-circle" as any} size={12} color={colors.success} />
              <Text style={s.verifiedText}>Verified Seeker</Text>
            </View>
          </View>
        </View>
        <View style={s.detailsGrid}>
          <DetailRow icon={<Feather name={"clock" as any} size={14} color={colors.textMuted} />} label="Tomorrow, 7:00 PM" sub="3 hours" />
          <DetailRow icon={<Feather name={"map-pin" as any} size={14} color={colors.textMuted} />} label="Upper West Side" />
        </View>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>$450</Text>
        </View>
        <Pressable onPress={() => router.push('/proto/states/booking-detail' as any)}>
          <Text style={s.linkText}>View Profile</Text>
        </Pressable>
        <View style={s.actionsRow}>
          <Pressable style={[s.btnAccept, shadows.sm, accepted['david'] && { opacity: 0.5 }]} onPress={() => handleAccept('david')}>
            <Text style={s.btnAcceptText}>{accepted['david'] ? 'ACCEPTED' : 'ACCEPT'}</Text>
          </Pressable>
          <Pressable style={[s.btnDecline, shadows.sm, declined['david'] && { opacity: 0.5 }]} onPress={() => handleDecline('david')}>
            <Text style={s.btnDeclineText}>{declined['david'] ? 'DECLINED' : 'DECLINE'}</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

function DetailRow({ icon, label, sub }: { icon: React.ReactNode; label: string; sub?: string }) {
  return (
    <View style={s.detailRow}>
      {icon}
      <Text style={s.detailLabel}>{label}</Text>
      {sub && <Text style={s.detailSub}>{sub}</Text>}
    </View>
  );
}

// ===========================================================================
// STATE 2: ACCEPTED — Confirmed booking tab
// ===========================================================================
function AcceptedState() {
  const [activeTab, setActiveTab] = useState<'pending' | 'accepted' | 'declined'>('accepted');

  return (
    <View style={s.page}>
      <View style={s.tabs}>
        {([
          { key: 'pending' as const, label: 'Pending' },
          { key: 'accepted' as const, label: 'Accepted' },
          { key: 'declined' as const, label: 'Declined' },
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

      <View style={[s.card, shadows.md]}>
        <View style={s.confirmedBadge}>
          <Feather name={"check-circle" as any} size={14} color={colors.success} />
          <Text style={s.confirmedText}>Confirmed</Text>
        </View>
        <View style={s.cardHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/michael-seeker/56/56' }} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.cardInfo}>
            <Text style={s.cardName}>Michael T.</Text>
            <View style={s.verifiedBadge}>
              <Feather name={"check-circle" as any} size={12} color={colors.success} />
              <Text style={s.verifiedText}>Verified Seeker</Text>
            </View>
          </View>
        </View>
        <View style={s.detailsGrid}>
          <DetailRow icon={<Feather name={"clock" as any} size={14} color={colors.textMuted} />} label="Tonight, 9:00 PM" sub="2 hours" />
          <DetailRow icon={<Feather name={"map-pin" as any} size={14} color={colors.textMuted} />} label="Midtown Manhattan" />
        </View>
        <Pressable style={[s.btnPrimary, shadows.button]}>
          <Feather name={"message-square" as any} size={16} color={colors.textInverse} />
          <Text style={s.btnPrimaryText}>MESSAGE SEEKER</Text>
        </Pressable>
        <Pressable style={{ marginTop: 8, alignSelf: 'center' as const }}>
          <Text style={s.cancelLink}>Cancel</Text>
        </Pressable>
        <Text style={s.cancelNote}>Cancellation within 24h may affect your rating</Text>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 3: EMPTY — No requests
// ===========================================================================
function EmptyState() {
  return (
    <View style={s.page}>
      <View style={s.tabs}>
        <Pressable style={[s.tab, s.tabActive]}>
          <Text style={[s.tabText, s.tabTextActive]}>Pending (0)</Text>
        </Pressable>
        <Pressable style={s.tab}>
          <Text style={s.tabText}>Accepted</Text>
        </Pressable>
        <Pressable style={s.tab}>
          <Text style={s.tabText}>Declined</Text>
        </Pressable>
      </View>

      <View style={[s.card, shadows.sm, { alignItems: 'center' as const, paddingVertical: 40 }]}>
        <Feather name={"inbox" as any} size={48} color={colors.textLight} />
        <Text style={s.emptyTitle}>No pending requests</Text>
        <Text style={s.emptyNote}>
          Make sure you are set to Available to receive requests
        </Text>
      </View>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function CompRequestsStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Pending incoming requests">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="ACCEPTED" description="Confirmed booking view">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <AcceptedState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="EMPTY" description="No requests in inbox">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <EmptyState />
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

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  cardHeader: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  cardInfo: { flex: 1, justifyContent: 'center' },
  cardName: { ...typography.h3, color: colors.text },

  // Verified badge
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: { ...typography.caption, color: colors.success, fontSize: 11 },

  // Details
  detailsGrid: { gap: 6, marginBottom: 12 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailLabel: { ...typography.bodySmall, color: colors.textSecondary },
  detailSub: { ...typography.caption, color: colors.textMuted },

  // Total
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  totalLabel: { ...typography.bodyMedium, color: colors.text },
  totalValue: { ...typography.h2, color: colors.success },

  // Link
  linkText: { ...typography.caption, color: colors.primary, textDecorationLine: 'underline', marginBottom: 12 },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 8 },
  btnAccept: {
    flex: 1,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnAcceptText: { ...typography.button, color: colors.textInverse },
  btnDecline: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnDeclineText: { ...typography.button, color: colors.error },

  // Primary button
  btnPrimary: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: { ...typography.button, color: colors.textInverse },

  // Expiry badge
  expiryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.warningLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  expiryText: { ...typography.caption, color: colors.warning, fontWeight: '700', fontSize: 11 },

  // Confirmed badge
  confirmedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.successLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 10,
  },
  confirmedText: { ...typography.caption, color: colors.success, fontWeight: '700' },

  // Cancel
  cancelLink: { ...typography.caption, color: colors.error, textDecorationLine: 'underline' },
  cancelNote: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: 4, fontSize: 10 },

  // Empty
  emptyTitle: { ...typography.h3, color: colors.text, marginTop: 12 },
  emptyNote: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
});
