import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi } from '../../../src/services/activeDateApi';
import { colors, typography } from '../../../src/constants/theme';

export default function SafetyCheckinScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [confirming, setConfirming] = useState(false);
  const [done, setDone] = useState(false);

  const handleOK = async () => {
    setConfirming(true);
    try {
      await activeDateApi.safetyCheckin(bookingId);
      setDone(true);
      setTimeout(() => router.back(), 2000);
    } finally {
      setConfirming(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Safety Check</Text>
        <Text style={styles.subtitle}>Are you OK?{'\n'}Please confirm you're safe.</Text>
      </View>

      {done ? (
        <View style={styles.doneCard}>
          <Text style={styles.doneText}>Thanks! Stay safe.</Text>
        </View>
      ) : (
        <>
          <TouchableOpacity
            style={[styles.okBtn, confirming && styles.btnDisabled]}
            onPress={handleOK}
            disabled={confirming}
            accessibilityLabel="I'm OK"
            accessibilityRole="button"
            accessibilityState={{ disabled: confirming }}
          >
            {confirming
              ? <ActivityIndicator color={colors.white} size="large" />
              : <Text style={styles.okBtnText}>I'm OK</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => router.push(`/date/sos/${bookingId}` as any)}
            accessibilityLabel="I need help"
            accessibilityRole="button"
          >
            <Text style={styles.helpBtnText}>I Need Help</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: 24, paddingTop: 60 },
  card: { backgroundColor: colors.primaryLight, borderWidth: 2, borderColor: '#000', padding: 24, marginBottom: 40, shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  title: { fontSize: 28, fontFamily: typography.fonts.heading, fontWeight: '700', color: '#000', marginBottom: 12 },
  subtitle: { fontSize: 18, color: '#000', lineHeight: 28 },
  okBtn: { backgroundColor: colors.successStrong, borderWidth: 2, borderColor: '#000', paddingVertical: 28, alignItems: 'center', marginBottom: 16, shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  okBtnText: { fontSize: 28, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.white },
  helpBtn: { backgroundColor: colors.error, borderWidth: 2, borderColor: '#000', paddingVertical: 18, alignItems: 'center' },
  helpBtnText: { fontSize: 18, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.white },
  btnDisabled: { opacity: 0.6 },
  doneCard: { backgroundColor: colors.accent, borderWidth: 2, borderColor: '#000', padding: 32, alignItems: 'center', shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  doneText: { fontSize: 24, fontFamily: typography.fonts.heading, fontWeight: '700', color: '#000' },
});
