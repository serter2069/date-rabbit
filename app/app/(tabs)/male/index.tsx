import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../../../src/store/authStore';
import { Card } from '../../../src/components/Card';
import { Avatar } from '../../../src/components/Avatar';
import { colors, spacing, typography, borderRadius } from '../../../src/constants/theme';

const featuredCompanions = [
  { id: '1', name: 'Sarah', age: 28, rating: 4.9, rate: 100, verified: true },
  { id: '2', name: 'Emma', age: 25, rating: 4.8, rate: 85, verified: true },
  { id: '3', name: 'Olivia', age: 30, rating: 5.0, rate: 120, verified: true },
];

const upcomingBookings = [
  { id: '1', name: 'Sarah', activity: 'Dinner at Nobu', date: 'Tomorrow, 7 PM', status: 'confirmed' },
];

export default function MaleDashboard() {
  const { user } = useAuthStore();

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

      <TouchableOpacity style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchText}>Find your perfect date...</Text>
      </TouchableOpacity>

      {upcomingBookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Date</Text>
          {upcomingBookings.map((booking) => (
            <Card key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingRow}>
                <Avatar name={booking.name} size={48} verified />
                <View style={styles.bookingInfo}>
                  <Text style={styles.bookingName}>{booking.name}</Text>
                  <Text style={styles.bookingActivity}>{booking.activity}</Text>
                  <Text style={styles.bookingDate}>{booking.date}</Text>
                </View>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>Confirmed</Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Companions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.companionsRow}>
            {featuredCompanions.map((companion) => (
              <Card key={companion.id} style={styles.companionCard}>
                <Avatar
                  name={companion.name}
                  size={80}
                  verified={companion.verified}
                />
                <Text style={styles.companionName}>
                  {companion.name}, {companion.age}
                </Text>
                <Text style={styles.companionRating}>
                  ⭐ {companion.rating}
                </Text>
                <Text style={styles.companionRate}>
                  ${companion.rate}/hr
                </Text>
              </Card>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Browse by Activity</Text>
        <View style={styles.activitiesGrid}>
          <ActivityCard emoji="🍽️" label="Dinner" count={45} />
          <ActivityCard emoji="☕" label="Coffee" count={38} />
          <ActivityCard emoji="🎭" label="Events" count={22} />
          <ActivityCard emoji="🎨" label="Museums" count={18} />
          <ActivityCard emoji="🍸" label="Drinks" count={32} />
          <ActivityCard emoji="🚶" label="Walk" count={28} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How it Works</Text>
        <Card>
          <StepItem number="1" title="Browse" description="Find verified companions" />
          <View style={styles.divider} />
          <StepItem number="2" title="Book" description="Send a date request" />
          <View style={styles.divider} />
          <StepItem number="3" title="Meet" description="Enjoy your premium experience" />
        </Card>
      </View>
    </ScrollView>
  );
}

function ActivityCard({ emoji, label, count }: { emoji: string; label: string; count: number }) {
  return (
    <TouchableOpacity style={styles.activityCard}>
      <Text style={styles.activityEmoji}>{emoji}</Text>
      <Text style={styles.activityLabel}>{label}</Text>
      <Text style={styles.activityCount}>{count} available</Text>
    </TouchableOpacity>
  );
}

function StepItem({ number, title, description }: { number: string; title: string; description: string }) {
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
    padding: spacing.lg,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  searchText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
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
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  bookingCard: {
    marginBottom: spacing.md,
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
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  bookingActivity: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  bookingDate: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    color: colors.success,
    fontWeight: '500',
  },
  companionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  companionCard: {
    width: 140,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  companionName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.sm,
  },
  companionRating: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  companionRate: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.primary,
    marginTop: spacing.xs,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  activityCard: {
    width: '30%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityEmoji: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  activityLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    color: colors.text,
  },
  activityCount: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.white,
  },
  stepInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  stepTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  stepDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
});
