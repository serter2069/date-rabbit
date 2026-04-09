import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, typography, shadows } from '../../src/constants/theme';
import { apiRequest } from '../../src/services/api';
import { useAuthStore } from '../../src/store/authStore';

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
  replyText?: string | null;
  repliedAt?: string | null;
  revieweeId?: string;
  reviewer?: { id: string; name: string };
  createdAt: string;
}

interface ReviewsResponse {
  reviews: ReviewItem[];
  total: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Text key={star} style={[styles.star, star <= rating && styles.starFilled]}>
          ★
        </Text>
      ))}
    </View>
  );
}

function ReviewCard({
  item,
  currentUserId,
  onReplySubmitted,
}: {
  item: ReviewItem;
  currentUserId: string | null;
  onReplySubmitted: (reviewId: string, replyText: string, repliedAt: string) => void;
}) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyDraft, setReplyDraft] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const date = new Date(item.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const canReply =
    currentUserId &&
    item.revieweeId === currentUserId &&
    !item.replyText;

  const handleSubmitReply = async () => {
    const text = replyDraft.trim();
    if (!text) return;
    setSubmitting(true);
    try {
      const result = await apiRequest<{ replyText: string; repliedAt: string }>(
        `/reviews/${item.id}/reply`,
        { method: 'POST', body: { text } },
      );
      onReplySubmitted(item.id, result.replyText, result.repliedAt);
      setShowReplyForm(false);
      setReplyDraft('');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not submit reply.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.reviewerName}>{item.reviewer?.name ?? 'Anonymous'}</Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>
      <StarRating rating={item.rating} />
      {!!item.comment && <Text style={styles.comment}>{item.comment}</Text>}

      {/* Reply display */}
      {!!item.replyText && (
        <View style={styles.replyBlock}>
          <Text style={styles.replyLabel}>Companion replied</Text>
          {item.repliedAt && (
            <Text style={styles.replyDate}>
              {new Date(item.repliedAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Text>
          )}
          <Text style={styles.replyText}>{item.replyText}</Text>
        </View>
      )}

      {/* Reply button */}
      {canReply && !showReplyForm && (
        <TouchableOpacity
          style={styles.replyButton}
          onPress={() => setShowReplyForm(true)}
        >
          <Text style={styles.replyButtonText}>Reply</Text>
        </TouchableOpacity>
      )}

      {/* Reply form */}
      {showReplyForm && (
        <View style={styles.replyForm}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            placeholderTextColor="#999"
            value={replyDraft}
            onChangeText={setReplyDraft}
            maxLength={2000}
            multiline
          />
          <View style={styles.replyFormActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowReplyForm(false);
                setReplyDraft('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitButton, submitting && { opacity: 0.6 }]}
              onPress={handleSubmitReply}
              disabled={submitting || !replyDraft.trim()}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Text style={styles.submitButtonText}>Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default function ReviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);

  useEffect(() => {
    if (!id) {
      setError('Invalid page.');
      setLoading(false);
      return;
    }

    apiRequest<ReviewsResponse>(`/reviews/users/${id}`)
      .then((data) => {
        setReviews(data.reviews);
        setTotal(data.total);
      })
      .catch((e: any) => {
        setError(e?.message ?? 'Could not load reviews.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleReplySubmitted = useCallback(
    (reviewId: string, replyText: string, repliedAt: string) => {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? { ...r, replyText, repliedAt } : r,
        ),
      );
    },
    [],
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reviews{total > 0 ? ` (${total})` : ''}</Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Body */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>Couldn't load reviews</Text>
          <Text style={styles.stateBody}>{error}</Text>
        </View>
      ) : reviews.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.stateTitle}>No reviews yet</Text>
          <Text style={styles.stateBody}>Be the first to leave a review!</Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ReviewCard
              item={item}
              currentUserId={currentUserId}
              onReplySubmitted={handleReplySubmitted}
            />
          )}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 24,
    color: colors.text,
  },
  title: {
    fontSize: 20,
    fontFamily: typography.fonts.heading,
    fontWeight: '700',
    color: colors.text,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateTitle: {
    fontSize: 22,
    fontFamily: typography.fonts.heading,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  stateBody: {
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
  },
  list: {
    padding: 16,
  },
  separator: {
    height: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 16,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontFamily: typography.fonts.heading,
    fontWeight: '700',
    color: colors.text,
  },
  dateText: {
    fontSize: 13,
    color: colors.textLight,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 2,
  },
  star: {
    fontSize: 22,
    color: colors.textLight,
  },
  starFilled: {
    color: colors.primary,
  },
  comment: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  replyBlock: {
    marginTop: 12,
    paddingLeft: 12,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
    backgroundColor: colors.backgroundWarm,
    padding: 12,
  },
  replyLabel: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 2,
  },
  replyDate: {
    fontSize: 12,
    color: colors.textLight,
    marginBottom: 6,
  },
  replyText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  replyButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: colors.white,
  },
  replyButtonText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontWeight: '700',
    color: '#000',
  },
  replyForm: {
    marginTop: 12,
  },
  replyInput: {
    borderWidth: 2,
    borderColor: '#000',
    padding: 10,
    fontSize: 14,
    color: '#000',
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: colors.white,
  },
  replyFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: colors.white,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  submitButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});
