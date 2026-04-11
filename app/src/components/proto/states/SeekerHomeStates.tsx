import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader, ProtoTabBar } from '../NavComponents';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const FILTERS = ['All', 'Tonight', '$50-150', '$150-300', 'Verified', 'New'];

const COMPANIONS = [
  { name: 'Jessica M.', age: 24, city: 'Manhattan', price: '$150/hr', rating: '4.9', reviews: 47, verified: true, seed: 'jessica-browse' },
  { name: 'Ashley R.', age: 27, city: 'Brooklyn', price: '$120/hr', rating: '4.7', reviews: 32, verified: true, seed: 'ashley-browse' },
  { name: 'Kate L.', age: 22, city: 'Upper East Side', price: '$200/hr', rating: '4.8', reviews: 19, verified: false, seed: 'kate-browse' },
  { name: 'Sophia D.', age: 25, city: 'SoHo', price: '$180/hr', rating: '4.9', reviews: 56, verified: true, seed: 'sophia-browse' },
  { name: 'Emma W.', age: 23, city: 'Chelsea', price: '$130/hr', rating: '4.6', reviews: 28, verified: true, seed: 'emma-browse' },
  { name: 'Olivia T.', age: 26, city: 'West Village', price: '$160/hr', rating: '4.8', reviews: 41, verified: true, seed: 'olivia-browse' },
];

