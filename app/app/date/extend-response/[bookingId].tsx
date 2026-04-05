import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi, ActiveBooking } from '../../../src/services/activeDateApi';
import { colors, typography, shadows } from '../../../src/constants/theme';

export default function ExtendResponseScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<ActiveBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    activeDateApi.getBookingById(bookingId)
      .then(data => setBooking(data))
      .catch(() => setError('Could not load booking'))
      .finally(() => setLoading(false));
  }, [bookingId]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => router.back(), 2000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const handleRespond = async (approved: boolean) => {
    setResponding(true);
    setError(null);
    try {
      await activeDateApi.extendResponse(bookingId, approved);
      setSuccessMsg(
        approved
          ? `Extension approved! Date extended by ${booking?.extendRequestedHours} hour${booking?.extendRequestedHours !== 1 ? 's' : ''}.`
          : 'Extension declined.'
      );
    } catch (e: any) {
      setError(e.message || 'Failed to respond');
      setResponding(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!booking?.extendRequestedHours) {
    return (
      <View style={styles.center}>
        <Text style={styles.noRequest}>No pending extension request.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Extension Request</Text>

      <View style={styles.requestCard}>
        <Text style={styles.requestLabel}>Seeker wants to extend by</Text>
        <Text style={styles.requestHours}>+{booking.extendRequestedHours}h</Text>
        <Text style={styles.requestSubtext}>
          This will add {booking.extendRequestedHours} hour{booking.extendRequestedHours !== 1 ? 's' : ''} to your date.
        </Text>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}
      {successMsg && <Text style={styles.successText}>{successMsg}</Text>}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.rejectBtn, responding && styles.btnDisabled]}
          onPress={() => handleRespond(false)}
          disabled={responding}
          accessibilityLabel="Decline extension"
          accessibilityRole="button"
          accessibilityState={{ disabled: responding }}
        >
          <Text style={styles.rejectText}>Decline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.approveBtn, responding && styles.btnDisabled]}
          onPress={() => handleRespond(true)}
          disabled={responding}
          accessibilityLabel="Approve extension"
          accessibilityRole="button"
          accessibilityState={{ disabled: responding }}
        >
          {responding
            ? <ActivityIndicator color="#000" />
            : <Text style={styles.approveText}>Approve</Text>
          }
        </TouchableOpacity>
      </View>

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
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 36, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text, marginBottom: 32 },
  requestCard: {
    backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border,
    padding: 32, alignItems: 'center', marginBottom: 40,
    ...shadows.md,
  },
  requestLabel: { fontSize: 14, color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  requestHours: { fontSize: 72, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.primary, lineHeight: 80 },
  requestSubtext: { fontSize: 14, color: colors.textMuted, marginTop: 8, textAlign: 'center' },
  buttonRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  rejectBtn: {
    flex: 1, paddingVertical: 18, alignItems: 'center',
    borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface,
    ...shadows.sm,
  },
  rejectText: { fontSize: 18, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  approveBtn: {
    flex: 1, paddingVertical: 18, alignItems: 'center',
    borderWidth: 2, borderColor: colors.border, backgroundColor: colors.accent,
    ...shadows.sm,
  },
  approveText: { fontSize: 18, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  btnDisabled: { opacity: 0.6 },
  noRequest: { fontSize: 18, fontFamily: typography.fonts.heading, color: colors.text, textAlign: 'center', marginBottom: 24 },
  backBtn: { alignItems: 'center', padding: 12 },
  backText: { fontSize: 16, color: colors.textMuted, textDecorationLine: 'underline' },
  errorText: { color: colors.error, fontSize: 14, marginTop: 8, textAlign: 'center', marginBottom: 8 },
  successText: { color: colors.success, fontSize: 14, marginTop: 8, textAlign: 'center', marginBottom: 8 },
});
