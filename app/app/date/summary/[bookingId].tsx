import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi, ActiveBooking } from '../../../src/services/activeDateApi';
import { useAuthStore } from '../../../src/store/authStore';
import { colors, typography, shadows } from '../../../src/constants/theme';

const STARS = [1, 2, 3, 4, 5];

export default function DateSummaryScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<ActiveBooking | null>(null);
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);
  const [rating, setRating] = useState(0);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    activeDateApi.getBookingById(bookingId).then(setBooking).catch(() => {});
    activeDateApi.getPhotos(bookingId).then(r => setPhotos(r.photos)).catch(() => {});
  }, [bookingId]);

  const isCompanion = user?.role === 'companion';
  const duration = booking?.actualDurationHours ?? booking?.duration ?? 0;
  const bookedDuration = booking?.duration ?? 0;
  const endedEarly = booking?.actualDurationHours != null && Number(booking.actualDurationHours) < Number(bookedDuration);
  const price = booking?.totalPrice ?? 0;

  // Role-based "With" name: seeker sees companion, companion sees seeker
  const withName = isCompanion ? booking?.seeker?.name : booking?.companion?.name;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Date Complete!</Text>
        {endedEarly && (
          <View style={styles.earlyBadge}>
            <Text style={styles.earlyBadgeText}>Ended Early</Text>
          </View>
        )}
      </View>

      {booking && (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>With</Text>
            <Text style={styles.value}>{withName}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Activity</Text>
            <Text style={styles.value}>{booking.activity?.charAt(0).toUpperCase() + booking.activity?.slice(1)}</Text>
          </View>
          {booking.location && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.label}>Location</Text>
                <Text style={styles.value}>{booking.location}</Text>
              </View>
            </>
          )}
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Duration</Text>
            <Text style={styles.value}>
              {Number(duration).toFixed(2)}h{endedEarly ? ` of ${bookedDuration}h booked` : ''}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={[styles.value, styles.price]}>${Number(price).toFixed(2)}</Text>
          </View>
        </View>
      )}

      {/* Star rating prompt — both seekers and companions can rate */}
      <View style={styles.ratingSection}>
        <Text style={styles.sectionTitle}>How was your date?</Text>
        <View style={styles.starsRow}>
          {STARS.map(star => (
            <TouchableOpacity
              key={star}
              onPress={() => setRating(star)}
              accessibilityLabel={`Rate ${star} star${star > 1 ? 's' : ''}`}
              accessibilityRole="button"
            >
              <Text style={[styles.star, rating >= star && styles.starActive]}>
                {rating >= star ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {photos.length > 0 && (
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>Photos</Text>
          <FlatList
            data={photos}
            horizontal
            keyExtractor={p => p.id}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <Image source={{ uri: item.url }} style={styles.photo} />
            )}
          />
        </View>
      )}

      <TouchableOpacity
        style={styles.reviewBtn}
        onPress={() => router.push(`/reviews/write/${bookingId}` as any)}
        accessibilityLabel="Leave a review"
        accessibilityRole="button"
      >
        <Text style={styles.reviewBtnText}>Leave a Review</Text>
      </TouchableOpacity>

      {/* Book Again — seeker only, navigates to browse tab */}
      {!isCompanion && (
        <TouchableOpacity
          style={styles.bookAgainBtn}
          onPress={() => router.replace('/(tabs)/male/browse' as any)}
          accessibilityLabel="Book again"
          accessibilityRole="button"
        >
          <Text style={styles.bookAgainBtnText}>Book Again</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.homeBtn}
        onPress={() => router.replace('/(tabs)' as any)}
        accessibilityLabel="Back to home"
        accessibilityRole="button"
      >
        <Text style={styles.homeBtnText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 40 },
  banner: { backgroundColor: colors.primaryLight, borderWidth: 2, borderColor: colors.border, padding: 20, alignItems: 'center', marginBottom: 32, ...shadows.md },
  bannerText: { fontSize: 32, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  earlyBadge: { backgroundColor: colors.text, paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  earlyBadgeText: { fontSize: 12, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.primaryLight, letterSpacing: 1 },
  card: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, marginBottom: 32, ...shadows.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  divider: { height: 2, backgroundColor: colors.border },
  label: { fontSize: 14, color: colors.textMuted },
  value: { fontSize: 15, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text, flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  price: { fontSize: 18, color: colors.primary },
  ratingSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text, marginBottom: 12 },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 40, color: colors.textLight },
  starActive: { color: colors.primary },
  photosSection: { marginBottom: 32 },
  photo: { width: 120, height: 120, borderWidth: 2, borderColor: colors.border, marginRight: 12 },
  reviewBtn: { backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.border, paddingVertical: 18, alignItems: 'center', marginBottom: 12, ...shadows.md },
  reviewBtnText: { fontSize: 18, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.textInverse },
  bookAgainBtn: { backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.border, paddingVertical: 16, alignItems: 'center', marginBottom: 12, ...shadows.sm },
  bookAgainBtnText: { fontSize: 16, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  homeBtn: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, paddingVertical: 16, alignItems: 'center' },
  homeBtnText: { fontSize: 16, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
});
