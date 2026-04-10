import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function StarsRow({ count }: { count: number }) {
  return (
    <View style={s.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Feather
          key={i}
          name={"star" as any}
          size={14}
          color={i <= count ? colors.primary : colors.borderLight}
        />
      ))}
    </View>
  );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <View style={s.ratingBarRow}>
      <Text style={s.ratingBarLabel}>{stars}</Text>
      <Feather name={"star" as any} size={12} color={colors.primary} />
      <View style={s.ratingBarTrack}>
        <View style={[s.ratingBarFill, { width: `${pct}%` }]} />
      </View>
      <Text style={s.ratingBarCount}>{count}</Text>
    </View>
  );
}

const REVIEW_SEEDS: Record<string, string> = {
  'James W.': 'james-review',
  'Michael T.': 'michael-review',
  'David K.': 'david-review',
};

function ReviewCard({ name, date, rating, text }: { name: string; date: string; rating: number; text: string }) {
  const seed = REVIEW_SEEDS[name] || 'review-user';
  return (
    <View style={[s.reviewCard, shadows.sm]}>
      <View style={s.reviewHeader}>
        <Image source={{ uri: `https://picsum.photos/seed/${seed}/40/40` }} style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.border }} />
        <View style={s.reviewMeta}>
          <Text style={s.reviewName}>{name}</Text>
          <Text style={s.reviewDate}>{date}</Text>
        </View>
        <StarsRow count={rating} />
      </View>
      <Text style={s.reviewText}>{text}</Text>
      <View style={s.verifiedBadge}>
        <Feather name={"check-circle" as any} size={12} color={colors.success} />
        <Text style={s.verifiedText}>Verified Booking</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  const breakdown = [
    { stars: 5, count: 38 },
    { stars: 4, count: 6 },
    { stars: 3, count: 2 },
    { stars: 2, count: 1 },
    { stars: 1, count: 0 },
  ];
  const total = 47;

  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>Reviews for Jessica Martinez</Text>
      <Text style={s.reviewCount}>{total} reviews</Text>

      {/* Overall rating */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.overallRow}>
          <Text style={s.overallRating}>4.9</Text>
          <View style={s.overallRight}>
            <StarsRow count={5} />
            <Text style={s.overallLabel}>out of 5</Text>
          </View>
        </View>
        <View style={s.breakdownWrap}>
          {breakdown.map((b) => (
            <RatingBar key={b.stars} stars={b.stars} count={b.count} total={total} />
          ))}
        </View>
      </View>

      {/* Review cards */}
      <ReviewCard
        name="James W."
        date="March 2026"
        rating={5}
        text="Jessica was absolutely wonderful — punctual, elegant, and great conversation. Le Bernardin was perfect."
      />
      <ReviewCard
        name="Michael T."
        date="February 2026"
        rating={5}
        text="Professional, beautiful, and so easy to talk to."
      />
      <ReviewCard
        name="David K."
        date="January 2026"
        rating={4}
        text="Great evening, would definitely book again."
      />

      <Pressable style={[s.ghostBtn, shadows.sm]}>
        <Text style={s.ghostBtnText}>Load more reviews</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: EMPTY
// ---------------------------------------------------------------------------
function EmptyState() {
  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>Reviews for Jessica Martinez</Text>

      <View style={s.emptyCenter}>
        <View style={s.emptyIconWrap}>
          <Feather name={"star" as any} size={48} color={colors.textLight} />
        </View>
        <Text style={s.emptyTitle}>No reviews yet.</Text>
        <Text style={s.emptySub}>Be the first to review</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function ReviewsViewStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Reviews list with breakdown">
        <DefaultState />
      </StateSection>
      <StateSection title="EMPTY" description="No reviews yet">
        <EmptyState />
      </StateSection>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16 },

  pageTitle: { ...typography.h2, color: colors.text },
  reviewCount: { ...typography.bodySmall, color: colors.textMuted, marginTop: -8 },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 12,
  },

  overallRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  overallRating: { fontSize: 48, fontWeight: '700', color: colors.text, fontFamily: typography.fonts.heading },
  overallRight: { gap: 4 },
  overallLabel: { ...typography.caption, color: colors.textMuted },

  breakdownWrap: { gap: 4 },
  ratingBarRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingBarLabel: { ...typography.caption, color: colors.textMuted, width: 12, textAlign: 'right' },
  ratingBarTrack: {
    flex: 1,
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  ratingBarCount: { ...typography.caption, color: colors.textMuted, width: 24 },

  starsRow: { flexDirection: 'row', gap: 2 },

  reviewCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 10,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewMeta: { flex: 1 },
  reviewName: { ...typography.bodyMedium, color: colors.text },
  reviewDate: { ...typography.caption, color: colors.textMuted },
  reviewText: { ...typography.body, color: colors.textSecondary },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.successLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  verifiedText: { ...typography.caption, color: colors.success, fontWeight: '700' },

  ghostBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  ghostBtnText: { ...typography.button, color: colors.text },

  emptyCenter: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { ...typography.h3, color: colors.text, textAlign: 'center' },
  emptySub: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
});
