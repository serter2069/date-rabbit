import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi, ActiveBooking } from '../../../src/services/activeDateApi';

export default function ExtendResponseScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<ActiveBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);

  useEffect(() => {
    activeDateApi.getBookingById(bookingId)
      .then(setBooking)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleRespond = async (approved: boolean) => {
    setResponding(true);
    try {
      await activeDateApi.extendResponse(bookingId, approved);
      if (approved) {
        Alert.alert('Extension Approved', 'The date has been extended!', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      } else {
        Alert.alert('Extension Declined', 'You declined the extension request.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to respond');
    } finally {
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF2A5F" />
      </View>
    );
  }

  const hours = booking?.extendRequestedHours ?? 1;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>EXTEND REQUEST</Text>
        <Text style={styles.title}>
          {booking?.seeker?.name ?? 'Your guest'} wants to extend the date
        </Text>
        <View style={styles.hoursRow}>
          <Text style={styles.hoursText}>+{hours}h</Text>
        </View>
        <Text style={styles.subtitle}>Do you want to continue the date?</Text>
      </View>

      {responding ? (
        <ActivityIndicator size="large" color="#FF2A5F" style={{ marginTop: 40 }} />
      ) : (
        <>
          <TouchableOpacity
            style={styles.acceptBtn}
            onPress={() => handleRespond(true)}
            accessibilityLabel="Accept extension"
            accessibilityRole="button"
          >
            <Text style={styles.acceptBtnText}>Yes, Extend the Date</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.declineBtn}
            onPress={() => handleRespond(false)}
            accessibilityLabel="Decline extension"
            accessibilityRole="button"
          >
            <Text style={styles.declineBtnText}>No, End as Planned</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}
        accessibilityLabel="Decide later"
        accessibilityRole="button"
      >
        <Text style={styles.cancelText}>Decide Later</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA', padding: 24, paddingTop: 60 },
  center: { flex: 1, backgroundColor: '#F4F0EA', justifyContent: 'center', alignItems: 'center' },
  card: { backgroundColor: '#FF5A85', borderWidth: 2, borderColor: '#000', padding: 24, marginBottom: 40, shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  label: { fontSize: 12, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', letterSpacing: 2, marginBottom: 8 },
  title: { fontSize: 24, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', marginBottom: 20 },
  hoursRow: { backgroundColor: '#000', paddingVertical: 16, paddingHorizontal: 32, alignSelf: 'center', marginBottom: 16, shadowOffset: { width: 3, height: 3 }, shadowColor: '#FF2A5F', shadowOpacity: 1, shadowRadius: 0 },
  hoursText: { fontSize: 48, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#FF5A85' },
  subtitle: { fontSize: 16, color: '#000', textAlign: 'center' },
  acceptBtn: { backgroundColor: '#4DF0FF', borderWidth: 2, borderColor: '#000', paddingVertical: 20, alignItems: 'center', marginBottom: 12, shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  acceptBtnText: { fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  declineBtn: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', paddingVertical: 18, alignItems: 'center', marginBottom: 12, shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  declineBtnText: { fontSize: 16, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  cancelBtn: { marginTop: 8, alignItems: 'center', padding: 12 },
  cancelText: { fontSize: 15, color: '#555', textDecorationLine: 'underline' },
});
