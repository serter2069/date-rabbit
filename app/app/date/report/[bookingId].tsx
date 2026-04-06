import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { activeDateApi } from '../../../src/services/activeDateApi';
import { colors, typography } from '../../../src/constants/theme';

// Backend validates: safety | behavior | scam | other
const ISSUE_TYPES: { label: string; value: string }[] = [
  { label: 'Inappropriate behavior', value: 'behavior' },
  { label: 'Safety concern', value: 'safety' },
  { label: 'Scam / fraud', value: 'scam' },
  { label: 'Other', value: 'other' },
];

export default function ReportIssueScreen() {
  const insets = useSafeAreaInsets();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!type) { setError('Select an issue type'); return; }
    if (!description.trim()) { setError('Please describe the issue'); return; }
    setError(null);
    setSubmitting(true);
    try {
      await activeDateApi.reportIssue(bookingId, type, description);
      setSubmitted(true);
      setTimeout(() => router.back(), 2500);
    } catch (e: any) {
      setError(e.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <View style={styles.center}>
      <View style={styles.successCard}>
        <Text style={styles.successText}>Report Submitted</Text>
        <Text style={styles.successSubtext}>Our team will review it shortly.</Text>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
    <ScrollView contentContainerStyle={[styles.content, { paddingTop: insets.top + 24 }]}>
      <Text style={styles.title}>Report an Issue</Text>

      <Text style={styles.sectionLabel}>Issue Type</Text>
      {ISSUE_TYPES.map(({ label, value }) => (
        <TouchableOpacity
          key={value}
          style={[styles.typeOption, type === value && styles.typeOptionSelected]}
          onPress={() => setType(value)}
          accessibilityLabel={label}
          accessibilityRole="radio"
          accessibilityState={{ selected: type === value }}
        >
          <Text style={[styles.typeText, type === value && styles.typeTextSelected]}>{label}</Text>
        </TouchableOpacity>
      ))}

      <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Description</Text>
      <TextInput
        style={styles.textarea}
        value={description}
        onChangeText={setDescription}
        placeholder="Describe what happened..."
        multiline
        numberOfLines={5}
        textAlignVertical="top"
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.submitBtn, submitting && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
        accessibilityLabel="Submit report"
        accessibilityRole="button"
        accessibilityState={{ disabled: submitting }}
      >
        <Text style={styles.submitBtnText}>{submitting ? 'Submitting...' : 'Submit Report'}</Text>
      </TouchableOpacity>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 24 },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontFamily: typography.fonts.heading, fontWeight: '700', color: '#000', marginBottom: 32 },
  sectionLabel: { fontSize: 14, fontFamily: typography.fonts.heading, fontWeight: '700', color: '#000', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  typeOption: { borderWidth: 2, borderColor: '#000', padding: 14, marginBottom: 8, backgroundColor: colors.surface, shadowOffset: { width: 2, height: 2 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  typeOptionSelected: { backgroundColor: colors.accent },
  typeText: { fontSize: 16, color: '#000' },
  typeTextSelected: { fontFamily: typography.fonts.heading, fontWeight: '700' },
  textarea: { borderWidth: 2, borderColor: '#000', backgroundColor: colors.surface, padding: 14, fontSize: 15, minHeight: 120, marginBottom: 32 },
  submitBtn: { backgroundColor: colors.primary, borderWidth: 2, borderColor: '#000', paddingVertical: 18, alignItems: 'center', shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  submitBtnText: { fontSize: 18, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.white },
  btnDisabled: { opacity: 0.6 },
  errorText: { color: colors.primary, fontSize: 14, marginTop: 8, textAlign: 'center', marginBottom: 8 },
  successCard: { backgroundColor: colors.accent, borderWidth: 2, borderColor: '#000', padding: 32, alignItems: 'center', shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  successText: { fontSize: 24, fontFamily: typography.fonts.heading, fontWeight: '700', color: '#000' },
  successSubtext: { fontSize: 15, color: '#000', marginTop: 8, textAlign: 'center' },
});
