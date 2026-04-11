import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, shadows } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — Companion Home dashboard
// ===========================================================================
function DefaultState() {
  const [available, setAvailable] = useState(true);

  return (
    <View style={s.page}>
      {/* Header */}
      <View style={s.header}>
        <Image source={{ uri: 'https://picsum.photos/seed/jessica-avatar/40/40' }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#000' }} />
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>Good evening, Jessica</Text>
        </View>
        <Pressable style={s.iconBtn}>
          <Feather name={"bell" as any} size={20} color={colors.text} />
          <View style={s.notifBadge}>
            <Text style={s.notifBadgeText}>3</Text>
          </View>
        </Pressable>
        <Pressable style={s.iconBtn}>
          <Feather name={"settings" as any} size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Status toggle */}
      <Pressable
        style={[s.toggleCard, shadows.md, { borderColor: available ? colors.success : colors.error }]}
        onPress={() => setAvailable(!available)}
      >
        <View style={[s.toggleDot, { backgroundColor: available ? colors.success : colors.error }]} />
        <Text style={s.toggleLabel}>{available ? 'Available' : 'Busy'}</Text>
        <View style={[s.toggleSwitch, { backgroundColor: available ? colors.success : colors.error }]}>
          <View style={[s.toggleThumb, available ? { alignSelf: 'flex-end' as const } : { alignSelf: 'flex-start' as const }]} />
        </View>
      </Pressable>

      {/* Today stats row */}
      <View style={s.statsRow}>
        {[
          { value: '2', label: 'requests pending' },
          { value: '1', label: 'date tonight' },
          { value: '$450', label: 'this week' },
        ].map(st => (
          <View key={st.label} style={[s.statItem, shadows.sm]}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Upcoming date card */}
      <View style={[s.card, shadows.md]}>
        <Text style={s.cardTitle}>Upcoming Date</Text>
        <View style={s.dateRow}>
          <Feather name={"calendar" as any} size={18} color={colors.primary} />
          <Text style={s.dateText}>Tonight 8:00 PM</Text>
        </View>
        <Text style={s.dateName}>James W. (Seeker)</Text>
        <Text style={s.dateMeta}>Le Bernardin, NYC</Text>
        <View style={s.dateDetailsRow}>
          <View style={s.detailChip}>
            <Feather name={"clock" as any} size={12} color={colors.textMuted} />
            <Text style={s.detailChipText}>3 hours</Text>
          </View>
          <View style={s.detailChip}>
            <Feather name={"dollar-sign" as any} size={12} color={colors.success} />
            <Text style={[s.detailChipText, { color: colors.success }]}>$450 + tip</Text>
          </View>
        </View>
        <Pressable style={[s.btnPrimary, shadows.button]} onPress={() => router.push('/proto/states/comp-requests' as any)}>
          <Text style={s.btnPrimaryText}>VIEW DETAILS</Text>
        </Pressable>
      </View>

      {/* Pending requests preview */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.rowBetween}>
          <Text style={s.cardTitle}>2 new requests</Text>
          <Pressable style={s.viewAllBtn} onPress={() => router.push('/proto/states/comp-requests' as any)}>
            <Text style={s.viewAllText}>View All</Text>
            <Feather name={"chevron-right" as any} size={14} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* Earnings mini chart */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>This Week</Text>
        <View style={s.chartRow}>
          {[60, 80, 40, 100, 70, 50, 90].map((w, i) => (
            <View key={i} style={s.chartBarWrap}>
              <View style={[s.chartBar, { height: w }]} />
              <Text style={s.chartDay}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom tabs */}
      <View style={s.bottomTabs}>
        {[
          { icon: 'home', label: 'Home', active: true, route: '/proto/states/comp-home' },
          { icon: 'inbox', label: 'Requests', active: false, route: '/proto/states/comp-requests' },
          { icon: 'calendar', label: 'Calendar', active: false, route: '/proto/states/comp-calendar' },
          { icon: 'bar-chart-2', label: 'Earnings', active: false, route: '/proto/states/comp-earnings' },
          { icon: 'user', label: 'Profile', active: false, route: '/proto/states/comp-profile' },
        ].map(tab => (
          <Pressable key={tab.label} style={s.tabItem} onPress={() => router.push(tab.route as any)}>
            <Feather name={tab.icon as any} size={20} color={tab.active ? colors.primary : colors.textMuted} />
            <Text style={[s.tabLabel, tab.active && { color: colors.primary }]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 2: BUSY_MODE
// ===========================================================================
function BusyModeState() {
  const [available, setAvailable] = useState(false);

  return (
    <View style={s.page}>
      {/* Header */}
      <View style={s.header}>
        <Image source={{ uri: 'https://picsum.photos/seed/jessica-avatar/40/40' }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#000' }} />
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>Good evening, Jessica</Text>
        </View>
        <Pressable style={s.iconBtn}>
          <Feather name={"bell" as any} size={20} color={colors.text} />
        </Pressable>
        <Pressable style={s.iconBtn}>
          <Feather name={"settings" as any} size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Busy toggle */}
      <Pressable
        style={[s.toggleCard, shadows.md, { borderColor: colors.error }]}
        onPress={() => setAvailable(!available)}
      >
        <View style={[s.toggleDot, { backgroundColor: available ? colors.success : colors.error }]} />
        <Text style={s.toggleLabel}>{available ? 'Available' : 'Busy'}</Text>
        <View style={[s.toggleSwitch, { backgroundColor: available ? colors.success : colors.error }]}>
          <View style={[s.toggleThumb, available ? { alignSelf: 'flex-end' as const } : { alignSelf: 'flex-start' as const }]} />
        </View>
      </Pressable>

      {/* Busy banner */}
      <View style={[s.busyBanner, shadows.sm]}>
        <Feather name={"alert-circle" as any} size={18} color={colors.error} />
        <Text style={s.busyBannerText}>You are not accepting new requests</Text>
      </View>

      <Pressable style={[s.btnSuccess, shadows.button]}>
        <Text style={s.btnPrimaryText}>GO AVAILABLE</Text>
      </Pressable>

      {/* Stats row (same) */}
      <View style={s.statsRow}>
        {[
          { value: '2', label: 'requests pending' },
          { value: '1', label: 'date tonight' },
          { value: '$450', label: 'this week' },
        ].map(st => (
          <View key={st.label} style={[s.statItem, shadows.sm]}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 3: NEW_REQUEST_ALERT
// ===========================================================================
function NewRequestAlertState() {
  const [showAlert, setShowAlert] = useState(true);

  return (
    <View style={s.page}>
      {/* Alert banner */}
      {showAlert && (
        <Pressable style={[s.alertBanner, shadows.md]} onPress={() => setShowAlert(false)}>
          <View style={{ flex: 1 }}>
            <Text style={s.alertTitle}>New booking request</Text>
            <Text style={s.alertSub}>Michael T. -- Tonight 9 PM -- $300</Text>
          </View>
          <View style={s.alertActions}>
            <Pressable style={[s.alertBtnAccept]}>
              <Text style={s.alertBtnAcceptText}>Accept</Text>
            </Pressable>
            <Pressable style={s.alertBtnView}>
              <Text style={s.alertBtnViewText}>View</Text>
            </Pressable>
          </View>
        </Pressable>
      )}

      {/* Header */}
      <View style={s.header}>
        <Image source={{ uri: 'https://picsum.photos/seed/jessica-avatar/40/40' }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#000' }} />
        <View style={{ flex: 1 }}>
          <Text style={s.greeting}>Good evening, Jessica</Text>
        </View>
        <Pressable style={s.iconBtn}>
          <Feather name={"bell" as any} size={20} color={colors.text} />
          <View style={s.notifBadge}>
            <Text style={s.notifBadgeText}>4</Text>
          </View>
        </Pressable>
        <Pressable style={s.iconBtn}>
          <Feather name={"settings" as any} size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Toggle available */}
      <View style={[s.toggleCard, shadows.md, { borderColor: colors.success }]}>
        <View style={[s.toggleDot, { backgroundColor: colors.success }]} />
        <Text style={s.toggleLabel}>Available</Text>
        <View style={[s.toggleSwitch, { backgroundColor: colors.success }]}>
          <View style={[s.toggleThumb, { alignSelf: 'flex-end' as const }]} />
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { value: '3', label: 'requests pending' },
          { value: '1', label: 'date tonight' },
          { value: '$450', label: 'this week' },
        ].map(st => (
          <View key={st.label} style={[s.statItem, shadows.sm]}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function CompHomeStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Companion Home dashboard">
        <DefaultState />
      </StateSection>
      <StateSection title="BUSY_MODE" description="Toggle is red, not accepting requests">
        <BusyModeState />
      </StateSection>
      <StateSection title="NEW_REQUEST_ALERT" description="Modal-like banner for new booking">
        <NewRequestAlertState />
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greeting: {
    ...typography.h3,
    color: colors.text,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  notifBadgeText: { ...typography.caption, color: colors.textInverse, fontSize: 9, fontWeight: '700' },

  // Toggle
  toggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 10,
  },
  toggleDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
  },
  toggleLabel: { ...typography.h3, color: colors.text, flex: 1 },
  toggleSwitch: {
    width: 52,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 2,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
  },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8 },
  statItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 10,
    alignItems: 'center',
  },
  statValue: { ...typography.h3, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textMuted, textAlign: 'center', fontSize: 10 },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: 8 },

  // Date card
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  dateText: { ...typography.bodyMedium, color: colors.text },
  dateName: { ...typography.body, color: colors.textSecondary, marginBottom: 2 },
  dateMeta: { ...typography.bodySmall, color: colors.textMuted, marginBottom: 8 },
  dateDetailsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  detailChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  detailChipText: { ...typography.caption, color: colors.textMuted },

  // Buttons
  btnPrimary: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { ...typography.button, color: colors.textInverse },
  btnSuccess: {
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },

  // View all
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  viewAllText: { ...typography.caption, color: colors.primary },

  // Chart
  chartRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-end', height: 110 },
  chartBarWrap: { flex: 1, alignItems: 'center' },
  chartBar: {
    width: '100%',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
  },
  chartDay: { ...typography.caption, color: colors.textMuted, marginTop: 4, fontSize: 10 },

  // Bottom tabs
  bottomTabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    marginTop: 4,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },

  // Busy banner
  busyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.errorLight,
    borderWidth: 2,
    borderColor: colors.error,
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  busyBannerText: { ...typography.bodyMedium, color: colors.error },

  // Alert banner
  alertBanner: {
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 14,
    gap: 10,
  },
  alertTitle: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  alertSub: { ...typography.bodySmall, color: colors.textSecondary },
  alertActions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  alertBtnAccept: {
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  alertBtnAcceptText: { ...typography.caption, color: colors.textInverse, fontWeight: '700' },
  alertBtnView: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  alertBtnViewText: { ...typography.caption, color: colors.text, fontWeight: '700' },
});
