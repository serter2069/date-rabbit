import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi } from '../../../src/services/activeDateApi';

export default function SOSScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [alerted, setAlerted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAlert = async () => {
    setLoading(true);
    try {
      await activeDateApi.triggerSOS(bookingId);
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
      >
        <Text style={styles.callBtnText}>CALL 911</Text>
      </TouchableOpacity>

      {!alerted ? (
        <TouchableOpacity
          style={[styles.alertBtn, loading && styles.btnDisabled]}
          onPress={handleAlert}
          disabled={loading}
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

      <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
        <Text style={styles.cancelText}>I'm OK — Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA', padding: 24, paddingTop: 60 },
  header: { backgroundColor: '#FF0000', borderWidth: 3, borderColor: '#000', padding: 24, alignItems: 'center', marginBottom: 24, shadowOffset: { width: 5, height: 5 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  sosLabel: { fontSize: 14, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#fff', letterSpacing: 4, marginBottom: 4 },
  title: { fontSize: 48, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#fff' },
  subtitle: { fontSize: 18, color: '#000', textAlign: 'center', marginBottom: 40, fontFamily: 'SpaceGrotesk-Bold' },
  callBtn: { backgroundColor: '#FF0000', borderWidth: 2, borderColor: '#000', paddingVertical: 20, alignItems: 'center', marginBottom: 16, shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  callBtnText: { fontSize: 24, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#fff', letterSpacing: 2 },
  alertBtn: { backgroundColor: '#000', borderWidth: 2, borderColor: '#000', paddingVertical: 18, alignItems: 'center', marginBottom: 16 },
  alertBtnText: { fontSize: 16, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#fff' },
  btnDisabled: { opacity: 0.5 },
  confirmedCard: { backgroundColor: '#4DF0FF', borderWidth: 2, borderColor: '#000', padding: 20, alignItems: 'center', marginBottom: 16 },
  confirmedText: { fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  confirmedSubtext: { fontSize: 14, color: '#000', marginTop: 8, textAlign: 'center' },
  cancelBtn: { marginTop: 24, alignItems: 'center', padding: 16, borderWidth: 1, borderColor: '#ccc' },
  cancelText: { fontSize: 16, color: '#555' },
});
