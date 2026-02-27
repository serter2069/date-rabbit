import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { UserImage } from '../../src/components/UserImage';
import { StripePaymentForm } from '../../src/components/StripePaymentForm';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import { useEarningsStore } from '../../src/store/earningsStore';
import { useBookingsStore } from '../../src/store/bookingsStore';
import { showAlert } from '../../src/utils/alert';

export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();
  const { createPaymentIntent } = useEarningsStore();
  const { bookings, fetchMyBookings } = useBookingsStore();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const booking = bookings.find((b) => b.id === bookingId);

  useEffect(() => {
    const init = async () => {
      if (!bookingId) return;

      // Fetch bookings if we don't have them
      if (!booking) {
        await fetchMyBookings('upcoming');
      }

      // Create payment intent
      const result = await createPaymentIntent(bookingId);
      if (result.success && result.clientSecret) {
        setClientSecret(result.clientSecret);
      } else {
        setError(result.error || 'Failed to initialize payment');
      }
      setLoading(false);
    };

    init();
  }, [bookingId]);

  const handlePaymentSuccess = () => {
    showAlert('Payment Successful!', 'Your booking has been paid. Have a great time!');
    fetchMyBookings('upcoming');
    router.back();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Setting up payment...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center, { backgroundColor: colors.background }]}>
        <View style={[styles.errorIcon, { backgroundColor: colors.error + '20' }]}>
          <Icon name="alert-circle" size={48} color={colors.error} />
        </View>
        <Text style={[styles.errorTitle, { color: colors.text }]}>Payment Error</Text>
        <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
          style={{ marginTop: spacing.lg }}
        />
      </View>
    );
  }

  const companion = booking?.companion || { name: 'Companion', photo: undefined };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Button
          title="Back"
          onPress={() => router.back()}
          variant="outline"
          size="sm"
          icon="arrow-left"
        />
        <Text style={[styles.title, { color: colors.text }]}>Payment</Text>
        <View style={{ width: 70 }} />
      </View>

      {/* Booking Summary */}
      {booking && (
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <UserImage name={companion.name} uri={companion.photo} size={56} />
            <View style={styles.summaryInfo}>
              <Text style={[styles.companionName, { color: colors.text }]}>{companion.name}</Text>
              <Text style={[styles.activityText, { color: colors.textSecondary }]}>
                {booking.activity || 'Date'}
              </Text>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>
                {new Date(booking.date).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
                {' '}&bull; {booking.duration || 1}h
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { borderBottomColor: colors.border + '30' }]} />

          {/* Price Breakdown */}
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>
              ${booking.hourlyRate}/hr &times; {booking.duration || 1}h
            </Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              ${booking.subtotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={[styles.priceLabel, { color: colors.textSecondary }]}>Platform fee</Text>
            <Text style={[styles.priceValue, { color: colors.text }]}>
              ${booking.platformFee.toFixed(2)}
            </Text>
          </View>
          <View style={[styles.divider, { borderBottomColor: colors.border + '30' }]} />
          <View style={styles.priceRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>
              ${booking.total.toFixed(2)}
            </Text>
          </View>
        </Card>
      )}

      {/* Payment Form */}
      <View style={styles.paymentSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Details</Text>
        {clientSecret && booking && (
          <StripePaymentForm
            clientSecret={clientSecret}
            amount={booking.total}
            onSuccess={handlePaymentSuccess}
          />
        )}

        {Platform.OS !== 'web' && (
          <Card style={[styles.nativeNotice, { backgroundColor: colors.warning + '15' }]}>
            <Icon name="globe" size={20} color={colors.warning} />
            <Text style={[styles.nativeNoticeText, { color: colors.textSecondary }]}>
              To pay, please open DateRabbit in your web browser.
            </Text>
          </Card>
        )}
      </View>

      {/* Security Notice */}
      <View style={styles.securityRow}>
        <Icon name="lock" size={14} color={colors.textMuted} />
        <Text style={[styles.securityText, { color: colors.textMuted }]}>
          Payments processed securely by Stripe
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  summaryInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  companionName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.lg,
  },
  activityText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  dateText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  divider: {
    borderBottomWidth: 1,
    marginVertical: spacing.md,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  priceLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  priceValue: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
  },
  totalLabel: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
  },
  totalValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
  },
  paymentSection: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.md,
  },
  nativeNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  nativeNoticeText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    flex: 1,
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  securityText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
  },
  loadingText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    marginTop: spacing.md,
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
