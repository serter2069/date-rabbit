import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { activeDateApi, ActiveBooking } from '../../../src/services/activeDateApi';
import { colors, typography } from '../../../src/constants/theme';

type Step = 'selfie' | 'location' | 'ready' | 'waiting';

export default function SeekerCheckinScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [booking, setBooking] = useState<ActiveBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [step, setStep] = useState<Step>('selfie');
  const [error, setError] = useState<string | null>(null);

  const [selfieUri, setSelfieUri] = useState<string | null>(null);
  const [selfieUploadStatus, setSelfieUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'failed'>('idle');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'done' | 'denied'>('idle');

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

  // Poll every 5 seconds after check-in, waiting for companion
  useEffect(() => {
    if (step !== 'waiting') return;
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
  }, [step, bookingId]);

  const handleTakeSelfie = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      setError('Camera access is needed for identity verification.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
      cameraType: ImagePicker.CameraType.front,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setSelfieUri(uri);
      setSelfieUploadStatus('uploading');
      try {
        await activeDateApi.uploadSelfie(bookingId, uri);
        setSelfieUploadStatus('done');
      } catch (_e) {
        // Graceful degradation: upload failed, show warning but allow proceeding
        setSelfieUploadStatus('failed');
      }
      setStep('location');
    }
  };

  const handleRetrySelfieUpload = async () => {
    if (!selfieUri) return;
    setSelfieUploadStatus('uploading');
    try {
      await activeDateApi.uploadSelfie(bookingId, selfieUri);
      setSelfieUploadStatus('done');
    } catch (_e) {
      setSelfieUploadStatus('failed');
    }
  };

  const handleGetLocation = async () => {
    setLocationStatus('loading');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setLocationStatus('denied');
      setStep('ready');
      return;
    }
    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      setLocationStatus('done');
    } catch (e) {
      setLocationStatus('denied');
    }
    setStep('ready');
  };

  const handleCheckin = async () => {
    setCheckingIn(true);
    setError(null);
    try {
      const updated = await activeDateApi.seekerCheckin(bookingId, coords ?? undefined);
      setBooking(updated);
      if (updated.status === 'active') {
        router.replace(`/date/active/${bookingId}`);
      } else {
        setStep('waiting');
      }
    } catch (e: any) {
      setError(e.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (step === 'waiting') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>You're{'\n'}Checked In!</Text>
        {booking?.location && (
          <View style={styles.locationCard}>
            <Text style={styles.locationLabel}>Meeting at</Text>
            <Text style={styles.locationText}>{booking.location}</Text>
          </View>
        )}
        <View style={styles.waitingCard}>
          <Text style={styles.waitingText}>Waiting for {booking?.companion?.name ?? 'your companion'}...</Text>
          <Text style={styles.waitingSubtext}>They'll check in when they arrive</Text>
          <ActivityIndicator color={colors.primary} style={{ marginTop: 16 }} />
        </View>
        <View style={styles.statusRow}>
          <View style={[styles.dot, styles.dotGreen]} />
          <Text style={styles.statusName}>You</Text>
          <View style={[styles.dot, booking?.companionCheckinAt ? styles.dotGreen : styles.dotGray, { marginLeft: 24 }]} />
          <Text style={styles.statusName}>{booking?.companion?.name}</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Time to{'\n'}Check In</Text>

      {booking?.location && (
        <View style={styles.locationCard}>
          <Text style={styles.locationLabel}>Meeting at</Text>
          <Text style={styles.locationText}>{booking.location}</Text>
        </View>
      )}

      {/* Step 1: Selfie */}
      <View style={styles.stepCard}>
        <View style={styles.stepHeader}>
          <View style={[styles.stepBadge, selfieUploadStatus === 'done' ? styles.stepBadgeDone : styles.stepBadgeTodo]}>
            <Text style={styles.stepBadgeText}>{selfieUploadStatus === 'done' ? '✓' : '1'}</Text>
          </View>
          <Text style={styles.stepTitle}>Take a Selfie</Text>
        </View>
        <Text style={styles.stepDesc}>Verify your identity at the location</Text>
        {selfieUri ? (
          <View>
            <View style={styles.selfieRow}>
              <Image source={{ uri: selfieUri }} style={styles.selfieThumb} />
              <View style={styles.selfieActions}>
                {selfieUploadStatus === 'uploading' && (
                  <View style={styles.uploadingRow}>
                    <ActivityIndicator color={colors.primary} size="small" />
                    <Text style={styles.uploadingText}>Uploading...</Text>
                  </View>
                )}
                {selfieUploadStatus === 'done' && (
                  <Text style={styles.uploadDoneText}>Uploaded</Text>
                )}
                {selfieUploadStatus === 'failed' && (
                  <View>
                    <Text style={styles.uploadFailText}>Upload failed</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={handleRetrySelfieUpload}
                      accessibilityLabel="Retry selfie upload"
                      accessibilityRole="button"
                    >
                      <Text style={styles.retakeBtnText}>Retry</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <TouchableOpacity style={[styles.retakeBtn, selfieUploadStatus === 'uploading' && styles.btnDisabled]}
                  onPress={selfieUploadStatus === 'uploading' ? undefined : handleTakeSelfie}
                  accessibilityLabel="Retake selfie"
                  accessibilityRole="button"
                >
                  <Text style={styles.retakeBtnText}>Retake</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <TouchableOpacity style={styles.cameraBtn} onPress={handleTakeSelfie}
            accessibilityLabel="Open camera for selfie"
            accessibilityRole="button"
          >
            <Text style={styles.cameraBtnText}>Open Camera</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Step 2: Location */}
      <View style={[styles.stepCard, !selfieUri && styles.stepCardDimmed]}>
        <View style={styles.stepHeader}>
          <View style={[styles.stepBadge, locationStatus === 'done' ? styles.stepBadgeDone : styles.stepBadgeTodo]}>
            <Text style={styles.stepBadgeText}>{locationStatus === 'done' ? '✓' : '2'}</Text>
          </View>
          <Text style={styles.stepTitle}>Share Location</Text>
        </View>
        <Text style={styles.stepDesc}>Confirm you're at the meeting spot</Text>
        {locationStatus === 'done' ? (
          <View style={styles.locationDoneRow}>
            <Text style={styles.locationDoneText}>Location captured</Text>
          </View>
        ) : locationStatus === 'denied' ? (
          <View style={styles.locationDoneRow}>
            <Text style={styles.locationDoneText}>Location skipped</Text>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.locationBtn, (!selfieUri || locationStatus === 'loading') && styles.btnDisabled]}
            onPress={handleGetLocation}
            disabled={!selfieUri || locationStatus === 'loading'}
            accessibilityLabel="Get current location"
            accessibilityRole="button"
            accessibilityState={{ disabled: !selfieUri || locationStatus === 'loading' }}
          >
            {locationStatus === 'loading'
              ? <ActivityIndicator color={colors.text} size="small" />
              : <Text style={styles.locationBtnText}>Get Location</Text>
            }
          </TouchableOpacity>
        )}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {/* Check In Button */}
      <TouchableOpacity
        style={[styles.checkinBtn, (step !== 'ready' || checkingIn) && styles.btnDisabled]}
        onPress={handleCheckin}
        disabled={step !== 'ready' || checkingIn}
        accessibilityLabel="Check in"
        accessibilityRole="button"
        accessibilityState={{ disabled: step !== 'ready' || checkingIn }}
      >
        {checkingIn
          ? <ActivityIndicator color={colors.white} />
          : <Text style={styles.checkinBtnText}>I'm Here — Check In</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 40, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text, lineHeight: 48, marginBottom: 24 },
  locationCard: { backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.border, padding: 16, marginBottom: 24, shadowOffset: { width: 3, height: 3 }, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 0 },
  locationLabel: { fontSize: 12, fontFamily: typography.fonts.heading, fontWeight: '700', textTransform: 'uppercase', color: colors.text, marginBottom: 4 },
  locationText: { fontSize: 18, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  stepCard: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, padding: 16, marginBottom: 16, shadowOffset: { width: 3, height: 3 }, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 0 },
  stepCardDimmed: { opacity: 0.4 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  stepBadge: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: colors.border, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  stepBadgeTodo: { backgroundColor: colors.surface },
  stepBadgeDone: { backgroundColor: colors.successStrong },
  stepBadgeText: { fontSize: 12, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  stepTitle: { fontSize: 18, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  stepDesc: { fontSize: 13, color: colors.textMuted, marginBottom: 14, marginLeft: 38 },
  selfieRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  selfieThumb: { width: 72, height: 72, borderWidth: 2, borderColor: colors.border },
  selfieActions: { flex: 1, gap: 8 },
  uploadingRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  uploadingText: { fontSize: 13, fontFamily: typography.fonts.heading, color: colors.textMuted },
  uploadDoneText: { fontSize: 13, fontFamily: typography.fonts.heading, color: colors.success },
  uploadFailText: { fontSize: 13, fontFamily: typography.fonts.heading, color: colors.error, marginBottom: 6 },
  retryBtn: { borderWidth: 2, borderColor: colors.error, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 6 },
  retakeBtn: { borderWidth: 2, borderColor: colors.border, paddingHorizontal: 16, paddingVertical: 8 },
  retakeBtnText: { fontSize: 14, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  cameraBtn: { backgroundColor: colors.primaryLight, borderWidth: 2, borderColor: colors.border, paddingVertical: 14, alignItems: 'center', shadowOffset: { width: 3, height: 3 }, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 0 },
  cameraBtnText: { fontSize: 16, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  locationBtn: { backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.border, paddingVertical: 14, alignItems: 'center', shadowOffset: { width: 3, height: 3 }, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 0 },
  locationBtnText: { fontSize: 16, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  locationDoneRow: { backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borderLight, padding: 10 },
  locationDoneText: { fontSize: 14, fontFamily: typography.fonts.heading, color: colors.text },
  checkinBtn: { backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.border, paddingVertical: 20, alignItems: 'center', marginTop: 8, shadowOffset: { width: 4, height: 4 }, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 0 },
  btnDisabled: { opacity: 0.4 },
  checkinBtnText: { fontSize: 20, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.white },
  waitingCard: { backgroundColor: colors.primaryLight, borderWidth: 2, borderColor: colors.border, padding: 20, alignItems: 'center', shadowOffset: { width: 3, height: 3 }, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 0, marginBottom: 24 },
  waitingText: { fontSize: 20, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  waitingSubtext: { fontSize: 14, color: colors.text, marginTop: 8, textAlign: 'center' },
  statusRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  dot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: colors.border },
  dotGreen: { backgroundColor: colors.successStrong },
  dotGray: { backgroundColor: colors.borderLight },
  statusName: { fontSize: 14, fontFamily: typography.fonts.heading, marginLeft: 6, color: colors.text },
  errorText: { color: colors.primary, fontSize: 14, marginTop: 8, textAlign: 'center', marginBottom: 8 },
});
