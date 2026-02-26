import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '../../../src/store/authStore';
import { Card } from '../../../src/components/Card';
import { Avatar } from '../../../src/components/Avatar';
import { Badge } from '../../../src/components/Badge';
import { Icon } from '../../../src/components/Icon';
import { colors, spacing, typography, borderRadius, shadows, PAGE_PADDING } from '../../../src/constants/theme';

export default function FemaleDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const stats = {
    pendingRequests: 3,
    upcomingDates: 2,
    thisWeekEarnings: 450,
    rating: 4.9,
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name}</Text>
        </View>
        <Avatar
          uri={user?.photos?.[0]?.url}
          name={user?.name}
          size={52}
          verified={user?.isVerified}
        />
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          value={stats.pendingRequests}
          label="Pending"
          icon="mail"
          color={colors.warning}
        />
        <StatCard
          value={stats.upcomingDates}
          label="Upcoming"
          icon="calendar"
          color={colors.accent}
        />
        <StatCard
          value={`$${stats.thisWeekEarnings}`}
          label="This Week"
          icon="receipt"
          color={colors.success}
        />
        <StatCard
          value={stats.rating}
          label="Rating"
          icon="star"
          color={colors.primary}
        />
      </View>

      {/* Recent Requests */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Requests</Text>
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAll}>View All</Text>
            <Icon name="chevron-right" size={16} color={colors.secondary} />
          </TouchableOpacity>
        </View>
        <Card variant="default" shadow="sm">
          <RequestItem
            name="Michael"
            activity="Dinner at Le Bernardin"
            date="Tomorrow, 7 PM"
            amount={200}
            status="pending"
          />
          <View style={styles.divider} />
          <RequestItem
            name="James"
            activity="Art Gallery Tour"
            date="Friday, 3 PM"
            amount={150}
            status="pending"
          />
          <View style={styles.divider} />
          <RequestItem
            name="Robert"
            activity="Coffee & Walk"
            date="Saturday, 11 AM"
            amount={75}
            status="pending"
          />
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <ActionCard icon="calendar" label="Set Availability" color={colors.accent} onPress={() => router.push('/female/calendar')} />
          <ActionCard icon="receipt" label="Update Rates" color={colors.success} onPress={() => router.push('/settings/edit-profile')} />
          <ActionCard icon="camera" label="Add Photos" color={colors.primary} onPress={() => router.push('/settings/edit-profile')} />
        </View>
      </View>
    </ScrollView>
  );
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
    <TouchableOpacity style={styles.actionCard} activeOpacity={0.7} onPress={onPress}>
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
    color: colors.secondary,
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
    backgroundColor: colors.border,
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
    borderColor: colors.border,
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
});
