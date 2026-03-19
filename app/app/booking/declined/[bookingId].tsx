import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { Icon } from '../../../src/components/Icon';
import { UserImage } from '../../../src/components/UserImage';
import { useTheme, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { useBookingsStore } from '../../../src/store/bookingsStore';
import { Booking } from '../../../src/services/api';

export default function DeclinedScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { getBookingById } = useBookingsStore();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId) return;
    getBookingById(bookingId)
      .then((b) => setBooking(b))
      .finally(() => setLoading(false));
  }, [bookingId, getBookingById]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.content}>
        {/* Declined icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.errorLight }]}>
          <Icon name="x" size={48} color={colors.error} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Request Declined</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Unfortunately, {booking?.companion?.name || 'the companion'} wasn't available for this date.
          Don't worry -- there are many other great companions to choose from!
        </Text>

        {/* Booking summary */}
        {booking && (
          <View style={[styles.summaryCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <View style={styles.companionRow}>
              <UserImage
                uri={booking.companion.photo}
                name={booking.companion.name}
                size={48}
              />
              <View style={styles.companionInfo}>
                <Text style={[styles.companionName, { color: colors.text }]}>
                  {booking.companion.name}
                </Text>
                <Text style={[styles.detail, { color: colors.textSecondary }]}>
                  {booking.activity} - {booking.duration}h
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.errorLight }]}>
                <Text style={[styles.statusText, { color: colors.error }]}>Declined</Text>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Bottom actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || spacing.xl }]}>
        <Button
          title="Browse Companions"
          onPress={() => router.replace('/(tabs)/male/browse')}
          style={{ marginBottom: spacing.sm }}
        />
        <Button
          title="View My Bookings"
          onPress={() => router.replace('/(tabs)/male/bookings')}
          variant="outline"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  summaryCard: {
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    width: '100%',
  },
  companionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companionInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  companionName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  detail: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
  },
  bottomBar: {
    padding: spacing.lg,
  },
});
