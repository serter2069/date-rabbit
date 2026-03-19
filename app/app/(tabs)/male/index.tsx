import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Platform,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/authStore';
import { Card } from '../../../src/components/Card';
import { Avatar } from '../../../src/components/Avatar';
import { UserImage } from '../../../src/components/UserImage';
import { Badge } from '../../../src/components/Badge';
import { Icon } from '../../../src/components/Icon';
import { EmptyState } from '../../../src/components/EmptyState';
import { useTheme, spacing, typography, borderRadius, PAGE_PADDING } from '../../../src/constants/theme';
import { bookingsApi, companionsApi, Booking, CompanionListItem } from '../../../src/services/api';

// Breakpoint for switching between mobile scroll and web grid
const WEB_GRID_BREAKPOINT = 768;
const CARD_WIDTH = 130;
const CARD_GAP = spacing.md;

export default function MaleDashboard() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const { width: screenWidth } = useWindowDimensions();
  const isWideScreen = Platform.OS === 'web' && screenWidth >= WEB_GRID_BREAKPOINT;

  // Data state
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [featuredCompanions, setFeaturedCompanions] = useState<CompanionListItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [loadingCompanions, setLoadingCompanions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUpcomingBookings = useCallback(async () => {
    try {
      const response = await bookingsApi.getMyBookings('upcoming');
      setUpcomingBookings(response.bookings.slice(0, 3));
    } catch (err) {
      console.error('Failed to fetch upcoming bookings:', err);
      setUpcomingBookings([]);
    }
  }, []);

  const fetchFeaturedCompanions = useCallback(async () => {
    try {
      const response = await companionsApi.search({
        sortBy: 'rating',
        limit: 6,
      });
      setFeaturedCompanions(response.companions);
    } catch (err) {
      console.error('Failed to fetch featured companions:', err);
      setFeaturedCompanions([]);
    }
  }, []);

  useEffect(() => {
    setLoadingBookings(true);
    setLoadingCompanions(true);
    fetchUpcomingBookings().finally(() => setLoadingBookings(false));
    fetchFeaturedCompanions().finally(() => setLoadingCompanions(false));
  }, [fetchUpcomingBookings, fetchFeaturedCompanions]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchUpcomingBookings(), fetchFeaturedCompanions()]);
    setRefreshing(false);
  }, [fetchUpcomingBookings, fetchFeaturedCompanions]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    if (date.toDateString() === now.toDateString()) {
      return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'pink' | 'gray' => {
    switch (status) {
      case 'confirmed': return 'success';
      case 'pending': return 'warning';
      case 'accepted': return 'success';
      case 'cancelled': return 'pink';
      default: return 'gray';
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: colors.textMuted }]}>Welcome back,</Text>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
        </View>
        <Avatar
          uri={user?.photos?.[0]?.url}
          name={user?.name}
          size={52}
          verified={user?.isVerified}
        />
      </View>

      {/* Search */}
      <TouchableOpacity
        style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.black }]}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/male/browse')}
      >
        <Icon name="search" size={20} color={colors.textLight} />
        <Text style={[styles.searchText, { color: colors.textLight }]}>Find your perfect date...</Text>
      </TouchableOpacity>

      {/* Upcoming Date */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Upcoming Date</Text>
        {loadingBookings ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: spacing.lg }} />
        ) : upcomingBookings.length === 0 ? (
          <Card variant="elevated" shadow="sm">
            <View style={styles.emptyBookingRow}>
              <Icon name="calendar" size={24} color={colors.textMuted} />
              <View style={styles.emptyBookingInfo}>
                <Text style={[styles.emptyBookingTitle, { color: colors.textSecondary }]}>No upcoming dates</Text>
                <Text style={[styles.emptyBookingDesc, { color: colors.textMuted }]}>
                  Browse companions to book your first date
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.ctaButton, { backgroundColor: colors.primary, borderColor: colors.border }]}
              activeOpacity={0.8}
              onPress={() => router.push('/(tabs)/male/browse')}
            >
              <Text style={[styles.ctaButtonText, { color: colors.textInverse }]}>Browse Companions</Text>
            </TouchableOpacity>
          </Card>
        ) : (
          upcomingBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              activeOpacity={0.8}
              onPress={() => router.push(`/booking/${booking.id}`)}
            >
              <Card variant="elevated" shadow="sm" style={styles.bookingCard}>
                <View style={styles.bookingRow}>
                  <UserImage
                    name={booking.companion?.name}
                    uri={booking.companion?.photo}
                    size={48}
                    showVerified
                  />
                  <View style={styles.bookingInfo}>
                    <Text style={[styles.bookingName, { color: colors.text }]}>{booking.companion?.name}</Text>
                    <Text style={[styles.bookingActivity, { color: colors.textSecondary }]}>
                      {booking.activity || 'Date'}
                    </Text>
                    <View style={styles.bookingMeta}>
                      <Icon name="calendar" size={12} color={colors.textMuted} />
                      <Text style={[styles.bookingDate, { color: colors.textMuted }]}>
                        {formatDate(booking.date)}
                      </Text>
                    </View>
                  </View>
                  <Badge
                    text={booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    variant={getStatusVariant(booking.status)}
                    size="sm"
                  />
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Featured Companions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Featured Companions</Text>
          <TouchableOpacity
            style={styles.seeAllBtn}
            onPress={() => router.push('/(tabs)/male/browse')}
          >
            <Text style={[styles.seeAll, { color: colors.secondary }]}>See All</Text>
            <Icon name="chevron-right" size={16} color={colors.secondary} />
          </TouchableOpacity>
        </View>

        {loadingCompanions ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ paddingVertical: spacing.lg }} />
        ) : featuredCompanions.length === 0 ? (
          <Card variant="elevated" shadow="sm">
            <View style={styles.emptyBookingRow}>
              <Icon name="users" size={24} color={colors.textMuted} />
              <View style={styles.emptyBookingInfo}>
                <Text style={[styles.emptyBookingTitle, { color: colors.textSecondary }]}>No companions available</Text>
                <Text style={[styles.emptyBookingDesc, { color: colors.textMuted }]}>
                  Check back soon for new companions
                </Text>
              </View>
            </View>
          </Card>
        ) : isWideScreen ? (
          <CompanionsGrid companions={featuredCompanions} colors={colors} />
        ) : (
          <CompanionsCarousel companions={featuredCompanions} colors={colors} />
        )}
      </View>

      {/* Browse by Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Browse by Activity</Text>
        <View style={styles.activitiesGrid}>
          <ActivityCard icon="utensils" label="Dinner" colors={colors} />
          <ActivityCard icon="coffee" label="Coffee" colors={colors} />
          <ActivityCard icon="theater" label="Events" colors={colors} />
          <ActivityCard icon="palette" label="Museums" colors={colors} />
          <ActivityCard icon="wine" label="Drinks" colors={colors} />
          <ActivityCard icon="footprints" label="Walk" colors={colors} />
        </View>
      </View>

    </ScrollView>
  );
}

// Web: responsive grid that wraps cards naturally
function CompanionsGrid({ companions, colors }: { companions: CompanionListItem[]; colors: any }) {
  return (
    <View style={styles.companionsGrid}>
      {companions.map((companion) => (
        <CompanionCardItem key={companion.id} companion={companion} colors={colors} />
      ))}
    </View>
  );
}

// Mobile: horizontal scroll with snap, partial peek, and pagination dots
function CompanionsCarousel({ companions, colors }: { companions: CompanionListItem[]; colors: any }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
    setActiveIndex(Math.min(Math.max(index, 0), companions.length - 1));
  }, [companions.length]);

  return (
    <View>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + CARD_GAP}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carouselContent}
      >
        {companions.map((companion) => (
          <CompanionCardItem key={companion.id} companion={companion} colors={colors} />
        ))}
        {/* Peek spacer: ensures last card can scroll fully into view */}
        <View style={{ width: spacing.lg }} />
      </ScrollView>

      {/* Pagination dots */}
      {companions.length > 1 && (
        <View style={styles.paginationDots}>
          {companions.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { backgroundColor: colors.borderLight, borderColor: colors.border },
                index === activeIndex && [styles.dotActive, { backgroundColor: colors.primary, borderColor: colors.text }],
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function CompanionCardItem({ companion, colors }: { companion: CompanionListItem; colors: any }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => router.push({ pathname: '/profile/[id]', params: { id: companion.id } })}
    >
      <Card variant="elevated" shadow="sm" style={styles.companionCard}>
        <UserImage
          name={companion.name}
          uri={companion.primaryPhoto}
          size={72}
          showVerified={companion.isVerified}
        />
        <Text style={[styles.companionName, { color: colors.text }]}>
          {companion.name}{companion.age ? `, ${companion.age}` : ''}
        </Text>
        <View style={styles.ratingRow}>
          <Icon name="star" size={14} color={colors.warning} />
          <Text style={[styles.companionRating, { color: colors.textSecondary }]}>
            {Number(companion.rating).toFixed(1)}
          </Text>
        </View>
        <View style={[styles.rateTag, { backgroundColor: colors.secondary, borderColor: colors.border }]}>
          <Text style={[styles.companionRate, { color: colors.text }]}>${companion.hourlyRate}/hr</Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

function ActivityCard({ icon, label, colors }: { icon: string; label: string; colors: any }) {
  return (
    <TouchableOpacity
      style={[styles.activityCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
      activeOpacity={0.7}
      onPress={() => router.push('/(tabs)/male/browse')}
    >
      <View style={[styles.activityIconWrap, { backgroundColor: colors.background }]}>
        <Icon name={icon as any} size={22} color={colors.secondary} />
      </View>
      <Text style={[styles.activityLabel, { color: colors.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: 2,
  },
  name: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    marginBottom: spacing.xl,
    borderWidth: 3,
  },
  searchText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
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
  },
  bookingCard: {
    marginBottom: spacing.sm,
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
  },
  bookingActivity: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
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
  },
  emptyBookingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  emptyBookingInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  emptyBookingTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  emptyBookingDesc: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  // Web: responsive grid layout showing all cards
  companionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
  },
  // Mobile: horizontal carousel
  carouselContent: {
    paddingRight: spacing.lg,
    gap: CARD_GAP,
  },
  // Pagination dots for mobile carousel
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1.5,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  companionCard: {
    width: CARD_WIDTH,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  companionName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
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
  },
  rateTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginTop: spacing.sm,
    borderWidth: 2,
  },
  companionRate: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activityCard: {
    width: '31%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  activityIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  activityLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    marginBottom: 2,
  },
  ctaButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm + 4,
    borderRadius: borderRadius.sm,
    borderWidth: 3,
    alignItems: 'center',
  },
  ctaButtonText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
  },
});
