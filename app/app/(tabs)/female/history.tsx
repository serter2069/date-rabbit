import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../../../src/components/Card';
import { UserImage } from '../../../../src/components/UserImage';
import { Icon } from '../../../../src/components/Icon';
import { useTheme, spacing, typography, borderRadius } from '../../../../src/constants/theme';
import { bookingsApi, Booking } from '../../../../src/services/api';

export default function CompanionHistoryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (pageNum: number, isRefresh = false) => {
    setFetchError(null);
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum > 1) {
        setLoadingMore(true);
      }

      const response = await bookingsApi.getMyBookings('past', pageNum);
      const fetched = response.bookings;

      if (isRefresh || pageNum === 1) {
        setBookings(fetched);
      } else {
        setBookings((prev) => [...prev, ...fetched]);
      }

      const pages = Math.max(1, Math.ceil(response.total / 20));
      setTotalPages(pages);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to fetch past bookings:', error);
      setFetchError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings(1);
  }, [fetchBookings]);

  const handleRefresh = () => {
    fetchBookings(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && page < totalPages) {
      fetchBookings(page + 1);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEarnings = (item: Booking): number => {
    if (item.companionEarnings != null) return item.companionEarnings;
    const amount = item.total ?? 0;
    const platform = (item as any).platformFee ?? 0;
    return Math.max(0, amount - platform);
  };

  const renderItem = ({ item }: { item: Booking }) => {
    const seeker = item.seeker ?? { name: 'Unknown', photo: undefined };
    const earnings = getEarnings(item);

    return (
      <TouchableOpacity
        onPress={() => router.push(`/booking/${item.id}`)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`View date with ${seeker.name}`}
      >
        <Card style={styles.card}>
          <View style={styles.cardRow}>
            <UserImage name={seeker.name} uri={seeker.photo} size={52} />
            <View style={styles.cardInfo}>
              <Text style={[styles.seekerName, { color: colors.text }]}>{seeker.name}</Text>
              <Text style={[styles.activity, { color: colors.textSecondary }]}>
                {item.activity || 'Date'} • {item.duration || 1}h
              </Text>
              <Text style={[styles.dateText, { color: colors.textMuted }]}>
                {formatDate(item.date)}
              </Text>
            </View>
            <View style={styles.cardRight}>
              <Text style={[styles.earnings, { color: colors.success }]}>
                +${earnings.toFixed(2)}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: colors.success + '20' }]}>
                <Text style={[styles.statusText, { color: colors.success }]}>completed</Text>
              </View>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="calendar" size={64} color={colors.textSecondary} />
        <Text style={[styles.emptyTitle, { color: colors.text }]}>No completed dates yet</Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Your date history will appear here
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>History</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : fetchError ? (
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={64} color={colors.error} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Something went wrong</Text>
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>{fetchError}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={() => fetchBookings(1)}
            accessibilityRole="button"
            accessibilityLabel="Try again"
          >
            <Text style={[styles.retryButtonText, { color: colors.white }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    flexGrow: 1,
  },
  card: {
    marginBottom: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  seekerName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  activity: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  dateText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  earnings: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  statusText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    textTransform: 'capitalize',
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  errorTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
});
