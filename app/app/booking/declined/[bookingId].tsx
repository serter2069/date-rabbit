import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../../src/components/Button';
import { Icon } from '../../../src/components/Icon';
import { UserImage } from '../../../src/components/UserImage';
import { useTheme, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { useBookingsStore } from '../../../src/store/bookingsStore';
import { Booking, companionsApi, CompanionListItem } from '../../../src/services/api';

export default function DeclinedScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { getBookingById } = useBookingsStore();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [similarCompanions, setSimilarCompanions] = useState<CompanionListItem[]>([]);

  useEffect(() => {
    if (!bookingId) return;
    getBookingById(bookingId)
      .then((b) => {
        setBooking(b);
        // Fetch similar companions after loading booking
        companionsApi.search({ limit: 2 }).then((res) => {
          // Exclude the declined companion
          const filtered = res.companions.filter((c) => c.id !== b?.companion?.id);
          setSimilarCompanions(filtered.slice(0, 2));
        }).catch(() => {});
      })
      .finally(() => setLoading(false));
  }, [bookingId, getBookingById]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const refundAmount = booking?.total ?? 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Declined icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.errorLight }]}>
          <Icon name="x" size={48} color={colors.error} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Request Declined</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {booking?.companion?.name || 'The companion'} is unavailable for this date.
        </Text>

        {/* Decline reason */}
        {booking?.cancellationReason ? (
          <View style={[styles.reasonCard, { backgroundColor: colors.errorLight, borderColor: colors.error }]}>
            <Text style={[styles.reasonLabel, { color: colors.error }]}>Reason</Text>
            <Text style={[styles.reasonText, { color: colors.text }]}>{booking.cancellationReason}</Text>
          </View>
        ) : null}

        {/* Refund info */}
        {refundAmount > 0 ? (
          <View style={[styles.refundCard, { backgroundColor: colors.white, borderColor: colors.border }]}>
            <View style={styles.refundRow}>
              <Text style={[styles.refundLabel, { color: colors.textSecondary }]}>Original hold</Text>
              <Text style={[styles.refundValue, { color: colors.text }]}>${refundAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.refundRow}>
              <Text style={[styles.refundLabel, { color: colors.textSecondary }]}>Refunded</Text>
              <Text style={[styles.refundValue, { color: colors.success || '#10B981' }]}>${refundAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.refundDivider, { borderColor: colors.border }]} />
            <View style={styles.refundTimeline}>
              <Icon name="clock" size={14} color={colors.textSecondary} />
              <Text style={[styles.refundTimelineText, { color: colors.textSecondary }]}>
                Refund in 3–5 business days
              </Text>
            </View>
          </View>
        ) : null}

        {/* Similar companions */}
        {similarCompanions.length > 0 ? (
          <View style={styles.similarSection}>
            <Text style={[styles.similarLabel, { color: colors.textSecondary }]}>
              SIMILAR COMPANIONS AVAILABLE
            </Text>
            <View style={styles.similarRow}>
              {similarCompanions.map((companion) => (
                <TouchableOpacity
                  key={companion.id}
                  style={[styles.companionCard, { backgroundColor: colors.white, borderColor: colors.border }]}
                  onPress={() => router.push(`/companion/${companion.id}`)}
                  activeOpacity={0.8}
                >
                  <UserImage
                    uri={companion.primaryPhoto}
                    name={companion.name}
                    size={44}
                  />
                  <Text style={[styles.companionName, { color: colors.text }]} numberOfLines={1}>
                    {companion.name}
                  </Text>
                  <Text style={[styles.companionRate, { color: colors.primary }]}>
                    ${companion.hourlyRate}/h
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom actions */}
      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || spacing.xl, borderTopColor: colors.border }]}>
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
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
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
    marginBottom: spacing.lg,
  },
  reasonCard: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  reasonLabel: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  reasonText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  refundCard: {
    width: '100%',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    marginBottom: spacing.lg,
  },
  refundRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  refundLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  refundValue: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
  },
  refundDivider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    marginBottom: spacing.sm,
  },
  refundTimeline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  refundTimelineText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    marginLeft: spacing.xs,
  },
  similarSection: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  similarLabel: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  similarRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  companionCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    alignItems: 'center',
  },
  companionName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
  },
  companionRate: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  bottomBar: {
    padding: spacing.lg,
    borderTopWidth: 1,
  },
});
