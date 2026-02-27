import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { showAlert } from '../../src/utils/alert';
import { Icon } from '../../src/components/Icon';
import { EmptyState } from '../../src/components/EmptyState';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';

// Mock reviews data
const reviewsData: Record<string, {
  profileName: string;
  averageRating: number;
  totalReviews: number;
  reviews: Array<{
    id: string;
    reviewerName: string;
    rating: number;
    text: string;
    date: string;
    helpful: number;
  }>;
}> = {
  '1': {
    profileName: 'Sarah',
    averageRating: 4.9,
    totalReviews: 24,
    reviews: [
      { id: 'r1', reviewerName: 'Michael', rating: 5, text: 'Amazing evening! Sarah is a wonderful companion. We had great conversations over dinner and she made the whole experience memorable.', date: '2 weeks ago', helpful: 12 },
      { id: 'r2', reviewerName: 'James', rating: 5, text: 'Great conversation and very professional. Sarah arrived on time and was engaging throughout our dinner meeting.', date: '1 month ago', helpful: 8 },
      { id: 'r3', reviewerName: 'David', rating: 5, text: 'Highly recommend! Made the dinner so enjoyable. Would definitely book again.', date: '1 month ago', helpful: 5 },
      { id: 'r4', reviewerName: 'William', rating: 4, text: 'Pleasant evening. Sarah is knowledgeable about art and we had interesting discussions.', date: '2 months ago', helpful: 3 },
      { id: 'r5', reviewerName: 'Alexander', rating: 5, text: 'Perfect companion for my business dinner. Very articulate and charming.', date: '2 months ago', helpful: 7 },
    ],
  },
  '2': {
    profileName: 'Emma',
    averageRating: 4.8,
    totalReviews: 18,
    reviews: [
      { id: 'r1', reviewerName: 'Thomas', rating: 5, text: 'Emma is so easy to talk to. Highly recommended! She has great energy and makes you feel comfortable.', date: '1 week ago', helpful: 10 },
      { id: 'r2', reviewerName: 'Robert', rating: 4, text: 'Pleasant company, very thoughtful. Enjoyed our coffee date.', date: '3 weeks ago', helpful: 4 },
    ],
  },
};

const defaultData = {
  profileName: 'Profile',
  averageRating: 0,
  totalReviews: 0,
  reviews: [],
};

export default function ReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const data = reviewsData[id || ''] || defaultData;

  const [writeReviewVisible, setWriteReviewVisible] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'helpful'>('recent');

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

  const sortedReviews = [...data.reviews].sort((a, b) => {
    if (sortBy === 'helpful') {
      return b.helpful - a.helpful;
    }
    return 0; // Keep original order for recent
  });

  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: data.reviews.filter(r => r.rating === rating).length,
    percentage: data.reviews.length > 0
      ? (data.reviews.filter(r => r.rating === rating).length / data.reviews.length) * 100
      : 0,
  }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Reviews</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Summary Card */}
        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={[styles.ratingBig, { borderRightColor: colors.border }]}>
              <Text style={[styles.ratingNumber, { color: colors.text }]}>{data.averageRating.toFixed(1)}</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Icon
                    key={star}
                    name="star"
                    size={16}
                    color={star <= Math.round(data.averageRating) ? colors.accent : colors.border}
                  />
                ))}
              </View>
              <Text style={[styles.totalReviews, { color: colors.textSecondary }]}>{data.totalReviews} reviews</Text>
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

        {/* Sort Options */}
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: sortBy === 'recent' ? colors.primary : colors.surface }]}
            onPress={() => setSortBy('recent')}
          >
            <Text style={[styles.sortButtonText, { color: sortBy === 'recent' ? colors.white : colors.textSecondary }]}>
              Most Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortButton, { backgroundColor: sortBy === 'helpful' ? colors.primary : colors.surface }]}
            onPress={() => setSortBy('helpful')}
          >
            <Text style={[styles.sortButtonText, { color: sortBy === 'helpful' ? colors.white : colors.textSecondary }]}>
              Most Helpful
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reviews List */}
        {sortedReviews.length === 0 ? (
          <EmptyState
            icon="edit-3"
            title="No reviews yet"
            description="Be the first to leave a review!"
          />
        ) : (
          sortedReviews.map((review) => (
            <Card key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewerInfo}>
                  <Text style={[styles.reviewerName, { color: colors.text }]}>{review.reviewerName}</Text>
                  <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{review.date}</Text>
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
              <Text style={[styles.reviewText, { color: colors.textSecondary }]}>{review.text}</Text>
              <View style={[styles.reviewFooter, { borderTopColor: colors.border }]}>
                <TouchableOpacity style={styles.helpfulButton}>
                  <Icon name="thumbs-up" size={16} color={colors.textSecondary} />
                  <Text style={[styles.helpfulText, { color: colors.textSecondary }]}> Helpful ({review.helpful})</Text>
                </TouchableOpacity>
              </View>
            </Card>
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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
            <Text style={[styles.modalLabel, { color: colors.text }]}>Rate your experience with {data.profileName}</Text>
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
  sortRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  sortButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    minHeight: 44,
    justifyContent: 'center',
  },
  sortButtonText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
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
  reviewFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
  },
  helpfulButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  helpfulText: {
    fontSize: typography.sizes.sm,
  },
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
