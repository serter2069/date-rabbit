import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image , ScrollView, useWindowDimensions} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader, ProtoTabBar } from '../NavComponents';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// SERVICES DATA
// ===========================================================================
const SERVICES = [
  'Dinner Date',
  'Cocktail Evening',
  'City Tour',
  'Art Gallery',
  'Theater',
  'Sports Events',
] as const;


// ===========================================================================
// PageShell
// ===========================================================================
function PageShell({ children }: { children: React.ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="companion" />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flex: 1, maxWidth: 960, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
      
    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Main companion setup form
// ===========================================================================
function DefaultState() {
  const [bio, setBio] = useState('Fun-loving foodie who enjoys cocktails, live music, and great conversation. I know all the best spots in Miami.');
  const [hourlyRate, setHourlyRate] = useState('150');
  const [selectedServices, setSelectedServices] = useState<Set<string>>(
    new Set(['Dinner Date', 'Cocktail Evening', 'City Tour'])
  );

  const toggleService = (service: string) => {
    setSelectedServices(prev => {
      const next = new Set(prev);
      if (next.has(service)) {
        next.delete(service);
      } else {
        next.add(service);
      }
      return next;
    });
  };

  return (
    <View style={s.page}>
      {/* Section: About You */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>About You</Text>

        {/* Bio */}
        <Text style={s.label}>BIO</Text>
        <TextInput
          style={s.bioInput}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="Tell clients about yourself..."
          placeholderTextColor={colors.textLight}
        />

        {/* Location */}
        <Text style={[s.label, { marginTop: 12 }]}>LOCATION</Text>
        <Pressable style={[s.locationRow, shadows.sm]}>
          <Feather name={"map-pin" as any} size={18} color={colors.primary} />
          <Text style={s.locationText}>Miami, FL</Text>
        </Pressable>

        {/* Age */}
        <Text style={[s.label, { marginTop: 12 }]}>AGE</Text>
        <View style={s.ageBadge}>
          <Text style={s.ageBadgeText}>26</Text>
        </View>

        {/* Hourly Rate */}
        <Text style={[s.label, { marginTop: 12 }]}>HOURLY RATE</Text>
        <View style={s.rateRow}>
          <Text style={s.rateDollar}>$</Text>
          <TextInput
            style={s.rateInput}
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textLight}
          />
          <Text style={s.rateUnit}>/hour</Text>
        </View>
      </View>

      {/* Section: Your Photos */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>Your Photos</Text>
        <View style={s.photosGrid}>
          {/* 4 filled slots */}
          {(['comp-photo-1', 'comp-photo-2', 'comp-photo-3', 'comp-photo-4'] as const).map(seed => (
            <View key={seed} style={s.photoSlot}>
              <Image source={{ uri: `https://picsum.photos/seed/${seed}/100/100` }} style={{ width: 100, height: 100, borderRadius: 8, borderWidth: 2, borderColor: '#000' }} />
            </View>
          ))}
          {/* 2 empty add slots */}
          {[4, 5].map(i => (
            <Pressable key={i} style={s.photoSlotEmpty}>
              <Feather name={"plus" as any} size={24} color={colors.textLight} />
            </Pressable>
          ))}
        </View>
        <View style={s.photoCountRow}>
          <View style={s.photoCountBadge}>
            <Feather name={"camera" as any} size={12} color={colors.primary} />
            <Text style={s.photoCountText}>4/6 photos</Text>
          </View>
        </View>
        <Text style={s.photoNote}>Minimum 4 photos required</Text>
      </View>

      {/* Section: Services */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>Services</Text>
        <View style={s.chipsRow}>
          {SERVICES.map(service => {
            const isSelected = selectedServices.has(service);
            return (
              <Pressable
                key={service}
                style={[
                  s.chip,
                  isSelected && s.chipSelected,
                  shadows.sm,
                ]}
                onPress={() => toggleService(service)}
              >
                <Text style={[s.chipText, isSelected && s.chipTextSelected]}>
                  {service}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Save button */}
      <Pressable style={[s.btnPrimary, shadows.button]} onPress={() => router.push('/proto/states/comp-onboard-verify' as any)}>
        <Text style={s.btnPrimaryText}>SAVE & CONTINUE</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// STATE 2: MISSING_PHOTOS — photo section highlighted red
// ===========================================================================
function MissingPhotosState() {
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  const toggleService = (service: string) => {
    setSelectedServices(prev => {
      const next = new Set(prev);
      if (next.has(service)) {
        next.delete(service);
      } else {
        next.add(service);
      }
      return next;
    });
  };

  return (
    <View style={s.page}>
      {/* Section: About You */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>About You</Text>
        <Text style={s.label}>BIO</Text>
        <TextInput
          style={s.bioInput}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          placeholder="Tell clients about yourself..."
          placeholderTextColor={colors.textLight}
        />
        <Text style={[s.label, { marginTop: 12 }]}>LOCATION</Text>
        <Pressable style={[s.locationRow, shadows.sm]}>
          <Feather name={"map-pin" as any} size={18} color={colors.primary} />
          <Text style={s.locationText}>Miami, FL</Text>
        </Pressable>
        <Text style={[s.label, { marginTop: 12 }]}>AGE</Text>
        <View style={s.ageBadge}>
          <Text style={s.ageBadgeText}>26</Text>
        </View>
        <Text style={[s.label, { marginTop: 12 }]}>HOURLY RATE</Text>
        <View style={s.rateRow}>
          <Text style={s.rateDollar}>$</Text>
          <TextInput
            style={s.rateInput}
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={colors.textLight}
          />
          <Text style={s.rateUnit}>/hour</Text>
        </View>
      </View>

      {/* Section: Your Photos — ERROR STATE */}
      <View style={[s.card, shadows.sm, s.cardError]}>
        <Text style={s.sectionTitle}>Your Photos</Text>
        <View style={s.photosGrid}>
          {/* 1 filled slot only */}
          <View style={s.photoSlot}>
            <Image source={{ uri: 'https://picsum.photos/seed/comp-photo-1/100/100' }} style={{ width: 100, height: 100, borderRadius: 8, borderWidth: 2, borderColor: '#000' }} />
          </View>
          {/* 5 empty add slots */}
          {[1, 2, 3, 4, 5].map(i => (
            <Pressable key={i} style={[s.photoSlotEmpty, s.photoSlotEmptyError]}>
              <Feather name={"plus" as any} size={24} color={colors.error} />
            </Pressable>
          ))}
        </View>
        <View style={s.photoCountRow}>
          <View style={[s.photoCountBadge, { backgroundColor: colors.errorLight }]}>
            <Feather name={"camera" as any} size={12} color={colors.error} />
            <Text style={[s.photoCountText, { color: colors.error }]}>1/6 photos</Text>
          </View>
        </View>
        <Text style={s.photoError}>Please add at least 4 photos</Text>
      </View>

      {/* Section: Services */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>Services</Text>
        <View style={s.chipsRow}>
          {SERVICES.map(service => {
            const isSelected = selectedServices.has(service);
            return (
              <Pressable
                key={service}
                style={[s.chip, isSelected && s.chipSelected, shadows.sm]}
                onPress={() => toggleService(service)}
              >
                <Text style={[s.chipText, isSelected && s.chipTextSelected]}>
                  {service}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable style={[s.btnPrimary, shadows.button]} onPress={() => router.push('/proto/states/comp-onboard-verify' as any)}>
        <Text style={s.btnPrimaryText}>SAVE & CONTINUE</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// STATE 3: VIDEO_PICKER — overlay modal for video upload
// ===========================================================================
function VideoPickerState() {
  return (
    <View style={s.page}>
      {/* Dimmed backdrop hint */}
      <View style={s.overlayBackdrop} />

      {/* Modal card */}
      <View style={[s.modalCard, shadows.md]}>
        <Text style={s.modalTitle}>Add Introduction Video (Optional)</Text>

        <View style={s.videoSlot}>
          <Image source={{ uri: 'https://picsum.photos/seed/comp-video-preview/280/160' }} style={{ width: 280, height: 160, borderRadius: 8, borderWidth: 2, borderColor: '#000' }} />
        </View>

        <Pressable style={[s.btnPrimary, shadows.button]}>
          <Feather name={"video" as any} size={18} color={colors.textInverse} />
          <Text style={s.btnPrimaryText}>RECORD VIDEO</Text>
        </Pressable>

        <Pressable style={[s.btnSecondary, shadows.sm]}>
          <Text style={s.btnSecondaryText}>CHOOSE FROM LIBRARY</Text>
        </Pressable>

        <Pressable style={s.skipLink}>
          <Text style={s.skipLinkText}>Skip</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function CompOnboardStep2States() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Main companion setup form with bio, photos, services">
        <PageShell><DefaultState /></PageShell>
      </StateSection>

      <StateSection title="MISSING_PHOTOS" description="Photo section highlighted red, error message shown">
        <PageShell><MissingPhotosState /></PageShell>
      </StateSection>

      <StateSection title="VIDEO_PICKER" description="Modal overlay for optional video upload">
        <PageShell><VideoPickerState /></PageShell>
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16, width: '100%' },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
  },
  cardError: {
    borderColor: colors.error,
    borderWidth: 3,
  },

  // Section
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: 12 },
  label: { ...typography.label, color: colors.textMuted, marginBottom: 6 },

  // Bio
  bioInput: {
    ...typography.body,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    minHeight: 100,
    textAlignVertical: 'top',
  },

  // Location
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  locationText: { ...typography.bodyMedium, color: colors.text },

  // Age badge
  ageBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.badge.gray.bg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  ageBadgeText: { ...typography.bodyMedium, color: colors.text },

  // Rate
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  rateDollar: { ...typography.h3, color: colors.primary },
  rateInput: { ...typography.h3, color: colors.text, flex: 1, padding: 0 },
  rateUnit: { ...typography.bodySmall, color: colors.textMuted },

  // Photos grid (2x3)
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 8,
  },
  photoSlot: {
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  photoSlotEmpty: {
    width: 100,
    height: 100,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.textLight,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoSlotEmptyError: {
    borderColor: colors.error,
  },
  photoCountRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  photoCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.badge.pink.bg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoCountText: { ...typography.caption, color: colors.primary },
  photoNote: { ...typography.caption, color: colors.textMuted },
  photoError: { ...typography.caption, color: colors.error, marginTop: 2 },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  chipSelected: {
    backgroundColor: colors.badge.pink.bg,
    borderColor: colors.primary,
  },
  chipText: { ...typography.bodySmall, color: colors.text },
  chipTextSelected: { color: colors.primary, fontWeight: '600' },

  // Buttons
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnPrimaryText: { ...typography.button, color: colors.textInverse },
  btnSecondary: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  btnSecondaryText: { ...typography.button, color: colors.text },

  // Video picker overlay
  overlayBackdrop: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    height: 40,
    borderRadius: borderRadius.sm,
  },
  modalCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 24,
    gap: 14,
    alignItems: 'center',
  },
  modalTitle: { ...typography.h3, color: colors.text, textAlign: 'center' },
  videoSlot: {
    alignItems: 'center',
    marginVertical: 4,
  },
  skipLink: {
    paddingVertical: 8,
  },
  skipLinkText: {
    ...typography.bodyMedium,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
