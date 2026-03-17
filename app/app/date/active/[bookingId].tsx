import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi, ActiveBooking } from '../../../src/services/activeDateApi';

function formatTime(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ActiveDateScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<ActiveBooking | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadBooking = useCallback(async () => {
    try {
      const data = await activeDateApi.getBookingById(bookingId);
      setBooking(data);
      if (data.activeDateStartedAt) {
        const endTime = new Date(data.activeDateStartedAt).getTime() + data.duration * 3600 * 1000;
        setRemaining(Math.max(0, endTime - Date.now()));
      }
    } finally {
      setLoading(false);
    }
  }, [bookingId]);

  useEffect(() => { loadBooking(); }, [loadBooking]);

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = Math.max(0, prev - 1000);
        if (next === 0 && booking) {
          clearInterval(interval);
          activeDateApi.endEarly(bookingId).catch(() => {});
          router.replace(`/date/summary/${bookingId}`);
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [booking, bookingId]);

  const handleEndEarly = () => {
    Alert.alert(
      'End Date Early?',
      'Are you sure you want to end the date now?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Date',
          style: 'destructive',
          onPress: async () => {
            await activeDateApi.endEarly(bookingId).catch(() => {});
            router.replace(`/date/summary/${bookingId}`);
          },
        },
      ]
    );
  };

  if (loading || !booking) {
    return <View style={styles.center}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  const isLow = remaining < 30 * 60 * 1000;

  const actions = [
    { label: 'Extend Time', color: '#4DF0FF', route: `/date/extend/${bookingId}` },
    { label: 'End Early', color: '#FFE600', onPress: handleEndEarly },
    { label: 'Date Plan', color: '#fff', route: `/date/plan/${bookingId}` },
    { label: 'Photos', color: '#fff', route: `/date/photos/${bookingId}` },
    { label: 'Report Issue', color: '#fff', route: `/date/report/${bookingId}` },
    { label: 'SOS', color: '#FF0000', textColor: '#fff', route: `/date/sos/${bookingId}` },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerName}>
          {booking.seeker?.name} & {booking.companion?.name}
        </Text>
        <Text style={styles.headerActivity}>
          {booking.activity?.charAt(0).toUpperCase() + booking.activity?.slice(1)}
          {booking.location ? ` · ${booking.location}` : ''}
        </Text>
      </View>

      {/* Timer */}
      <View style={[styles.timerCard, isLow && styles.timerCardLow]}>
        <Text style={[styles.timerText, isLow && styles.timerTextLow]}>
          {formatTime(remaining)}
        </Text>
        <Text style={styles.timerLabel}>TIME REMAINING</Text>
      </View>

      {/* Action grid */}
      <View style={styles.grid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={[styles.actionBtn, { backgroundColor: action.color }]}
            onPress={() => action.onPress ? action.onPress() : router.push(action.route as any)}
          >
            <Text style={[styles.actionText, action.textColor ? { color: action.textColor } : {}]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA' },
  content: { padding: 24, paddingTop: 16 },
  center: { flex: 1, backgroundColor: '#F4F0EA', justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: 'SpaceGrotesk-Bold', fontSize: 18, color: '#000' },
  header: { marginBottom: 32 },
  headerName: { fontSize: 22, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  headerActivity: { fontSize: 14, color: '#555', marginTop: 4 },
  timerCard: {
    backgroundColor: '#000', borderWidth: 2, borderColor: '#000',
    padding: 32, alignItems: 'center', marginBottom: 32,
    shadowOffset: { width: 4, height: 4 }, shadowColor: '#FF2A5F', shadowOpacity: 1, shadowRadius: 0,
  },
  timerCardLow: { backgroundColor: '#FF2A5F' },
  timerText: { fontSize: 64, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#FFE600', letterSpacing: 4 },
  timerTextLow: { color: '#fff' },
  timerLabel: { fontSize: 12, fontFamily: 'SpaceGrotesk-Bold', color: '#fff', marginTop: 8, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBtn: {
    width: '47%', paddingVertical: 20, alignItems: 'center',
    borderWidth: 2, borderColor: '#000',
    shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0,
  },
  actionText: { fontSize: 15, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
});
