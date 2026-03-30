import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { showAlert } from '../../src/utils/alert';
import { Icon } from '../../src/components/Icon';
import { EmptyState } from '../../src/components/EmptyState';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
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

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const currentUserId = useAuthStore((s) => s.user?.id ?? null);

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyDraft, setReplyDraft] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const [writeReviewVisible, setWriteReviewVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    apiRequest<ReviewsResponse>(`/reviews/users/${id}`)
      .then((data) => {
        setReviews(data.reviews);
        setTotal(data.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmitReview = () => {
    if (reviewText.trim().length < 10) {
      showAlert('Error', 'Please write at least 10 characters');
      return;
    }
    // In production, this would submit to API
    showAlert('Success', 'Your review has been submitted!', () => setWriteReviewVisible(false));
    setReviewText('');
    setReviewRating(5);
  };

  const handleReplySubmit = useCallback(async (reviewId: string) => {
    const text = replyDraft.trim();
    if (!text) return;
    setSubmittingReply(true);
    try {
      const result = await apiRequest<{ replyText: string; repliedAt: string }>(
        `/reviews/${reviewId}/reply`,
        { method: 'POST', body: { text } },
      );
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId
            ? { ...r, replyText: result.replyText, repliedAt: result.repliedAt }
            : r,
        ),
      );
      setReplyingTo(null);
      setReplyDraft('');
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Could not submit reply.');
    } finally {
      setSubmittingReply(false);
    }
  }, [replyDraft]);

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter(r => r.rating === rating).length / reviews.length) * 100
      : 0,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Reviews{total > 0 ? ` (${total})` : ''}</Text>
        <View style={{ width: 44 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={[styles.ratingBig, { borderRightColor: colors.border }]}>
              <Text style={[styles.ratingNumber, { color: colors.text }]}>{averageRating.toFixed(1)}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    size={16}
                    color={star <= Math.round(averageRating) ? colors.accent : colors.border}
                  />
                ))}
              </View>
              <Text style={[styles.totalReviews, { color: colors.textSecondary }]}>{total} reviews</Text>
            </View>
            <View style={styles.ratingBars}>
              {ratingDistribution.map(({ rating, count, percentage }) => (
                <View key={rating} style={styles.ratingBarRow}>
                  <Text style={[styles.ratingBarLabel, { color: colors.textSecondary }]}>{rating}</Text>
                  <View style={[styles.ratingBarTrack, { backgroundColor: colors.surface }]}>
                    <View style={[styles.ratingBarFill, { width: `${percentage}%`, backgroundColor: colors.warning }]} />
                  </View>
                  <Text style={[styles.ratingBarCount, { color: colors.textSecondary }]}>{count}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        {/* Reviews List */}
        {reviews.length === 0 ? (
          <EmptyState
            icon="edit-3"
            title="No reviews yet"
            description="Be the first to leave a review!"
          />
        ) : (
          reviews.map((review) => {
            const canReply =
              currentUserId &&
              review.revieweeId === currentUserId &&
              !review.replyText;
            const isReplying = replyingTo === review.id;
            const reviewDate = new Date(review.createdAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Card key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewerInfo}>
                    <Text style={[styles.reviewerName, { color: colors.text }]}>
                      {review.reviewer?.name ?? 'Anonymous'}
                    </Text>
                    <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{reviewDate}</Text>
                  </View>
                  <View style={styles.reviewRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name="star"
                        size={14}
                        color={star <= review.rating ? colors.accent : colors.border}
                      />
                    ))}
                  </View>
                </View>
                {!!review.comment && (
                  <Text style={[styles.reviewText, { color: colors.textSecondary }]}>{review.comment}</Text>
                )}

                {/* Reply display */}
                {!!review.replyText && (
                  <View style={[styles.replyBlock, { backgroundColor: colors.background }]}>
                    <Text style={[styles.replyLabel, { color: colors.primary }]}>Companion replied</Text>
                    {review.repliedAt && (
                      <Text style={[styles.replyDateText, { color: colors.textMuted }]}>
                        {new Date(review.repliedAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Text>
                    )}
                    <Text style={[styles.replyText, { color: colors.text }]}>{review.replyText}</Text>
                  </View>
                )}

                {/* Reply button */}
                {canReply && !isReplying && (
                  <TouchableOpacity
                    style={[styles.replyButton, { borderColor: colors.border }]}
                    onPress={() => { setReplyingTo(review.id); setReplyDraft(''); }}
                  >
                    <Icon name="message-circle" size={14} color={colors.textSecondary} />
                    <Text style={[styles.replyButtonText, { color: colors.text }]}> Reply</Text>
                  </TouchableOpacity>
                )}

                {/* Reply form */}
                {isReplying && (
                  <View style={styles.replyForm}>
                    <TextInput
                      style={[styles.replyInput, { backgroundColor: colors.surface, color: colors.text }]}
                      placeholder="Write your reply..."
                      placeholderTextColor={colors.textMuted}
                      value={replyDraft}
                      onChangeText={setReplyDraft}
                      maxLength={2000}
                      multiline
                      textAlignVertical="top"
                    />
                    <View style={styles.replyFormActions}>
                      <TouchableOpacity
                        style={[styles.replyFormBtn, { backgroundColor: colors.surface }]}
                        onPress={() => { setReplyingTo(null); setReplyDraft(''); }}
                      >
                        <Text style={[styles.replyFormBtnText, { color: colors.textSecondary }]}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.replyFormBtn, { backgroundColor: colors.primary, opacity: submittingReply || !replyDraft.trim() ? 0.6 : 1 }]}
                        onPress={() => handleReplySubmit(review.id)}
                        disabled={submittingReply || !replyDraft.trim()}
                      >
                        {submittingReply ? (
                          <ActivityIndicator size="small" color={colors.white} />
                        ) : (
                          <Text style={[styles.replyFormBtnText, { color: colors.white }]}>Submit</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </Card>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
      )}

      {/* Write Review Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.white, borderTopColor: colors.border, paddingBottom: insets.bottom || spacing.xl }]}>
        <Button
          title="Write a Review"
          onPress={() => setWriteReviewVisible(true)}
          fullWidth
        />
      </View>

      {/* Write Review Modal */}
      <Modal
        visible={writeReviewVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setWriteReviewVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.white }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setWriteReviewVisible(false)} style={styles.modalButton}>
              <Text style={[styles.modalCancel, { color: colors.textSecondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Write Review</Text>
            <TouchableOpacity onPress={handleSubmitReview} style={styles.modalButton}>
              <Text style={[styles.modalSubmit, { color: colors.primary }]}>Submit</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[styles.modalLabel, { color: colors.text }]}>Rate your experience</Text>
            <View style={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)} style={styles.ratingStarButton}>
                  <Icon
                    name="star"
                    size={40}
                    color={star <= reviewRating ? colors.accent : colors.border}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.modalLabel, { color: colors.text }]}>Share your experience</Text>
            <TextInput
              style={[styles.reviewInput, { backgroundColor: colors.surface, color: colors.text }]}
              value={reviewText}
              onChangeText={setReviewText}
              placeholder="What was your experience like? Share details to help others..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: colors.textSecondary }]}>{reviewText.length}/500</Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  summaryCard: {
    marginBottom: spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
  },
  ratingBig: {
    alignItems: 'center',
    paddingRight: spacing.lg,
    borderRightWidth: 1,
  },
  ratingNumber: {
    fontFamily: typography.fonts.heading,
    fontSize: 48,
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    marginTop: spacing.xs,
    gap: 2,
  },
  totalReviews: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  ratingBars: {
    flex: 1,
    paddingLeft: spacing.lg,
    justifyContent: 'center',
  },
  ratingBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingBarLabel: {
    width: 16,
    fontSize: typography.sizes.sm,
  },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    marginHorizontal: spacing.sm,
  },
  ratingBarFill: {
    height: 8,
    borderRadius: 4,
  },
  ratingBarCount: {
    width: 20,
    fontSize: typography.sizes.sm,
    textAlign: 'right',
  },
  reviewCard: {
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  reviewerInfo: {
    flex: 1,
  },
  reviewerName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  reviewDate: {
    fontSize: typography.sizes.xs,
    marginTop: 2,
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  // Reply styles
  replyBlock: {
    marginTop: spacing.md,
    paddingLeft: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: '#FF2A5F',
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  replyLabel: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
    marginBottom: 2,
  },
  replyDateText: {
    fontSize: typography.sizes.xs,
    marginBottom: spacing.xs,
  },
  replyText: {
    fontSize: typography.sizes.md,
    lineHeight: 20,
  },
  replyButton: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    minHeight: 36,
  },
  replyButtonText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  replyForm: {
    marginTop: spacing.md,
  },
  replyInput: {
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    minHeight: 80,
  },
  replyFormActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  replyFormBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyFormBtnText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  // Bottom bar & modal styles
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  modalButton: {
    minWidth: 60,
    minHeight: 44,
    justifyContent: 'center',
  },
  modalCancel: {
    fontSize: typography.sizes.md,
  },
  modalTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  modalSubmit: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    textAlign: 'right',
  },
  modalContent: {
    padding: spacing.lg,
  },
  modalLabel: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  ratingSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  ratingStarButton: {
    padding: spacing.xs,
  },
  reviewInput: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    height: 150,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: typography.sizes.xs,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
