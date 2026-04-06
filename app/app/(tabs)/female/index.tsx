import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { OnboardingTour, COMPANION_TOUR_STEPS } from '../../../src/components/OnboardingTour';
import { Card } from '../../../src/components/Card';
import { Avatar } from '../../../src/components/Avatar';
import { Badge } from '../../../src/components/Badge';
import { Icon } from '../../../src/components/Icon';
import { VerificationBanner } from '../../../src/components/VerificationBanner';
import { EmptyState } from '../../../src/components/EmptyState';
import { colors, spacing, typography, borderRadius, shadows, PAGE_PADDING } from '../../../src/constants/theme';
import { bookingsApi, paymentsApi, Booking } from '../../../src/services/api';

export default function FemaleDashboard() {
  const insets = useSafeAreaInsets();
  const { user, isAuthenticated, hasSeenTour, _hasHydrated, setTourSeen } = useAuthStore();
  const showTour = isAuthenticated && _hasHydrated && !hasSeenTour;

  const [refreshing, setRefreshing] = useState(false);
  const [statsLoaded, setStatsLoaded] = useState(false);
  const [recentRequests, setRecentRequests] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    upcomingDates: 0,
    thisWeekEarnings: 0,
    rating: (user?.reviewCount ?? 0) > 0 ? user?.rating ?? '-' : 'New',
  });

  const fetchStats = useCallback(async () => {
    try {
      const [pendingRes, upcomingRes, earningsRes, requestsRes] = await Promise.allSettled([
        bookingsApi.getMyBookings('pending'),
        bookingsApi.getMyBookings('upcoming'),
        paymentsApi.getEarnings(),
        bookingsApi.getRequests('pending'),
      ]);

      setStats({
        pendingRequests: pendingRes.status === 'fulfilled' ? pendingRes.value.bookings?.length ?? 0 : 0,
        upcomingDates: upcomingRes.status === 'fulfilled' ? upcomingRes.value.bookings?.length ?? 0 : 0,
        thisWeekEarnings: earningsRes.status === 'fulfilled' ? earningsRes.value.totalEarnings ?? 0 : 0,
        rating: (user?.reviewCount ?? 0) > 0 ? user?.rating ?? '-' : 'New',
      });

      if (requestsRes.status === 'fulfilled') {
        setRecentRequests((requestsRes.value.bookings ?? []).slice(0, 3));
      }
      setStatsLoaded(true);
    } catch {
      // keep existing values on error
      setStatsLoaded(true);
    }
  }, [user?.reviewCount, user?.rating]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
    setRefreshing(false);
  }, [fetchStats]);

  return (
    <>
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {user?.name ? `Welcome back, ${user.name.split(' ')[0]}!` : 'Welcome back!'}
          </Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <Avatar
          uri={user?.photos?.[0]?.url}
          name={user?.name}
          size={52}
          verified={user?.isVerified}
        />
      </View>

      {/* Profile incomplete gate — shown when profile is not yet published */}
      {!user?.isPublicProfile && (
        <TouchableOpacity
          style={styles.incompleteGate}
          onPress={() => router.push('/settings')}
          activeOpacity={0.85}
          accessibilityLabel="Complete your profile to start receiving bookings"
          accessibilityRole="button"
        >
          <View style={styles.incompleteGateLeft}>
            <Icon name="alert-circle" size={20} color={colors.warning} />
            <View style={styles.incompleteGateText}>
              <Text style={styles.incompleteGateTitle}>Profile Incomplete</Text>
              <Text style={styles.incompleteGateDesc}>
                Add a photo, set your rate and bio to go live
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={18} color={colors.warning} />
        </TouchableOpacity>
      )}

      {/* Verification reminder */}
      <VerificationBanner />

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          value={stats.pendingRequests}
          label="Pending"
          icon="mail"
          color={colors.primary}
        />
        <StatCard
          value={stats.upcomingDates}
          label="Upcoming"
          icon="calendar"
          color={colors.primary}
        />
        <StatCard
          value={`$${stats.thisWeekEarnings}`}
          label="This Week"
          icon="receipt"
          color={colors.primary}
        />
        <StatCard
          value={stats.rating}
          label="Rating"
          icon="star"
          color={colors.primary}
        />
      </View>

      {/* Empty state — shown when no pending requests and no upcoming dates */}
      {statsLoaded && stats.pendingRequests === 0 && stats.upcomingDates === 0 && (
        <EmptyState
          icon="star"
          title="Your profile is visible to seekers"
          description="Complete your profile and set your availability to start receiving booking requests."
          actionLabel="Update Profile"
          onAction={() => router.push('/settings/edit-profile')}
        />
      )}

      {/* Recent Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => router.push('/(tabs)/female/requests')}
            accessibilityLabel="See all requests"
            accessibilityRole="button"
          >
            <Text style={styles.seeAll}>View All</Text>
            <Icon name="chevron-right" size={16} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        {recentRequests.length === 0 ? (
          <Card variant="default" shadow="sm">
            <View style={styles.emptyRequests}>
              <Icon name="inbox" size={32} color={colors.textMuted} />
              <Text style={styles.emptyRequestsText}>No pending requests</Text>
            </View>
          </Card>
        ) : (
          <Card variant="default" shadow="sm">
            {recentRequests.map((request, index) => (
              <View key={request.id}>
                {index > 0 && <View style={styles.divider} />}
                <RequestItem
                  name={request.seeker?.name ?? 'Unknown'}
                  activity={request.activity}
                  date={formatRequestDate(request.date)}
                  amount={request.companionEarnings}
                  status={request.status}
                />
              </View>
            ))}
          </Card>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <ActionCard icon="calendar" label="Set Availability" color={colors.primary} onPress={() => router.push('/female/calendar')} />
          <ActionCard icon="receipt" label="Update Rates" color={colors.primary} onPress={() => router.push('/settings/edit-profile')} />
          <ActionCard icon="camera" label="Add Photos" color={colors.primary} onPress={() => router.push('/settings/edit-profile')} />
        </View>
      </View>
    </ScrollView>
    <OnboardingTour
      visible={showTour}
      steps={COMPANION_TOUR_STEPS}
      onDone={setTourSeen}
    />
    </>
  );
}

function formatRequestDate(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function StatCard({
  value,
  label,
  icon,
  color,
}: {
  value: number | string;
  label: string;
  icon: string;
  color: string;
}) {
  return (
    <Card variant="default" shadow="sm" style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: color + '15' }]}>
        <Icon name={icon as any} size={18} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </Card>
  );
}

function ActionCard({
  icon,
  label,
  color,
  onPress,
}: {
  icon: string;
  label: string;
  color: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <View style={[styles.actionIconWrap, { backgroundColor: color + '15' }]}>
        <Icon name={icon as any} size={22} color={color} />
      </View>
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

function RequestItem({
  name,
  activity,
  date,
  amount,
  status,
}: {
  name: string;
  activity: string;
  date: string;
  amount: number;
  status: string;
}) {
  const getStatusVariant = (s: string) => {
    switch (s) {
      case 'pending': return 'warning';
      case 'confirmed': return 'success';
      case 'cancelled': return 'gray';
      default: return 'pink';
    }
  };

  return (
    <View style={styles.requestItem}>
      <Avatar name={name} size={44} />
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>{name}</Text>
        <Text style={styles.requestActivity}>{activity}</Text>
        <View style={styles.requestMeta}>
          <Icon name="calendar" size={12} color={colors.textMuted} />
          <Text style={styles.requestDate}>{date}</Text>
        </View>
      </View>
      <View style={styles.requestRight}>
        <Text style={styles.requestAmount}>${amount}</Text>
        <Badge
          text={status.charAt(0).toUpperCase() + status.slice(1)}
          variant={getStatusVariant(status) as any}
          size="sm"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    marginBottom: 2,
  },
  name: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginBottom: spacing.md,
  },
  seeAll: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  requestInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  requestName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  requestActivity: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  requestMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  requestDate: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  requestRight: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  requestAmount: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    color: colors.success,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  actionIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    color: colors.text,
    textAlign: 'center',
  },
  emptyRequests: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    gap: spacing.sm,
  },
  emptyRequestsText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  incompleteGate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.warningLight,
    borderWidth: 1.5,
    borderColor: colors.warning,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  incompleteGateLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  incompleteGateText: {
    flex: 1,
  },
  incompleteGateTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: 2,
  },
  incompleteGateDesc: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
