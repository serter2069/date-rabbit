import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi, ActiveBooking } from '../../../src/services/activeDateApi';
import { useAuthStore } from '../../../src/store/authStore';
import { colors, typography, shadows } from '../../../src/constants/theme';

const SAFETY_CHECKIN_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

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
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showEndEarlyModal, setShowEndEarlyModal] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const lastCheckinRef = useRef<number>(Date.now());
  const user = useAuthStore(s => s.user);
  const isCompanion = user?.role === 'companion';
  const otherUser = isCompanion ? booking?.seeker : booking?.companion;

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

  // Poll every 15s to detect status changes (extend request, SOS, end)
  useEffect(() => {
    const interval = setInterval(() => {
      activeDateApi.getBookingById(bookingId)
        .then(data => {
          setBooking(data);
          // Recalculate remaining time so timer reflects updated duration after extend approval
          if (data.activeDateStartedAt) {
            const endTime = new Date(data.activeDateStartedAt).getTime() + data.duration * 3600 * 1000;
            setRemaining(Math.max(0, endTime - Date.now()));
          }
          if (data.status === 'completed') {
            clearInterval(interval);
            router.replace(`/date/summary/${bookingId}`);
          }
        })
        .catch(() => {});
    }, 15000);
    return () => clearInterval(interval);
  }, [bookingId]);

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

  // Safety check-in: prompt user every 30 min while date is active
  useEffect(() => {
    if (!booking?.activeDateStartedAt) return;
    // Seed last-checkin from backend timestamp if available
    if (booking.safetyCheckinAt) {
      lastCheckinRef.current = new Date(booking.safetyCheckinAt).getTime();
    }
    const interval = setInterval(() => {
      const sinceLastCheckin = Date.now() - lastCheckinRef.current;
      if (sinceLastCheckin >= SAFETY_CHECKIN_INTERVAL_MS) {
        setShowCheckinModal(true);
      }
    }, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, [booking?.activeDateStartedAt, booking?.safetyCheckinAt]);

  const handleSafetyCheckinOk = async () => {
    setCheckinLoading(true);
    try {
      await activeDateApi.safetyCheckin(bookingId);
      lastCheckinRef.current = Date.now();
    } catch {
      // Non-critical — reset timer anyway
      lastCheckinRef.current = Date.now();
    } finally {
      setCheckinLoading(false);
      setShowCheckinModal(false);
    }
  };

  const handleEndEarly = () => {
    setShowEndEarlyModal(true);
  };

  const handleEndEarlyConfirm = async () => {
    setShowEndEarlyModal(false);
    await activeDateApi.endEarly(bookingId).catch(() => {});
    router.replace(`/date/summary/${bookingId}`);
  };

  if (loading || !booking) {
    return <View style={styles.center}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  const isLow = remaining < 30 * 60 * 1000;

  // Companion sees "Respond to Extend" when seeker has a pending request
  const hasExtendRequest = isCompanion && !!booking?.extendRequestedHours && booking?.extendRequestApproved === null;

  const actions = [
    ...(isCompanion
      ? hasExtendRequest
        ? [{ label: `Respond to +${booking!.extendRequestedHours}h Request`, color: colors.accent, route: `/date/extend-response/${bookingId}` }]
        : []
      : [{ label: 'Extend Time', color: colors.accent, route: `/date/extend/${bookingId}` }]
    ),
    { label: 'End Early', color: colors.primaryLight, onPress: handleEndEarly },
    { label: 'Date Plan', color: colors.surface, route: `/date/plan/${bookingId}` },
    { label: 'Photos', color: colors.surface, route: `/date/photos/${bookingId}` },
    { label: 'Report Issue', color: colors.surface, route: `/date/report/${bookingId}` },
    { label: 'SOS', color: colors.error, textColor: colors.textInverse, route: `/date/sos/${bookingId}` },
  ];

  return (
    <View style={styles.screen}>
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
            accessibilityLabel={action.label}
            accessibilityRole="button"
          >
            <Text style={[styles.actionText, action.textColor ? { color: action.textColor } : {}]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* End Early confirmation modal */}
      <Modal
        visible={showEndEarlyModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEndEarlyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>End Date Early?</Text>
            <Text style={styles.modalBody}>Are you sure you want to end the date now?</Text>
            <TouchableOpacity
              style={styles.modalOkBtn}
              onPress={handleEndEarlyConfirm}
              accessibilityLabel="End date"
              accessibilityRole="button"
            >
              <Text style={styles.modalOkText}>End Date</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSosBtn}
              onPress={() => setShowEndEarlyModal(false)}
              accessibilityLabel="Cancel"
              accessibilityRole="button"
            >
              <Text style={styles.modalSosText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Safety check-in modal */}
      <Modal
        visible={showCheckinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCheckinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Safety Check-in</Text>
            <Text style={styles.modalBody}>Are you OK? Tap to confirm you're safe.</Text>
            <TouchableOpacity
              style={[styles.modalOkBtn, checkinLoading && styles.btnDisabled]}
              onPress={handleSafetyCheckinOk}
              disabled={checkinLoading}
              accessibilityLabel="I'm OK"
              accessibilityRole="button"
            >
              <Text style={styles.modalOkText}>{checkinLoading ? 'Confirming...' : "I'm OK"}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalSosBtn}
              onPress={() => { setShowCheckinModal(false); router.push(`/date/sos/${bookingId}` as any); }}
              accessibilityLabel="I need help"
              accessibilityRole="button"
            >
              <Text style={styles.modalSosText}>I Need Help</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>

    {/* Chat FAB — navigate to chat with the other participant */}
    {booking && otherUser && (
      <TouchableOpacity
        style={styles.chatFab}
        onPress={() => router.push(`/chat/${otherUser.id}?name=${encodeURIComponent(otherUser.name || '')}` as any)}
        accessibilityLabel="Open chat"
        accessibilityRole="button"
      >
        <MessageCircle size={26} color="#000" strokeWidth={2.5} />
      </TouchableOpacity>
    )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24, paddingTop: 16 },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontFamily: typography.fonts.heading, fontSize: 18, color: colors.text },
  header: { marginBottom: 32 },
  headerName: { fontSize: 22, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  headerActivity: { fontSize: 14, color: colors.textMuted, marginTop: 4 },
  timerCard: {
    backgroundColor: colors.text, borderWidth: 2, borderColor: colors.border,
    padding: 32, alignItems: 'center', marginBottom: 32,
    shadowColor: colors.primary, shadowOffset: { width: 4, height: 4 }, shadowOpacity: 1, shadowRadius: 0,
  },
  timerCardLow: { backgroundColor: colors.primary },
  timerText: { fontSize: 64, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.primaryLight, letterSpacing: 4 },
  timerTextLow: { color: colors.textInverse },
  timerLabel: { fontSize: 12, fontFamily: typography.fonts.heading, color: colors.textInverse, marginTop: 8, letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionBtn: {
    width: '47%', paddingVertical: 20, alignItems: 'center',
    borderWidth: 2, borderColor: colors.border,
    ...shadows.sm,
  },
  actionText: { fontSize: 15, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { backgroundColor: colors.background, borderWidth: 3, borderColor: colors.border, padding: 32, width: '100%', maxWidth: 400, ...shadows.lg },
  modalTitle: { fontSize: 26, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text, marginBottom: 12 },
  modalBody: { fontSize: 16, color: colors.textSecondary, marginBottom: 32 },
  modalOkBtn: { backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.border, paddingVertical: 18, alignItems: 'center', marginBottom: 12, ...shadows.sm },
  modalOkText: { fontSize: 18, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  modalSosBtn: { backgroundColor: colors.error, borderWidth: 2, borderColor: colors.border, paddingVertical: 14, alignItems: 'center' },
  modalSosText: { fontSize: 16, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.textInverse },
  btnDisabled: { opacity: 0.5 },
  chatFab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
    elevation: 4,
  },
});
