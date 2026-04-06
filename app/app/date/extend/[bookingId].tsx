import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi } from '../../../src/services/activeDateApi';
import { colors, typography } from '../../../src/constants/theme';

const HOURS_OPTIONS = [0.5, 1, 2];

function formatHoursLabel(h: number): string {
  if (h === 0.5) return '+30 min';
  if (h === 1) return '+1 hour';
  return `+${h} hours`;
}

function formatHoursDuration(h: number): string {
  if (h === 0.5) return '30 minutes';
  if (h === 1) return '1 hour';
  return `${h} hours`;
}

export default function ExtendDateScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [selected, setSelected] = useState(0.5);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [responseStatus, setResponseStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Poll for companion's response after request is sent
  useEffect(() => {
    if (!sent) return;
    pollRef.current = setInterval(async () => {
      try {
        const data = await activeDateApi.getBookingById(bookingId);
        if (data.extendRequestApproved === true) {
          setResponseStatus('approved');
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => router.back(), 2000);
        } else if (data.extendRequestApproved === false) {
          setResponseStatus('rejected');
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => router.back(), 2500);
        }
      } catch {}
    }, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [sent, bookingId]);

  const handleSend = async () => {
    setSending(true);
    setError(null);
    try {
      await activeDateApi.extendDate(bookingId, selected);
      setSent(true);
    } catch (e: any) {
      setError(e.message || 'Failed to send request');
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
            accessibilityLabel={`Extend by ${formatHoursDuration(h)}`}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === h }}
          >
            <Text style={[styles.optionText, selected === h && styles.optionTextSelected]}>
              {formatHoursLabel(h)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {sent ? (
        responseStatus === 'approved' ? (
          <View style={[styles.sentCard, { backgroundColor: colors.accent }]}>
            <Text style={styles.sentText}>Extension Approved!</Text>
            <Text style={styles.sentSubtext}>Your date has been extended by {formatHoursDuration(selected)}.</Text>
          </View>
        ) : responseStatus === 'rejected' ? (
          <View style={[styles.sentCard, { backgroundColor: colors.primaryLight }]}>
            <Text style={styles.sentText}>Request Declined</Text>
            <Text style={styles.sentSubtext}>The companion declined the extension request.</Text>
          </View>
        ) : (
          <View style={styles.sentCard}>
            <Text style={styles.sentText}>Request sent!</Text>
            <Text style={styles.sentSubtext}>Waiting for companion's response...</Text>
            <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
          </View>
        )
      ) : (
        <TouchableOpacity
          style={[styles.button, sending && styles.buttonDisabled]}
          onPress={handleSend}
          disabled={sending}
          accessibilityLabel="Send extension request"
          accessibilityRole="button"
          accessibilityState={{ disabled: sending }}
        >
          {sending
            ? <ActivityIndicator color={colors.white} />
            : <Text style={styles.buttonText}>Send Request</Text>
          }
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}
        accessibilityLabel="Cancel"
        accessibilityRole="button"
      >
        <Text style={styles.backText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 60 },
  title: { fontSize: 36, fontFamily: typography.fonts.heading, fontWeight: '700', color: '#000', marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textMuted, marginBottom: 40 },
  optionsRow: { flexDirection: 'row', gap: 12, marginBottom: 40 },
  option: { flex: 1, paddingVertical: 24, alignItems: 'center', borderWidth: 2, borderColor: '#000', backgroundColor: colors.surface, shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  optionSelected: { backgroundColor: colors.accent },
  optionText: { fontSize: 24, fontFamily: typography.fonts.heading, fontWeight: '700', color: '#000' },
  optionTextSelected: { color: '#000' },
  button: { backgroundColor: colors.primary, borderWidth: 2, borderColor: '#000', paddingVertical: 18, alignItems: 'center', shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { fontSize: 20, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.white },
  sentCard: { backgroundColor: colors.primaryLight, borderWidth: 2, borderColor: '#000', padding: 24, alignItems: 'center', shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  sentText: { fontSize: 22, fontFamily: typography.fonts.heading, fontWeight: '700', color: '#000' },
  sentSubtext: { fontSize: 14, color: '#000', marginTop: 8, textAlign: 'center' },
  backBtn: { marginTop: 24, alignItems: 'center', padding: 12 },
  backText: { fontSize: 16, color: colors.textMuted, textDecorationLine: 'underline' },
  errorText: { color: colors.primary, fontSize: 14, marginTop: 8, textAlign: 'center', marginBottom: 8 },
});
