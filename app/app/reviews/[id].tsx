import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { colors, typography, shadows } from '../../src/constants/theme';
import { apiRequest } from '../../src/services/api';

interface ReviewItem {
  id: string;
  rating: number;
  comment?: string;
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

function ReviewCard({ item }: { item: ReviewItem }) {
  const date = new Date(item.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.reviewerName}>{item.reviewer?.name ?? 'Anonymous'}</Text>
        <Text style={styles.dateText}>{date}</Text>
      </View>
      <StarRating rating={item.rating} />
      {!!item.comment && <Text style={styles.comment}>{item.comment}</Text>}
    </View>
  );
}

export default function ReviewDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <View style={styles.container}>
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
          renderItem={({ item }) => <ReviewCard item={item} />}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </View>
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
});
