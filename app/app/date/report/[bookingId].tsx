import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { activeDateApi } from '../../../src/services/activeDateApi';

// Backend validates: safety | behavior | scam | other
const ISSUE_TYPES: { label: string; value: string }[] = [
  { label: 'Inappropriate behavior', value: 'behavior' },
  { label: 'Safety concern', value: 'safety' },
  { label: 'Scam / fraud', value: 'scam' },
  { label: 'Other', value: 'other' },
];

export default function ReportIssueScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!type) { Alert.alert('Select an issue type'); return; }
    if (!description.trim()) { Alert.alert('Please describe the issue'); return; }
    setSubmitting(true);
    try {
      await activeDateApi.reportIssue(bookingId, type, description);
      setSubmitted(true);
      setTimeout(() => router.back(), 2500);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit');
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA' },
  content: { padding: 24, paddingTop: 40 },
  center: { flex: 1, backgroundColor: '#F4F0EA', justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 32, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', marginBottom: 32 },
  sectionLabel: { fontSize: 14, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  typeOption: { borderWidth: 2, borderColor: '#000', padding: 14, marginBottom: 8, backgroundColor: '#fff', shadowOffset: { width: 2, height: 2 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  typeOptionSelected: { backgroundColor: '#4DF0FF' },
  typeText: { fontSize: 16, color: '#000' },
  typeTextSelected: { fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },
  textarea: { borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', padding: 14, fontSize: 15, minHeight: 120, marginBottom: 32 },
  submitBtn: { backgroundColor: '#FF2A5F', borderWidth: 2, borderColor: '#000', paddingVertical: 18, alignItems: 'center', shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  submitBtnText: { fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#fff' },
  btnDisabled: { opacity: 0.6 },
  successCard: { backgroundColor: '#4DF0FF', borderWidth: 2, borderColor: '#000', padding: 32, alignItems: 'center', shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  successText: { fontSize: 24, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  successSubtext: { fontSize: 15, color: '#000', marginTop: 8, textAlign: 'center' },
});
