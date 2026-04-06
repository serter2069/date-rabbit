import React, { useEffect, useRef, useState, useCallback } from 'react';
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

const POLL_INTERVAL = 2_000; // 2 seconds

export default function RequestSentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { getBookingById, cancelBooking } = useBookingsStore();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBooking = useCallback(async () => {
    if (!bookingId) return;
    const b = await getBookingById(bookingId);
    if (!b) {
      setFetchError('Failed to load booking. Please try again.');
      setLoading(false);
      return;
    }
    setFetchError(null);
    setBooking(b);
    setLoading(false);

    if (b.status === 'accepted' || b.status === 'confirmed') {
      // Companion accepted - navigate to payment
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      router.replace(`/payment/${bookingId}`);
    } else if (b.status === 'declined') {
      // Companion declined - navigate to declined screen
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      router.replace(`/booking/declined/${bookingId}`);
    } else if (b.status === 'cancelled') {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
      router.replace('/(tabs)/male/bookings');
    }
  }, [bookingId, getBookingById]);

  useEffect(() => {
    fetchBooking();

    // Poll for status updates
    pollRef.current = setInterval(fetchBooking, POLL_INTERVAL);

    // Elapsed time counter
    timerRef.current = setInterval(() => {
      setElapsedMinutes((prev) => prev + 1);
    }, 60_000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchBooking]);

  const handleCancel = async () => {
    if (!bookingId) return;
    setCancelling(true);
    const result = await cancelBooking(bookingId, 'Cancelled by seeker');
    setCancelling(false);
    if (result.success) {
      router.replace('/(tabs)/male/bookings');
    }
  };

  const formatElapsed = () => {
    if (elapsedMinutes < 1) return 'Just now';
    if (elapsedMinutes === 1) return '1 minute ago';
    if (elapsedMinutes < 60) return `${elapsedMinutes} minutes ago`;
    const hours = Math.floor(elapsedMinutes / 60);
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (fetchError) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <View style={[styles.errorIcon, { backgroundColor: colors.error + '20' }]}>
          <Icon name="alert" size={48} color={colors.error} />
        </View>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Could Not Load Booking</Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{fetchError}</Text>
        <Button
          title="Try Again"
          onPress={fetchBooking}
          variant="outline"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.xl }]}>
      <View style={styles.content}>
        {/* Animated pulse icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
          <View style={[styles.iconInner, { backgroundColor: colors.primary + '25' }]}>
            <Icon name="send" size={40} color={colors.primary} />
          </View>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Request Sent!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your date request has been sent. We'll notify you when they respond.
        </Text>

        {/* Companion info card */}
        {booking && (
          <View style={[styles.companionCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <UserImage
              uri={booking.companion.photo}
              name={booking.companion.name}
              size={56}
            />
            <View style={styles.companionInfo}>
              <Text style={[styles.companionName, { color: colors.text }]}>
                {booking.companion.name}
              </Text>
              <Text style={[styles.bookingDetail, { color: colors.textSecondary }]}>
                {booking.activity} - {booking.duration}h
              </Text>
              <Text style={[styles.bookingDetail, { color: colors.textSecondary }]}>
                ${booking.total} total
              </Text>
            </View>
          </View>
        )}

        {/* Waiting indicator */}
        <View style={[styles.waitingRow, { backgroundColor: colors.white, borderColor: colors.border }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <View style={styles.waitingInfo}>
            <Text style={[styles.waitingLabel, { color: colors.text }]}>Waiting for response</Text>
            <Text style={[styles.waitingTime, { color: colors.textSecondary }]}>
              Sent {formatElapsed()}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || spacing.xl }]}>
        <Button
          title="View My Bookings"
          onPress={() => router.replace('/(tabs)/male/bookings')}
          style={{ marginBottom: spacing.sm }}
        />
        <Button
          title={cancelling ? 'Cancelling...' : 'Cancel Request'}
          onPress={handleCancel}
          variant="outline"
          disabled={cancelling}
          loading={cancelling}
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
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  iconInner: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
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
  companionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    width: '100%',
    marginBottom: spacing.lg,
  },
  companionInfo: {
    marginLeft: spacing.md,
    flex: 1,
  },
  companionName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.xs,
  },
  bookingDetail: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    width: '100%',
  },
  waitingInfo: {
    marginLeft: spacing.md,
  },
  waitingLabel: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  waitingTime: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  bottomBar: {
    padding: spacing.lg,
  },
  errorIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  errorTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
});
