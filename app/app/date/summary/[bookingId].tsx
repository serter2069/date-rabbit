import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi, ActiveBooking } from '../../../src/services/activeDateApi';
import { useAuthStore } from '../../../src/store/authStore';

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
  container: { flex: 1, backgroundColor: '#F4F0EA' },
  content: { padding: 24, paddingTop: 40 },
  banner: { backgroundColor: '#FF5A85', borderWidth: 2, borderColor: '#000', padding: 20, alignItems: 'center', marginBottom: 32, shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  bannerText: { fontSize: 32, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  earlyBadge: { backgroundColor: '#000', paddingHorizontal: 12, paddingVertical: 4, marginTop: 8 },
  earlyBadgeText: { fontSize: 12, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#FF5A85', letterSpacing: 1 },
  card: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', marginBottom: 32, shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  divider: { height: 2, backgroundColor: '#000' },
  label: { fontSize: 14, color: '#555' },
  value: { fontSize: 15, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', flexShrink: 1, textAlign: 'right', marginLeft: 8 },
  price: { fontSize: 18, color: '#FF2A5F' },
  ratingSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', marginBottom: 12 },
  starsRow: { flexDirection: 'row', gap: 8 },
  star: { fontSize: 40, color: '#ccc' },
  starActive: { color: '#FF2A5F' },
  photosSection: { marginBottom: 32 },
  photo: { width: 120, height: 120, borderWidth: 2, borderColor: '#000', marginRight: 12 },
  reviewBtn: { backgroundColor: '#FF2A5F', borderWidth: 2, borderColor: '#000', paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  reviewBtnText: { fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#fff' },
  bookAgainBtn: { backgroundColor: '#4DF0FF', borderWidth: 2, borderColor: '#000', paddingVertical: 16, alignItems: 'center', marginBottom: 12, shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  bookAgainBtnText: { fontSize: 16, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  homeBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', paddingVertical: 16, alignItems: 'center' },
  homeBtnText: { fontSize: 16, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
});
