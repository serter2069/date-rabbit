import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi } from '../../../src/services/activeDateApi';

const HOURS_OPTIONS = [1, 2, 3];

export default function ExtendDateScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [selected, setSelected] = useState(1);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = async () => {
    setSending(true);
    try {
      await activeDateApi.extendDate(bookingId, selected);
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Extend Your Date</Text>
      <Text style={styles.subtitle}>How many more hours?</Text>

      <View style={styles.optionsRow}>
        {HOURS_OPTIONS.map(h => (
          <TouchableOpacity
            key={h}
            style={[styles.option, selected === h && styles.optionSelected]}
            onPress={() => setSelected(h)}
          >
            <Text style={[styles.optionText, selected === h && styles.optionTextSelected]}>
              +{h}h
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {sent ? (
        <View style={styles.sentCard}>
          <Text style={styles.sentText}>Request sent!</Text>
          <Text style={styles.sentSubtext}>Waiting for companion's response...</Text>
          <ActivityIndicator color="#FF2A5F" style={{ marginTop: 16 }} />
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.button, sending && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          {sending
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.buttonText}>Send Request</Text>
          }
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA', padding: 24, paddingTop: 60 },
  title: { fontSize: 36, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#555', marginBottom: 40 },
  optionsRow: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  option: { flex: 1, paddingVertical: 24, alignItems: 'center', borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  optionSelected: { backgroundColor: '#4DF0FF' },
  optionText: { fontSize: 24, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  optionTextSelected: { color: '#000' },
  button: { backgroundColor: '#FF2A5F', borderWidth: 2, borderColor: '#000', paddingVertical: 18, alignItems: 'center', shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 20, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#fff' },
  sentCard: { backgroundColor: '#FFE600', borderWidth: 2, borderColor: '#000', padding: 24, alignItems: 'center', shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  sentText: { fontSize: 22, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  sentSubtext: { fontSize: 14, color: '#000', marginTop: 8, textAlign: 'center' },
  backBtn: { marginTop: 24, alignItems: 'center', padding: 12 },
  backText: { fontSize: 16, color: '#555', textDecorationLine: 'underline' },
});
