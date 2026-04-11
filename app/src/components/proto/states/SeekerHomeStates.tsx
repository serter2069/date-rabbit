import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------
const FILTERS = ['All', 'Tonight', '$50-150', '$150-300', 'Verified', 'New'];

const COMPANIONS = [
  { name: 'Jessica M.', age: 24, city: 'Manhattan', price: '$150/hr', rating: '4.9', reviews: 47, verified: true, seed: 'jessica-browse' },
  { name: 'Ashley R.', age: 27, city: 'Brooklyn', price: '$120/hr', rating: '4.7', reviews: 32, verified: true, seed: 'ashley-browse' },
  { name: 'Kate L.', age: 22, city: 'Upper East Side', price: '$200/hr', rating: '4.8', reviews: 19, verified: false, seed: 'kate-browse' },
];

// ---------------------------------------------------------------------------
// Tab bar (shared)
// ---------------------------------------------------------------------------
function TabBar({ active }: { active: number }) {
  const router = useRouter();
  const tabs = [
    { icon: 'home' as const, label: 'Home', route: '/proto/states/seeker-home' },
    { icon: 'calendar' as const, label: 'Bookings', route: '/proto/states/seeker-bookings' },
    { icon: 'message-circle' as const, label: 'Messages', route: '/proto/states/seeker-messages' },
    { icon: 'user' as const, label: 'Profile', route: '/proto/states/seeker-profile' },
  ];
  return (
    <View style={s.tabBar}>
      {tabs.map((t, i) => (
        <Pressable key={t.label} style={s.tabItem} onPress={() => router.push(t.route as any)}>
          <Feather name={t.icon} size={20} color={i === active ? colors.primary : colors.textMuted} />
          <Text style={[s.tabLabel, i === active && { color: colors.primary }]}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Companion card
// ---------------------------------------------------------------------------
function CompanionCard({ c, favorited, onPress }: { c: typeof COMPANIONS[0]; favorited?: boolean; onPress?: () => void }) {
  const [fav, setFav] = useState(favorited ?? false);
  return (
    <Pressable style={[s.companionCard, shadows.sm]} onPress={onPress}>
      <View style={{ position: 'relative' }}>
        <Image source={{ uri: `https://picsum.photos/seed/${c.seed}/320/180` }} style={{ width: '100%', height: 180, borderRadius: 0 }} />
        {c.verified && (
          <View style={s.verifiedBadge}>
            <Feather name={"check-circle" as any} size={10} color={colors.surface} />
            <Text style={s.verifiedText}>Verified</Text>
          </View>
        )}
        <Pressable style={s.heartBtn} onPress={() => setFav(!fav)}>
          <Feather name={"heart" as any} size={18} color={fav ? colors.primary : colors.textLight} />
        </Pressable>
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
  const [query, setQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  return (
    <View style={s.page}>
      {/* Header bar */}
      <View style={s.headerBar}>
        <View style={s.locationRow}>
          <Feather name={"map-pin" as any} size={18} color={colors.primary} />
          <Text style={s.locationText}>New York</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn}>
            <Feather name={"bell" as any} size={20} color={colors.text} />
            <View style={s.notifBadge}><Text style={s.notifText}>2</Text></View>
          </Pressable>
          <Pressable style={s.iconBtn}>
            <Feather name={"sliders" as any} size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Search */}
      <View style={[s.searchBar, shadows.sm]}>
        <Feather name={"search" as any} size={18} color={colors.textMuted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search companions..."
          placeholderTextColor={colors.textLight}
          value={query}
          onChangeText={setQuery}
        />
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

      {/* Grid */}
      <View style={s.grid}>
        {COMPANIONS.map(c => (
          <CompanionCard key={c.name} c={c} onPress={() => router.push('/proto/states/booking-detail' as any)} />
        ))}
      </View>

      <TabBar active={0} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: FILTERED
// ---------------------------------------------------------------------------
function FilteredState() {
  const router = useRouter();
  return (
    <View style={s.page}>
      <View style={s.headerBar}>
        <View style={s.locationRow}>
          <Feather name={"map-pin" as any} size={18} color={colors.primary} />
          <Text style={s.locationText}>New York</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn}><Feather name={"bell" as any} size={20} color={colors.text} /></Pressable>
          <Pressable style={s.iconBtn}><Feather name={"sliders" as any} size={20} color={colors.text} /></Pressable>
        </View>
      </View>

      {/* Active filter banner */}
      <View style={[s.filterBanner, shadows.sm]}>
        <Text style={s.filterBannerText}>Showing: Tonight  $100-200</Text>
        <Pressable style={s.clearFiltersBtn}>
          <Feather name={"x" as any} size={14} color={colors.primary} />
          <Text style={s.clearFiltersText}>Clear filters</Text>
        </Pressable>
      </View>

      <View style={s.grid}>
        {COMPANIONS.slice(0, 2).map(c => (
          <CompanionCard key={c.name} c={c} onPress={() => router.push('/proto/states/booking-detail' as any)} />
        ))}
      </View>

      <TabBar active={0} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 3: EMPTY_RESULTS
// ---------------------------------------------------------------------------
function EmptyResultsState() {
  return (
    <View style={s.page}>
      <View style={s.headerBar}>
        <View style={s.locationRow}>
          <Feather name={"map-pin" as any} size={18} color={colors.primary} />
          <Text style={s.locationText}>New York</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn}><Feather name={"bell" as any} size={20} color={colors.text} /></Pressable>
        </View>
      </View>

      <View style={s.emptyCenter}>
        <View style={s.emptyIconWrap}>
          <Feather name={"search" as any} size={48} color={colors.textLight} />
        </View>
        <Text style={s.emptyTitle}>No companions match your filters</Text>
        <Text style={s.emptySub}>Try adjusting your search criteria</Text>
        <Pressable style={[s.primaryBtn, shadows.button]}>
          <Text style={s.primaryBtnText}>CLEAR FILTERS</Text>
        </Pressable>
      </View>

      <TabBar active={0} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 4: UNVERIFIED_GATE
// ---------------------------------------------------------------------------
function UnverifiedGateState() {
  return (
    <View style={s.page}>
      <View style={s.headerBar}>
        <View style={s.locationRow}>
          <Feather name={"map-pin" as any} size={18} color={colors.primary} />
          <Text style={s.locationText}>New York</Text>
        </View>
        <View style={s.headerRight}>
          <Pressable style={s.iconBtn}><Feather name={"bell" as any} size={20} color={colors.text} /></Pressable>
        </View>
      </View>

      {/* Blurred cards placeholder */}
      <View style={s.blurredGrid}>
        {COMPANIONS.map(c => (
          <View key={c.name} style={[s.blurredCard]}>
            <View style={s.blurOverlay} />
            <Image source={{ uri: `https://picsum.photos/seed/${c.seed}/320/140` }} style={{ width: '100%', height: 140, borderRadius: 0 }} />
          </View>
        ))}
      </View>

      {/* Overlay card */}
      <View style={[s.gateCard, shadows.md]}>
        <Feather name={"check-circle" as any} size={40} color={colors.primary} />
        <Text style={s.gateTitle}>Verify your identity to view companion profiles</Text>
        <Text style={s.gateSub}>Complete our quick verification process to unlock full access</Text>
        <Pressable style={[s.primaryBtn, shadows.button]}>
          <Text style={s.primaryBtnText}>VERIFY NOW</Text>
        </Pressable>
      </View>

      <TabBar active={0} />
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
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="FILTERED" description="Active filter state with reduced results">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <FilteredState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="EMPTY_RESULTS" description="No companions match current filters">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <EmptyResultsState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="UNVERIFIED_GATE" description="User not verified - blurred overlay">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <UnverifiedGateState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
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

  // Header
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  locationText: { ...typography.h3, color: colors.text },
  headerRight: { flexDirection: 'row', gap: 12 },
  iconBtn: { position: 'relative', padding: 4 },
  notifBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifText: { fontSize: 9, fontWeight: '700', color: colors.textInverse },

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
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  chipActive: { backgroundColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text },
  chipTextActive: { color: colors.textInverse },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  // Companion card
  companionCard: {
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

  // Filter banner
  filterBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterBannerText: { ...typography.bodyMedium, color: colors.text, fontSize: 13 },
  clearFiltersBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clearFiltersText: { ...typography.caption, color: colors.primary },

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

  // Primary button
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

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingVertical: 8,
    marginTop: 8,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
});
