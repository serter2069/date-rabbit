import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// Bottom tab bar (shared navigation)
// ---------------------------------------------------------------------------
function BottomTabBar({ active }: { active: number }) {
  const router = useRouter();
  const tabs = [
    { icon: 'home' as const, label: 'Home', route: '/proto/states/seeker-home' },
    { icon: 'calendar' as const, label: 'Bookings', route: '/proto/states/seeker-bookings' },
    { icon: 'message-circle' as const, label: 'Messages', route: '/proto/states/seeker-messages' },
    { icon: 'user' as const, label: 'Profile', route: '/proto/states/seeker-profile' },
  ];
  return (
    <View style={s.bottomTabBar}>
      {tabs.map((t, i) => (
        <Pressable key={t.label} style={s.bottomTabItem} onPress={() => router.push(t.route as any)}>
          <Feather name={t.icon} size={20} color={i === active ? colors.primary : colors.textMuted} />
          <Text style={[s.bottomTabLabel, i === active && { color: colors.primary }]}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Tab switcher
// ---------------------------------------------------------------------------
function TabSwitcher({ tabs, active, onPress }: { tabs: string[]; active: number; onPress: (i: number) => void }) {
  return (
    <View style={s.tabRow}>
      {tabs.map((t, i) => (
        <Pressable
          key={t}
          style={[s.tab, i === active && s.tabActive]}
          onPress={() => onPress(i)}
        >
          <Text style={[s.tabText, i === active && s.tabTextActive]}>{t}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>My Bookings</Text>
      <TabSwitcher tabs={['Upcoming', 'Past', 'Cancelled']} active={activeTab} onPress={setActiveTab} />

      {/* Upcoming booking card */}
      <View style={[s.bookingCard, shadows.sm]}>
        <View style={s.bookingHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-booking/56/56' }} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#000' }} />
          <View style={s.bookingInfo}>
            <Text style={s.bookingName}>Jessica M.</Text>
            <View style={s.metaRow}>
              <Feather name={"calendar" as any} size={13} color={colors.textMuted} />
              <Text style={s.metaText}>Tomorrow, 8:00 PM</Text>
            </View>
            <View style={s.metaRow}>
              <Feather name={"clock" as any} size={13} color={colors.textMuted} />
              <Text style={s.metaText}>3 hours</Text>
            </View>
            <View style={s.metaRow}>
              <Feather name={"map-pin" as any} size={13} color={colors.textMuted} />
              <Text style={s.metaText}>Le Bernardin, NYC</Text>
            </View>
          </View>
          <View style={s.bookingRight}>
            <View style={[s.statusBadge, { backgroundColor: colors.successLight }]}>
              <Text style={[s.statusText, { color: colors.success }]}>Confirmed</Text>
            </View>
            <Text style={s.totalText}>$495</Text>
          </View>
        </View>
        <View style={s.bookingActions}>
          <Pressable style={[s.ghostBtn, shadows.sm]} onPress={() => router.push('/proto/states/booking-detail' as any)}>
            <Text style={s.ghostBtnText}>View Details</Text>
            <Feather name={"chevron-right" as any} size={14} color={colors.text} />
          </Pressable>
          <Pressable style={[s.pinkBtn, shadows.sm]}>
            <Feather name={"message-circle" as any} size={14} color={colors.textInverse} />
            <Text style={s.pinkBtnText}>Message</Text>
          </Pressable>
        </View>
      </View>

      {/* Empty past section hint */}
      <View style={s.emptySection}>
        <Text style={s.emptySectionText}>No past bookings yet</Text>
      </View>

      <BottomTabBar active={1} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: PENDING
// ---------------------------------------------------------------------------
function PendingState() {
  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>My Bookings</Text>
      <TabSwitcher tabs={['Upcoming', 'Past', 'Cancelled']} active={0} onPress={() => {}} />

      <View style={[s.bookingCard, shadows.sm]}>
        <View style={s.bookingHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-booking/56/56' }} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: '#000' }} />
          <View style={s.bookingInfo}>
            <Text style={s.bookingName}>Ashley R.</Text>
            <View style={s.metaRow}>
              <Feather name={"calendar" as any} size={13} color={colors.textMuted} />
              <Text style={s.metaText}>Friday, 7:30 PM</Text>
            </View>
            <View style={s.metaRow}>
              <Feather name={"map-pin" as any} size={13} color={colors.textMuted} />
              <Text style={s.metaText}>The Smith, Brooklyn</Text>
            </View>
          </View>
          <View style={s.bookingRight}>
            <View style={[s.statusBadge, { backgroundColor: colors.warningLight }]}>
              <Text style={[s.statusText, { color: colors.warning }]}>Pending</Text>
            </View>
            <Text style={s.totalText}>$360</Text>
          </View>
        </View>

        {/* Pending info */}
        <View style={s.pendingInfo}>
          <Feather name={"clock" as any} size={16} color={colors.warning} />
          <Text style={s.pendingText}>
            Awaiting companion confirmation. Usually confirmed within 1 hour.
          </Text>
        </View>

        {/* Progress bar */}
        <View style={s.progressBar}>
          <View style={s.progressFill} />
        </View>

        <Pressable style={s.cancelLink}>
          <Feather name={"x" as any} size={14} color={colors.error} />
          <Text style={s.cancelLinkText}>Cancel Request</Text>
        </Pressable>
      </View>

      <BottomTabBar active={1} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 3: EMPTY
// ---------------------------------------------------------------------------
function EmptyState() {
  const router = useRouter();
  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>My Bookings</Text>
      <TabSwitcher tabs={['Upcoming', 'Past', 'Cancelled']} active={0} onPress={() => {}} />

      <View style={s.emptyCenter}>
        <View style={s.emptyIconWrap}>
          <Feather name={"calendar" as any} size={48} color={colors.textLight} />
        </View>
        <Text style={s.emptyTitle}>No upcoming bookings</Text>
        <Text style={s.emptySub}>Browse companions to book your first date</Text>
        <Pressable style={[s.primaryBtn, shadows.button]} onPress={() => router.push('/proto/states/seeker-home' as any)}>
          <Text style={s.primaryBtnText}>BROWSE COMPANIONS</Text>
        </Pressable>
      </View>

      <BottomTabBar active={1} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function SeekerBookingsStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Upcoming booking with confirmed status">
        <DefaultState />
      </StateSection>
      <StateSection title="PENDING" description="Booking awaiting companion confirmation">
        <PendingState />
      </StateSection>
      <StateSection title="EMPTY" description="No bookings yet">
        <EmptyState />
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

  pageTitle: { ...typography.h2, color: colors.text },

  // Tabs
  tabRow: { flexDirection: 'row', gap: 8 },
  tab: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: { ...typography.bodyMedium, color: colors.text, fontSize: 13 },
  tabTextActive: { color: colors.textInverse },

  // Booking card
  bookingCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 12,
  },
  bookingHeader: { flexDirection: 'row', gap: 12 },
  bookingInfo: { flex: 1, gap: 3 },
  bookingName: { ...typography.h3, color: colors.text, marginBottom: 2 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { ...typography.caption, color: colors.textMuted },
  bookingRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusText: { ...typography.caption, fontWeight: '700', fontSize: 10 },
  totalText: { ...typography.h3, color: colors.primary },

  // Actions
  bookingActions: { flexDirection: 'row', gap: 10 },
  ghostBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
  },
  ghostBtnText: { ...typography.bodyMedium, color: colors.text, fontSize: 13 },
  pinkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
  },
  pinkBtnText: { ...typography.bodyMedium, color: colors.textInverse, fontSize: 13 },

  // Pending
  pendingInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.warningLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  pendingText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  progressBar: {
    height: 6,
    backgroundColor: colors.borderLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    width: '40%',
    height: '100%',
    backgroundColor: colors.warning,
    borderRadius: 3,
  },
  cancelLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'center',
  },
  cancelLinkText: { ...typography.bodyMedium, color: colors.error, fontSize: 13 },

  // Empty
  emptyCenter: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { ...typography.h3, color: colors.text, textAlign: 'center' },
  emptySub: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { ...typography.button, color: colors.textInverse },

  // Empty section hint
  emptySection: {
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.sm,
    borderStyle: 'dashed',
  },
  emptySectionText: { ...typography.caption, color: colors.textLight },

  // Bottom tab bar
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingVertical: 8,
    marginTop: 8,
  },
  bottomTabItem: { flex: 1, alignItems: 'center', gap: 2 },
  bottomTabLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
});
