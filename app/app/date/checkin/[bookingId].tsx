import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi, ActiveBooking } from '../../../src/services/activeDateApi';

export default function SeekerCheckinScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<ActiveBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const loadBooking = useCallback(async () => {
    try {
      const data = await activeDateApi.getBookingById(bookingId);
      setBooking(data);
      if (data.status === 'active') {
        router.replace(`/date/active/${bookingId}`);
      }
    } catch (e) {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBooking();
  }, [loadBooking]);

  // Poll every 5 seconds after seeker checked in
  useEffect(() => {
    if (!checkedIn) return;
    const interval = setInterval(async () => {
      try {
        const data = await activeDateApi.getBookingById(bookingId);
        if (data.status === 'active') {
          clearInterval(interval);
          router.replace(`/date/active/${bookingId}`);
        }
      } catch (e) {}
    }, 5000);
    return () => clearInterval(interval);
  }, [checkedIn, bookingId]);

  const handleCheckin = async () => {
    setCheckingIn(true);
    try {
      const updated = await activeDateApi.seekerCheckin(bookingId);
      setBooking(updated);
      if (updated.status === 'active') {
        router.replace(`/date/active/${bookingId}`);
      } else {
        setCheckedIn(true);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#FF2A5F" />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Time to{'\n'}Check In</Text>

      {booking?.location && (
        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>Meeting at</Text>
          <Text style={styles.locationText}>{booking.location}</Text>
        </View>
      )}

      <View style={styles.pinIcon}>
        <Text style={styles.pinEmoji}>📍</Text>
      </View>

      {!checkedIn ? (
        <TouchableOpacity
          style={[styles.button, checkingIn && styles.buttonDisabled]}
          onPress={handleCheckin}
          disabled={checkingIn}
        >
          {checkingIn
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>I'm Here</Text>
          }
        </TouchableOpacity>
      ) : (
        <View style={styles.waitingCard}>
          <Text style={styles.waitingText}>You're checked in!</Text>
          <Text style={styles.waitingSubtext}>Waiting for {booking?.companion?.name ?? 'your companion'} to check in...</Text>
          <ActivityIndicator color="#FF2A5F" style={{ marginTop: 16 }} />
        </View>
      )}

      {booking && (
        <View style={styles.statusRow}>
          <View style={[styles.dot, booking.seekerCheckinAt ? styles.dotGreen : styles.dotGray]} />
          <Text style={styles.statusName}>You</Text>
          <View style={[styles.dot, booking.companionCheckinAt ? styles.dotGreen : styles.dotGray, { marginLeft: 24 }]} />
          <Text style={styles.statusName}>{booking.companion?.name}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA', padding: 24, paddingTop: 60 },
  center: { flex: 1, backgroundColor: '#F4F0EA', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 40, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', lineHeight: 48, marginBottom: 32 },
  locationCard: { backgroundColor: '#4DF0FF', borderWidth: 2, borderColor: '#000', padding: 16, marginBottom: 32, shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  locationLabel: { fontSize: 12, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', textTransform: 'uppercase', color: '#000', marginBottom: 4 },
  locationText: { fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  pinIcon: { alignItems: 'center', marginBottom: 40 },
  pinEmoji: { fontSize: 80 },
  button: { backgroundColor: '#FF2A5F', borderWidth: 2, borderColor: '#000', paddingVertical: 18, alignItems: 'center', shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 20, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#fff' },
  waitingCard: { backgroundColor: '#FFE600', borderWidth: 2, borderColor: '#000', padding: 20, alignItems: 'center', shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  waitingText: { fontSize: 20, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  waitingSubtext: { fontSize: 14, color: '#000', marginTop: 8, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 32, justifyContent: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#000' },
  dotGreen: { backgroundColor: '#00CC66' },
  dotGray: { backgroundColor: '#ccc' },
  statusName: { fontSize: 14, fontFamily: 'SpaceGrotesk-Bold', marginLeft: 6, color: '#000' },
});
