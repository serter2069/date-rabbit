import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Location from 'expo-location';
import { activeDateApi } from '../../../src/services/activeDateApi';
import { colors, typography, shadows } from '../../../src/constants/theme';

export default function SOSScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [alerted, setAlerted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAlert = async () => {
    setLoading(true);
    try {
      // Attempt to get location — gracefully skip if denied
      let coords: { lat: number; lon: number } | undefined;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        }
      } catch {
        // Location unavailable — continue SOS without coords
      }
      await activeDateApi.triggerSOS(bookingId, coords);
      setAlerted(true);
    } catch (e) {
      Alert.alert('Error', 'Failed to send alert. Please call 911 directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.sosLabel}>SOS</Text>
        <Text style={styles.title}>EMERGENCY</Text>
      </View>

      <Text style={styles.subtitle}>Stay calm. Help is on the way.</Text>

      <TouchableOpacity
        style={styles.callBtn}
        onPress={() => Linking.openURL('tel:911')}
        accessibilityLabel="Call 911"
        accessibilityRole="button"
      >
        <Text style={styles.callBtnText}>CALL 911</Text>
      </TouchableOpacity>

      {!alerted ? (
        <TouchableOpacity
          style={[styles.alertBtn, loading && styles.btnDisabled]}
          onPress={handleAlert}
          disabled={loading}
          accessibilityLabel="Alert DateRabbit support"
          accessibilityRole="button"
          accessibilityState={{ disabled: loading }}
        >
          <Text style={styles.alertBtnText}>
            {loading ? 'Sending...' : 'Alert DateRabbit Support'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.confirmedCard}>
          <Text style={styles.confirmedText}>Support has been notified</Text>
          <Text style={styles.confirmedSubtext}>Our team is on the way to assist you.</Text>
        </View>
      )}

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}
        accessibilityLabel="I'm OK, go back"
        accessibilityRole="button"
      >
        <Text style={styles.cancelText}>I'm OK — Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 60 },
  header: { backgroundColor: colors.error, borderWidth: 3, borderColor: colors.border, padding: 24, alignItems: 'center', marginBottom: 24, ...shadows.lg },
  sosLabel: { fontSize: 14, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.textInverse, letterSpacing: 4, marginBottom: 4 },
  title: { fontSize: 48, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.textInverse },
  subtitle: { fontSize: 18, color: colors.text, textAlign: 'center', marginBottom: 40, fontFamily: typography.fonts.heading },
  callBtn: { backgroundColor: colors.error, borderWidth: 2, borderColor: colors.border, paddingVertical: 20, alignItems: 'center', marginBottom: 16, ...shadows.md },
  callBtnText: { fontSize: 24, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.textInverse, letterSpacing: 2 },
  alertBtn: { backgroundColor: colors.text, borderWidth: 2, borderColor: colors.border, paddingVertical: 18, alignItems: 'center', marginBottom: 16 },
  alertBtnText: { fontSize: 16, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.textInverse },
  btnDisabled: { opacity: 0.5 },
  confirmedCard: { backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.border, padding: 20, alignItems: 'center', marginBottom: 16 },
  confirmedText: { fontSize: 18, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  confirmedSubtext: { fontSize: 14, color: colors.text, marginTop: 8, textAlign: 'center' },
  cancelBtn: { marginTop: 24, alignItems: 'center', padding: 16, borderWidth: 1, borderColor: colors.borderLight },
  cancelText: { fontSize: 16, color: colors.textMuted },
});
