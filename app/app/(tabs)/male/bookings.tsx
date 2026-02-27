import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { showAlert, showConfirm } from '../../../src/utils/alert';
import { Card } from '../../../src/components/Card';
import { UserImage } from '../../../src/components/UserImage';
import { Button } from '../../../src/components/Button';
import { Icon } from '../../../src/components/Icon';
import { EmptyState } from '../../../src/components/EmptyState';
import { useTheme, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { useBookingsStore } from '../../../src/store/bookingsStore';
import { Booking } from '../../../src/services/api';

type TabType = 'upcoming' | 'pending' | 'past';

const filterMap: Record<TabType, 'upcoming' | 'pending' | 'past'> = {
  upcoming: 'upcoming',
  pending: 'pending',
  past: 'past',
};

export default function BookingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  const { bookings = [], isLoading, fetchMyBookings, cancelBooking } = useBookingsStore();

  useEffect(() => {
    fetchMyBookings(filterMap[activeTab]);
  }, [activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyBookings(filterMap[activeTab]);
    setRefreshing(false);
  }, [activeTab]);

  const handleCancelBooking = useCallback((booking: Booking) => {
    showConfirm(
      'Cancel Booking',
      `Are you sure you want to cancel your date with ${booking.companion.name}?`,
      async () => {
        const result = await cancelBooking(booking.id, 'Cancelled by user');
        if (result.success) {
          showAlert('Cancelled', 'Your booking has been cancelled.');
          fetchMyBookings(filterMap[activeTab]);
        } else {
          showAlert('Error', result.error || 'Failed to cancel booking');
        }
      },
      'Yes, Cancel',
      'No'
    );
  }, [activeTab]);

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
      minute: '2-digit'
    });
  };

  const getEmptyDescription = () => {
    switch (activeTab) {
      case 'upcoming': return 'Your confirmed dates will appear here';
      case 'pending': return 'Waiting for companions to accept your requests';
      case 'past': return 'Your date history will be shown here';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>My Bookings</Text>
      </View>

      <View style={styles.tabs}>
        {(['upcoming', 'pending', 'past'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              { backgroundColor: colors.surface },
              activeTab === tab && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab(tab)}
            testID={`bookings-tab-${tab}`}
          >
            <Text style={[
              styles.tabText,
              { color: colors.textSecondary },
              activeTab === tab && { color: colors.white },
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'pending' && bookings.filter(b => b.status === 'pending').length > 0 && ` (${bookings.filter(b => b.status === 'pending').length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {bookings.length === 0 && !isLoading ? (
          <EmptyState
            icon="calendar"
            title={`No ${activeTab} bookings`}
            description={getEmptyDescription()}
          />
        ) : (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              type={activeTab}
              colors={colors}
              onCancel={() => handleCancelBooking(booking)}
              formatDate={formatDate}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface BookingCardProps {
  booking: Booking;
  type: TabType;
  colors: any;
  onCancel: () => void;
  formatDate: (date: string) => string;
}

function BookingCard({ booking, type, colors, onCancel, formatDate }: BookingCardProps) {
  const companion = booking.companion || { name: 'Unknown', photo: null, rating: 0 };
  
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed': return { bg: colors.success + '20', text: colors.success };
      case 'pending': return { bg: colors.warning + '20', text: colors.warning };
      case 'accepted': return { bg: colors.success + '20', text: colors.success };
      case 'cancelled': return { bg: colors.error + '20', text: colors.error };
      case 'completed': return { bg: colors.primary + '20', text: colors.primary };
      case 'paid': return { bg: colors.success + '20', text: colors.success };
      default: return { bg: colors.warning + '20', text: colors.warning };
    }
  };

  const statusStyle = getStatusStyle(booking.status);
  const canCancel = ['pending', 'accepted', 'confirmed'].includes(booking.status);

  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <UserImage name={companion.name} uri={companion.photo} size={56} showVerified />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.text }]}>{companion.name}</Text>
          <Text style={[styles.cardActivity, { color: colors.text }]}>{booking.activity || 'Date'}</Text>
          <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{formatDate(booking.date)} • {booking.duration || 1}h</Text>
        </View>
        <View style={styles.cardAmount}>
          <Text style={[styles.amountValue, { color: colors.primary }]}>${booking.total}</Text>
          {type !== 'past' && (
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {booking.status}
              </Text>
            </View>
          )}
        </View>
      </View>

      {type === 'upcoming' && (
        <View style={styles.actions}>
          {booking.status === 'confirmed' && !booking.isPaid && (
            <Button
              title={`Pay $${booking.total}`}
              onPress={() => router.push(`/payment/${booking.id}`)}
              size="sm"
              style={{ flex: 1 }}
            />
          )}
          {booking.isPaid && (
            <View style={[styles.paidBadge, { backgroundColor: colors.success + '20' }]}>
              <Icon name="check-circle" size={14} color={colors.success} />
              <Text style={[styles.paidText, { color: colors.success }]}>Paid</Text>
            </View>
          )}
          <Button
            title="Message"
            onPress={() => router.push(`/chat/${booking.id}`)}
            variant="outline"
            size="sm"
            style={{ flex: 1 }}
          />
          {canCancel && !booking.isPaid && (
            <Button
              title="Cancel"
              onPress={onCancel}
              variant="outline"
              size="sm"
              style={{ flex: 1, borderColor: colors.error }}
              textStyle={{ color: colors.error }}
            />
          )}
        </View>
      )}

      {type === 'pending' && (
        <View style={styles.pendingInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
            <Icon name="clock" size={16} color={colors.warning} />
            <Text style={[styles.pendingText, { color: colors.textSecondary, marginLeft: spacing.xs }]}>
              Waiting for {companion.name} to accept...
            </Text>
          </View>
          <TouchableOpacity onPress={onCancel} testID={`cancel-booking-${booking.id}`}>
            <Text style={[styles.cancelText, { color: colors.error }]}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
      )}

      {type === 'past' && (
        <View style={[styles.ratingSection, { borderTopColor: colors.border }]}>
          <Text style={[styles.ratingLabel, { color: colors.textSecondary }]}>Rating</Text>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Icon key={i} name="star" size={24} color={i < Number(companion.rating || 0) ? colors.accent : colors.border} />
            ))}
          </View>
          <Button
            title="Leave Review"
            onPress={() => router.push(`/reviews/${booking.id}`)}
            size="sm"
            style={{ marginTop: spacing.sm }}
          />
        </View>
      )}
    </Card>
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
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  cardActivity: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  cardDate: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  cardAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    marginTop: spacing.xs,
  },
  statusText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  pendingInfo: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  pendingText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  cancelText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
  },
  ratingSection: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  ratingLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  paidBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
  },
  paidText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
  },
});
