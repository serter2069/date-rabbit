import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const FAVORITES = [
  { name: 'Jessica M.', age: 24, city: 'Manhattan', price: '$150/hr', rating: '4.9', reviews: 47, verified: true, seed: 'jessica-fav' },
  { name: 'Ashley R.', age: 27, city: 'Brooklyn', price: '$120/hr', rating: '4.7', reviews: 32, verified: true, seed: 'ashley-fav' },
  { name: 'Kate L.', age: 22, city: 'Upper East Side', price: '$200/hr', rating: '4.8', reviews: 19, verified: false, seed: 'kate-fav' },
];

// ---------------------------------------------------------------------------
// Favorite card
// ---------------------------------------------------------------------------
function FavoriteCard({ c, onPress }: { c: typeof FAVORITES[0]; onPress?: () => void }) {
  return (
    <Pressable style={[s.card, shadows.sm]} onPress={onPress}>
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: `https://picsum.photos/seed/${c.seed}/320/180` }} style={{ width: '100%', height: 180, borderRadius: 0 }} />
        {c.verified && (
          <View style={s.verifiedBadge}>
            <Feather name={"check-circle" as any} size={10} color={colors.surface} />
            <Text style={s.verifiedText}>Verified</Text>
          </View>
        )}
        <View style={s.heartBtn}>
          <Feather name={"heart" as any} size={18} color={colors.primary} />
        </View>
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName}>{c.name}, {c.age}</Text>
        <Text style={s.cardCity}>{c.city}</Text>
        <View style={s.cardFooter}>
          <Text style={s.cardPrice}>{c.price}</Text>
          <View style={s.ratingRow}>
            <Feather name={"star" as any} size={12} color={colors.warning} />
            <Text style={s.ratingText}>{c.rating} ({c.reviews})</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  const router = useRouter();
  return (
    <View style={s.page}>
      <View style={s.headerRow}>
        <Text style={s.pageTitle}>Saved Companions</Text>
        <View style={s.countBadge}>
          <Text style={s.countText}>3 saved</Text>
        </View>
      </View>

      <View style={s.grid}>
        {FAVORITES.map(c => (
          <FavoriteCard key={c.name} c={c} onPress={() => router.push('/proto/states/booking-detail' as any)} />
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: EMPTY
// ---------------------------------------------------------------------------
function EmptyState() {
  const router = useRouter();
  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>Saved Companions</Text>

      <View style={s.emptyCenter}>
        <View style={s.emptyIconWrap}>
          <Feather name={"heart" as any} size={48} color={colors.textLight} />
        </View>
        <Text style={s.emptyTitle}>No favorites yet</Text>
        <Text style={s.emptySub}>Save companions you like to find them quickly later</Text>
        <Pressable style={[s.primaryBtn, shadows.button]} onPress={() => router.push('/proto/states/seeker-home' as any)}>
          <Text style={s.primaryBtnText}>BROWSE COMPANIONS</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function SeekerFavoritesStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Favorites grid with saved companions">
        <DefaultState />
      </StateSection>
      <StateSection title="EMPTY" description="No favorites saved yet">
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
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countBadge: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  countText: { ...typography.caption, color: colors.textInverse, fontWeight: '700', fontSize: 10 },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  // Card
  card: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  verifiedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedText: { fontSize: 9, fontWeight: '700', color: colors.surface },
  heartBtn: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 10, gap: 2 },
  cardName: { ...typography.bodyMedium, color: colors.text },
  cardCity: { ...typography.caption, color: colors.textMuted },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  cardPrice: { ...typography.bodyMedium, color: colors.primary, fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { ...typography.caption, color: colors.textSecondary, fontSize: 10 },

  // Empty
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
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { ...typography.button, color: colors.textInverse },
});
