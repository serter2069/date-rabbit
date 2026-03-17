import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { apiRequest } from '../../../src/services/api';

export default function WriteReviewScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Please select a rating'); return; }
    setSubmitting(true);
    try {
      await apiRequest(`/reviews/bookings/${bookingId}`, {
        method: 'POST',
        body: { rating, comment: comment.trim() || undefined },
      });
      router.replace('/(tabs)' as any);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>How was{'\n'}your date?</Text>

      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity key={star} onPress={() => setRating(star)} style={styles.starBtn}>
            <Text style={[styles.star, star <= rating && styles.starFilled]}>★</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.textarea}
        value={comment}
        onChangeText={setComment}
        placeholder="Tell others about your experience..."
        multiline
        numberOfLines={6}
        textAlignVertical="top"
      />

      <TouchableOpacity
        style={[styles.submitBtn, (submitting || rating === 0) && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={submitting || rating === 0}
      >
        {submitting
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitBtnText}>Submit Review</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA' },
  content: { padding: 24, paddingTop: 40 },
  title: { fontSize: 36, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', lineHeight: 44, marginBottom: 32 },
  starsRow: { flexDirection: 'row', marginBottom: 32, gap: 8 },
  starBtn: { padding: 4 },
  star: { fontSize: 48, color: '#ccc' },
  starFilled: { color: '#FFE600' },
  textarea: { borderWidth: 2, borderColor: '#000', backgroundColor: '#fff', padding: 16, fontSize: 16, minHeight: 140, marginBottom: 32 },
  submitBtn: { backgroundColor: '#FF2A5F', borderWidth: 2, borderColor: '#000', paddingVertical: 18, alignItems: 'center', shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  submitBtnText: { fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#fff' },
  btnDisabled: { opacity: 0.5 },
});
