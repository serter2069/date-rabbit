import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuthStore } from '../../../src/store/authStore';
import { Card } from '../../../src/components/Card';
import { Avatar } from '../../../src/components/Avatar';
import { colors, spacing, typography } from '../../../src/constants/theme';

export default function FemaleDashboard() {
  const { user } = useAuthStore();

  const stats = {
    pendingRequests: 3,
    upcomingDates: 2,
    thisWeekEarnings: 450,
    rating: 4.9,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.name}>{user?.name} 👋</Text>
        </View>
        <Avatar
          uri={user?.photos?.[0]?.url}
          name={user?.name}
          size={56}
          verified={user?.isVerified}
        />
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pendingRequests}</Text>
          <Text style={styles.statLabel}>Pending Requests</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>{stats.upcomingDates}</Text>
          <Text style={styles.statLabel}>Upcoming Dates</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statValue, styles.earnings]}>${stats.thisWeekEarnings}</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={styles.statValue}>⭐ {stats.rating}</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Requests</Text>
        <Card>
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Card style={styles.actionCard}>
            <Text style={styles.actionIcon}>📅</Text>
            <Text style={styles.actionLabel}>Set Availability</Text>
          </Card>
          <Card style={styles.actionCard}>
            <Text style={styles.actionIcon}>💵</Text>
            <Text style={styles.actionLabel}>Update Rates</Text>
          </Card>
          <Card style={styles.actionCard}>
            <Text style={styles.actionIcon}>📸</Text>
            <Text style={styles.actionLabel}>Add Photos</Text>
          </Card>
        </View>
      </View>
    </ScrollView>
  );
}

const statusStyles: Record<string, { bg: string; text: string }> = {
  pending: { bg: colors.warning + '20', text: colors.warning },
  confirmed: { bg: colors.success + '20', text: colors.success },
  cancelled: { bg: colors.error + '20', text: colors.error },
  completed: { bg: colors.primary + '20', text: colors.primary },
};

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
  const statusStyle = statusStyles[status] || statusStyles.pending;

  return (
    <View style={styles.requestItem}>
      <Avatar name={name} size={48} />
      <View style={styles.requestInfo}>
        <Text style={styles.requestName}>{name}</Text>
        <Text style={styles.requestActivity}>{activity}</Text>
        <Text style={styles.requestDate}>{date}</Text>
      </View>
      <View style={styles.requestRight}>
        <Text style={styles.requestAmount}>${amount}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.statusText, { color: statusStyle.text }]}>{status}</Text>
        </View>
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
    padding: spacing.lg,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  greeting: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
  name: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    width: '47%',
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  earnings: {
    color: colors.success,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
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
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  requestActivity: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  requestDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  requestRight: {
    alignItems: 'flex-end',
  },
  requestAmount: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.success,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    color: colors.warning,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: spacing.sm,
  },
  actionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    textAlign: 'center',
  },
});
