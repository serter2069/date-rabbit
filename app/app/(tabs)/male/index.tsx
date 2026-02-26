import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/authStore';
import { Card } from '../../../src/components/Card';
import { Avatar } from '../../../src/components/Avatar';
import { Badge } from '../../../src/components/Badge';
import { Icon } from '../../../src/components/Icon';
import { colors, spacing, typography, borderRadius, shadows, PAGE_PADDING } from '../../../src/constants/theme';

const featuredCompanions = [
  { id: '1', name: 'Sarah', age: 28, rating: 4.9, rate: 100, verified: true },
  { id: '2', name: 'Emma', age: 25, rating: 4.8, rate: 85, verified: true },
  { id: '3', name: 'Olivia', age: 30, rating: 5.0, rate: 120, verified: true },
];

const upcomingBookings = [
  { id: '1', name: 'Sarah', activity: 'Dinner at Nobu', date: 'Tomorrow, 7 PM', status: 'confirmed' },
];

export default function MaleDashboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

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

      {/* Search */}
      <TouchableOpacity style={styles.searchBox} activeOpacity={0.8}>
        <Icon name="search" size={20} color={colors.textLight} />
        <Text style={styles.searchText}>Find your perfect date...</Text>
      </TouchableOpacity>

      {/* Upcoming Date */}
      {upcomingBookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Date</Text>
          {upcomingBookings.map((booking) => (
            <Card key={booking.id} variant="elevated" shadow="sm">
              <View style={styles.bookingRow}>
                <Avatar name={booking.name} size={48} verified />
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingName}>{booking.name}</Text>
                  <Text style={styles.bookingActivity}>{booking.activity}</Text>
                  <View style={styles.bookingMeta}>
                    <Icon name="calendar" size={12} color={colors.textMuted} />
                    <Text style={styles.bookingDate}>{booking.date}</Text>
                  </View>
                </View>
                <Badge text="Confirmed" variant="success" size="sm" />
              </View>
            </Card>
          ))}
        </View>
      )}

      {/* Featured Companions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Companions</Text>
          <TouchableOpacity style={styles.seeAllBtn}>
            <Text style={styles.seeAll}>See All</Text>
            <Icon name="chevron-right" size={16} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.companionsRow}>
            {featuredCompanions.map((companion) => (
              <Card key={companion.id} variant="elevated" shadow="sm" style={styles.companionCard}>
                <Avatar
                  name={companion.name}
                  size={72}
                  verified={companion.verified}
                />
                <Text style={styles.companionName}>
                  {companion.name}, {companion.age}
                </Text>
                <View style={styles.ratingRow}>
                  <Icon name="star" size={14} color={colors.warning} />
                  <Text style={styles.companionRating}>{companion.rating}</Text>
                </View>
                <View style={styles.rateTag}>
                  <Text style={styles.companionRate}>${companion.rate}/hr</Text>
                </View>
              </Card>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Browse by Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Activity</Text>
        <View style={styles.activitiesGrid}>
          <ActivityCard icon="utensils" label="Dinner" count={45} />
          <ActivityCard icon="coffee" label="Coffee" count={38} />
          <ActivityCard icon="theater" label="Events" count={22} />
          <ActivityCard icon="palette" label="Museums" count={18} />
          <ActivityCard icon="wine" label="Drinks" count={32} />
          <ActivityCard icon="footprints" label="Walk" count={28} />
        </View>
      </View>

      {/* How it Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How it Works</Text>
        <Card variant="default" shadow="sm">
          <StepItem number={1} title="Browse" description="Find verified companions" />
          <View style={styles.divider} />
          <StepItem number={2} title="Book" description="Send a date request" />
          <View style={styles.divider} />
          <StepItem number={3} title="Meet" description="Enjoy your premium experience" />
        </Card>
      </View>
    </ScrollView>
  );
}

function ActivityCard({ icon, label, count }: { icon: string; label: string; count: number }) {
  return (
    <TouchableOpacity style={styles.activityCard} activeOpacity={0.7}>
      <View style={styles.activityIconWrap}>
        <Icon name={icon as any} size={22} color={colors.secondary} />
      </View>
      <Text style={styles.activityLabel}>{label}</Text>
      <Text style={styles.activityCount}>{count}</Text>
    </TouchableOpacity>
  );
}

function StepItem({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <View style={styles.stepItem}>
      <View style={styles.stepNumber}>
        <Text style={styles.stepNumberText}>{number}</Text>
      </View>
      <View style={styles.stepInfo}>
        <Text style={styles.stepTitle}>{title}</Text>
        <Text style={styles.stepDescription}>{description}</Text>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  searchText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textLight,
    flex: 1,
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
  bookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  bookingName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  bookingActivity: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bookingMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  bookingDate: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  companionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingRight: spacing.lg,
  },
  companionCard: {
    width: 130,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  companionName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  companionRating: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  rateTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    backgroundColor: colors.secondary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  companionRate: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activityCard: {
    width: '31%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  activityIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  activityLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: 2,
  },
  activityCount: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  stepNumberText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    color: colors.white,
  },
  stepInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  stepTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  stepDescription: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: spacing.sm,
  },
});