// ---------------------------------------------------------------------------
// PageShell — full-screen wrapper with header + tab bar
// ---------------------------------------------------------------------------
function PageShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  return (
    <View style={s.shell}>
      <ProtoHeader variant="seeker" onLogoPress={() => {}} />
      <View style={[s.shellContent, !isMobile && s.shellDesktop]}>
        {children}
      </View>
      {isMobile && <ProtoTabBar role="seeker" activeTab="home" />}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Companion card
// ---------------------------------------------------------------------------
function CompanionCard({ c, favorited }: { c: typeof COMPANIONS[0]; favorited?: boolean }) {
  const [fav, setFav] = useState(favorited ?? false);
  const { width } = useWindowDimensions();
  const isDesktop = width > 768;
  return (
    <Pressable style={[s.companionCard, shadows.sm]}>
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: `https://picsum.photos/seed/${c.seed}/320/180` }} style={{ width: '100%', height: 180 }} />
        {c.verified && (
          <View style={s.verifiedBadge}>
            <Feather name="check-circle" size={10} color={colors.surface} />
            <Text style={s.verifiedText}>Verified</Text>
          </View>
        )}
        <Pressable style={s.heartBtn} onPress={() => setFav(!fav)}>
          <Feather name={fav ? 'heart' : 'heart'} size={18} color={fav ? colors.primary : colors.textLight} />
        </Pressable>
      </View>
      <View style={s.cardBody}>
        <Text style={s.cardName}>{c.name}, {c.age}</Text>
        <View style={s.cardCityRow}>
          <Feather name="map-pin" size={10} color={colors.textMuted} />
          <Text style={s.cardCity}>{c.city}</Text>
        </View>
        <View style={s.cardFooter}>
          <Text style={s.cardPrice}>{c.price}</Text>
          <View style={s.ratingRow}>
            <Feather name="star" size={12} color={colors.warning} />
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
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  return (
    <View style={s.page}>
      {/* Location */}
      <View style={s.locationRow}>
        <Feather name="map-pin" size={18} color={colors.primary} />
        <Text style={s.locationText}>New York</Text>
        <Feather name="chevron-down" size={14} color={colors.textMuted} />
      </View>

      {/* Search */}
      <View style={[s.searchBar, shadows.sm]}>
        <Feather name="search" size={18} color={colors.textMuted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search companions..."
          placeholderTextColor={colors.textLight}
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <Feather name="x" size={16} color={colors.textLight} />
          </Pressable>
        )}
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.chipsScroll} contentContainerStyle={s.chipsRow}>
        {FILTERS.map(f => (
          <Pressable
            key={f}
            style={[s.chip, selectedFilter === f && s.chipActive]}
            onPress={() => setSelectedFilter(f)}
          >
            <Text style={[s.chipText, selectedFilter === f && s.chipTextActive]}>{f}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Results count */}
      <Text style={s.resultsCount}>{COMPANIONS.length} companions available</Text>

      {/* Grid */}
      <View style={s.grid}>
        {COMPANIONS.map(c => (
          <CompanionCard key={c.name} c={c} />
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: FILTERED
// ---------------------------------------------------------------------------
function FilteredState() {
  return (
    <View style={s.page}>
      <View style={s.locationRow}>
        <Feather name="map-pin" size={18} color={colors.primary} />
        <Text style={s.locationText}>New York</Text>
      </View>

      {/* Active filter banner */}
      <View style={[s.filterBanner, shadows.sm]}>
        <View style={s.filterTags}>
          <View style={s.filterTag}>
            <Text style={s.filterTagText}>Tonight</Text>
            <Feather name="x" size={12} color={colors.primary} />
          </View>
          <View style={s.filterTag}>
            <Text style={s.filterTagText}>$100-200</Text>
            <Feather name="x" size={12} color={colors.primary} />
          </View>
        </View>
        <Pressable style={s.clearFiltersBtn}>
          <Text style={s.clearFiltersText}>Clear all</Text>
        </Pressable>
      </View>

      <Text style={s.resultsCount}>2 companions found</Text>

      <View style={s.grid}>
        {COMPANIONS.slice(0, 2).map(c => (
          <CompanionCard key={c.name} c={c} />
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 3: EMPTY_RESULTS
// ---------------------------------------------------------------------------
function EmptyResultsState() {
  return (
    <View style={s.page}>
      <View style={s.locationRow}>
        <Feather name="map-pin" size={18} color={colors.primary} />
        <Text style={s.locationText}>New York</Text>
      </View>

      <View style={s.emptyCenter}>
        <View style={s.emptyIconWrap}>
          <Feather name="search" size={48} color={colors.textLight} />
        </View>
        <Text style={s.emptyTitle}>No companions match your filters</Text>
        <Text style={s.emptySub}>Try adjusting your search criteria or expand the area</Text>
        <Pressable style={[s.primaryBtn, shadows.button]}>
          <Text style={s.primaryBtnText}>CLEAR FILTERS</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 4: UNVERIFIED_GATE
// ---------------------------------------------------------------------------
function UnverifiedGateState() {
  return (
    <View style={s.page}>
      <View style={s.locationRow}>
        <Feather name="map-pin" size={18} color={colors.primary} />
        <Text style={s.locationText}>New York</Text>
      </View>

      {/* Blurred cards placeholder */}
      <View style={s.blurredGrid}>
        {COMPANIONS.slice(0, 3).map(c => (
          <View key={c.name} style={s.blurredCard}>
            <View style={s.blurOverlay} />
            <Image source={{ uri: `https://picsum.photos/seed/${c.seed}/320/140` }} style={{ width: '100%', height: 140 }} />
          </View>
        ))}
      </View>

      {/* Overlay card */}
      <View style={[s.gateCard, shadows.md]}>
        <Feather name="shield" size={40} color={colors.primary} />
        <Text style={s.gateTitle}>Verify your identity to browse companions</Text>
        <Text style={s.gateSub}>Complete a quick ID verification to unlock full access. Takes 2 minutes.</Text>
        <Pressable style={[s.primaryBtn, shadows.button]}>
          <Text style={s.primaryBtnText}>VERIFY NOW</Text>
          <Feather name="arrow-right" size={16} color={colors.textInverse} />
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function SeekerHomeStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Browse Companions - full grid with search and filters">
        <PageShell>
          <DefaultState />
        </PageShell>
      </StateSection>
      <StateSection title="FILTERED" description="Active filter state with reduced results">
        <PageShell>
          <FilteredState />
        </PageShell>
      </StateSection>
      <StateSection title="EMPTY_RESULTS" description="No companions match current filters">
        <PageShell>
          <EmptyResultsState />
        </PageShell>
      </StateSection>
      <StateSection title="UNVERIFIED_GATE" description="User not verified - blurred overlay">
        <PageShell>
          <UnverifiedGateState />
        </PageShell>
      </StateSection>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  shell: {
    minHeight: 844,
    backgroundColor: colors.background,
    flex: 1,
  },
  shellContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  shellDesktop: {
    maxWidth: 960,
    alignSelf: 'center',
    width: '100%',
  },
  page: { gap: 12, paddingBottom: 16 },

  // Location
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { ...typography.h3, color: colors.text },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { ...typography.body, flex: 1, color: colors.text },

  // Chips
  chipsScroll: { flexGrow: 0 },
  chipsRow: { gap: 8, paddingVertical: 4 },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text },
  chipTextActive: { color: colors.textInverse },

  resultsCount: { ...typography.caption, color: colors.textMuted },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  // Companion card
  companionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
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
    borderWidth: borderWidth.thin,
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
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { padding: 10, gap: 3 },
  cardName: { ...typography.bodyMedium, color: colors.text },
  cardCityRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  cardCity: { ...typography.caption, color: colors.textMuted },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  cardPrice: { ...typography.bodyMedium, color: colors.primary, fontSize: 13 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingText: { ...typography.caption, color: colors.textSecondary, fontSize: 10 },

  // Filter banner
  filterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterTags: { flexDirection: 'row', gap: 6 },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.badge.pink.bg,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  filterTagText: { ...typography.caption, color: colors.primary },
  clearFiltersBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  clearFiltersText: { ...typography.caption, color: colors.primary, textDecorationLine: 'underline' },

  // Empty
  emptyCenter: { alignItems: 'center', paddingVertical: 48, gap: 12, flex: 1, justifyContent: 'center' },
  emptyIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.backgroundWarm,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { ...typography.h3, color: colors.text, textAlign: 'center' },
  emptySub: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },

  // Primary button
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  primaryBtnText: { ...typography.button, color: colors.textInverse },

  // Unverified gate
  blurredGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, opacity: 0.3 },
  blurredCard: { width: '47%', overflow: 'hidden', borderRadius: borderRadius.sm },
  blurOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    opacity: 0.6,
    zIndex: 1,
  },
  gateCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    marginTop: -60,
  },
  gateTitle: { ...typography.h3, color: colors.text, textAlign: 'center' },
  gateSub: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
});
