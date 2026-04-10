import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — Companion public profile (self view)
// ===========================================================================
function DefaultState() {
  const services = ['Dinner Date', 'Cocktail Evening', 'Art Gallery', 'Theater'];

  return (
    <View style={s.page}>
      {/* Cover photo */}
      <Image source={{ uri: 'https://picsum.photos/seed/comp-profile-banner/800/200' }} style={{ width: '100%', height: 200, borderWidth: 2, borderColor: '#000' }} />

      {/* Profile section */}
      <View style={s.profileSection}>
        <View style={s.avatarWrap}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-profile/100/100' }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#000' }} />
        </View>
        <Text style={s.profileName}>Jessica Martinez</Text>
        <View style={s.metaRow}>
          <Feather name={"map-pin" as any} size={14} color={colors.textMuted} />
          <Text style={s.metaText}>Miami -- New York</Text>
        </View>
        <View style={s.metaRow}>
          <Feather name={"dollar-sign" as any} size={14} color={colors.success} />
          <Text style={[s.metaText, { color: colors.success }]}>$150/hour</Text>
        </View>
        <View style={s.metaRow}>
          <Feather name={"star" as any} size={14} color={colors.primary} />
          <Text style={s.ratingText}>4.9</Text>
          <Text style={s.reviewCount}>(47 reviews)</Text>
        </View>

        <Pressable style={[s.btnPrimary, shadows.button, { marginTop: 12 }]} onPress={() => router.push('/proto/states/settings-edit-profile' as any)}>
          <Text style={s.btnPrimaryText}>EDIT PROFILE</Text>
        </Pressable>
      </View>

      {/* Photos grid */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>Photos</Text>
        <View style={s.photosGrid}>
          {(['jessica-photo-1', 'jessica-photo-2', 'jessica-photo-3', 'jessica-photo-4'] as const).map(seed => (
            <View key={seed} style={s.photoCell}>
              <Image source={{ uri: `https://picsum.photos/seed/${seed}/160/160` }} style={{ width: '100%', aspectRatio: 1, borderRadius: 8, borderWidth: 2, borderColor: '#000' }} />
            </View>
          ))}
        </View>
      </View>

      {/* About */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>About</Text>
        <Text style={s.bioText}>
          Sophisticated and adventurous companion based in NYC. I love fine dining, art, and genuine conversation.
        </Text>
      </View>

      {/* Services */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>Services Offered</Text>
        <View style={s.chipsRow}>
          {services.map(svc => (
            <View key={svc} style={s.chip}>
              <Text style={s.chipText}>{svc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        {[
          { value: '47', label: 'dates completed' },
          { value: '4.9', label: 'rating' },
          { value: 'Jan 2026', label: 'member since' },
        ].map(st => (
          <View key={st.label} style={[s.statItem, shadows.sm]}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Reviews header */}
      <View style={s.reviewsHeader}>
        <Text style={s.cardTitle}>Reviews</Text>
        <Pressable style={s.seeAllBtn}>
          <Text style={s.seeAllText}>See all 47 reviews</Text>
          <Feather name={"chevron-right" as any} size={14} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 2: PREVIEW_MODE — Viewing as seeker
// ===========================================================================
function PreviewModeState() {
  const services = ['Dinner Date', 'Cocktail Evening', 'Art Gallery', 'Theater'];

  return (
    <View style={s.page}>
      {/* Preview banner */}
      <View style={s.previewBanner}>
        <Text style={s.previewBannerText}>Previewing as seeker</Text>
        <Pressable>
          <Text style={s.exitPreviewText}>Exit Preview</Text>
        </Pressable>
      </View>

      {/* Cover */}
      <Image source={{ uri: 'https://picsum.photos/seed/comp-profile-banner/800/200' }} style={{ width: '100%', height: 200, borderWidth: 2, borderColor: '#000' }} />

      {/* Profile section */}
      <View style={s.profileSection}>
        <View style={s.avatarWrap}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-profile/100/100' }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#000' }} />
        </View>
        <Text style={s.profileName}>Jessica Martinez</Text>
        <View style={s.metaRow}>
          <Feather name={"map-pin" as any} size={14} color={colors.textMuted} />
          <Text style={s.metaText}>Miami -- New York</Text>
        </View>
        <View style={s.metaRow}>
          <Feather name={"dollar-sign" as any} size={14} color={colors.success} />
          <Text style={[s.metaText, { color: colors.success }]}>$150/hour</Text>
        </View>
        <View style={s.metaRow}>
          <Feather name={"star" as any} size={14} color={colors.primary} />
          <Text style={s.ratingText}>4.9</Text>
          <Text style={s.reviewCount}>(47 reviews)</Text>
        </View>

        {/* Book Now + Heart */}
        <View style={s.previewActions}>
          <Pressable style={[s.btnPrimary, shadows.button, { flex: 1 }]}>
            <Text style={s.btnPrimaryText}>BOOK NOW</Text>
          </Pressable>
          <Pressable style={[s.heartBtn, shadows.sm]}>
            <Feather name={"heart" as any} size={20} color={colors.primary} />
          </Pressable>
        </View>
      </View>

      {/* About */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>About</Text>
        <Text style={s.bioText}>
          Sophisticated and adventurous companion based in NYC. I love fine dining, art, and genuine conversation.
        </Text>
      </View>

      {/* Services */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>Services Offered</Text>
        <View style={s.chipsRow}>
          {services.map(svc => (
            <View key={svc} style={s.chip}>
              <Text style={s.chipText}>{svc}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function CompProfileStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Companion public profile (self view)">
        <DefaultState />
      </StateSection>
      <StateSection title="PREVIEW_MODE" description="Viewing profile as seeker would see it">
        <PreviewModeState />
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 12, width: '100%' },

  // Profile section
  profileSection: { alignItems: 'center', gap: 4, paddingHorizontal: 16 },
  avatarWrap: { marginTop: -50 },
  profileName: { ...typography.h2, color: colors.text, marginTop: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...typography.bodySmall, color: colors.textMuted },
  ratingText: { ...typography.bodyMedium, color: colors.primary, fontWeight: '700' },
  reviewCount: { ...typography.bodySmall, color: colors.textMuted },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: 8 },

  // Photos grid
  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  photoCell: { width: '48%' },

  // Bio
  bioText: { ...typography.body, color: colors.textSecondary },

  // Chips
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: colors.badge.pink.bg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 8 },
  statItem: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 10,
    alignItems: 'center',
  },
  statValue: { ...typography.h3, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textMuted, textAlign: 'center', fontSize: 10 },

  // Reviews header
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  seeAllText: { ...typography.caption, color: colors.primary },

  // Primary button
  btnPrimary: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: { ...typography.button, color: colors.textInverse },

  // Preview banner
  previewBanner: {
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewBannerText: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },
  exitPreviewText: { ...typography.caption, color: colors.text, textDecorationLine: 'underline' },

  // Preview actions
  previewActions: { flexDirection: 'row', gap: 8, marginTop: 12, width: '100%' },
  heartBtn: {
    width: 44,
    height: 44,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
