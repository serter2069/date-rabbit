import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, FlatList } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi, ActiveBooking } from '../../../src/services/activeDateApi';

export default function DateSummaryScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<ActiveBooking | null>(null);
  const [photos, setPhotos] = useState<{ id: string; url: string }[]>([]);

  useEffect(() => {
    activeDateApi.getBookingById(bookingId).then(setBooking).catch(() => {});
    activeDateApi.getPhotos(bookingId).then(r => setPhotos(r.photos)).catch(() => {});
  }, [bookingId]);

  const duration = booking?.actualDurationHours ?? booking?.duration ?? 0;
  const price = booking?.totalPrice ?? 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.banner}>
        <Text style={styles.bannerText}>Date Complete!</Text>
      </View>

      {booking && (
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>With</Text>
            <Text style={styles.value}>{booking.companion?.name}</Text>
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
            <Text style={styles.value}>{duration}h</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={[styles.value, styles.price]}>${Number(price).toFixed(2)}</Text>
          </View>
        </View>
      )}

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
  card: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', marginBottom: 32, shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 16 },
  divider: { height: 2, backgroundColor: '#000' },
  label: { fontSize: 14, color: '#555' },
  value: { fontSize: 15, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  price: { fontSize: 18, color: '#FF2A5F' },
  photosSection: { marginBottom: 32 },
  sectionTitle: { fontSize: 20, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', marginBottom: 12 },
  photo: { width: 120, height: 120, borderWidth: 2, borderColor: '#000', marginRight: 12 },
  reviewBtn: { backgroundColor: '#FF2A5F', borderWidth: 2, borderColor: '#000', paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  reviewBtnText: { fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#fff' },
  homeBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', paddingVertical: 16, alignItems: 'center' },
  homeBtnText: { fontSize: 16, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
});
