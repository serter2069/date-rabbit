import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Image , ScrollView, useWindowDimensions} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader, ProtoTabBar } from '../NavComponents';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';


// ---------------------------------------------------------------------------
// PageShell
// ---------------------------------------------------------------------------
function PageShell({ children }: { children: React.ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="seeker" />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flex: 1, maxWidth: 960, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>Review Your Date</Text>

      {/* Companion */}
      <View style={s.companionRow}>
        <Image source={{ uri: 'https://picsum.photos/seed/jessica-review-write/60/60' }} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: colors.border }} />
        <View style={s.companionInfo}>
          <Text style={s.companionName}>Jessica Martinez</Text>
          <Text style={s.companionDate}>April 10, 2026</Text>
        </View>
      </View>

      {/* Star rating */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.label}>Your Rating</Text>
        <View style={s.starsRow}>
          {[1, 2, 3, 4, 5].map((i) => (
            <Pressable key={i} onPress={() => setRating(i)}>
              <Feather
                name={"star" as any}
                size={32}
                color={i <= rating ? colors.primary : colors.borderLight}
              />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Text area */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.label}>Your Review</Text>
        <TextInput
          style={s.textArea}
          placeholder="Share your experience..."
          placeholderTextColor={colors.textLight}
          multiline
          maxLength={500}
          value={reviewText}
          onChangeText={setReviewText}
        />
        <Text style={s.charCount}>{reviewText.length}/500</Text>
      </View>

      <Pressable
        style={[
          s.primaryBtn,
          shadows.button,
          rating === 0 && s.disabledBtn,
        ]}
        disabled={rating === 0}
      >
        <Text style={s.primaryBtnText}>SUBMIT REVIEW</Text>
      </Pressable>

      <Text style={s.note}>Reviews are anonymous to companions</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: SUBMITTED
// ---------------------------------------------------------------------------
function SubmittedState() {
  return (
    <View style={s.page}>
      <View style={s.successCenter}>
        <Feather name={"check-circle" as any} size={48} color={colors.success} />
        <Text style={s.successTitle}>Review Submitted!</Text>
        <Text style={s.successSub}>Thank you for your feedback.</Text>
      </View>

      <Pressable style={[s.primaryBtn, shadows.button]} onPress={() => router.push('/proto/states/seeker-bookings' as any)}>
        <Text style={s.primaryBtnText}>BACK TO BOOKINGS</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function ReviewsWriteStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Write review form with interactive stars">
        <PageShell><DefaultState /></PageShell>
      </StateSection>
      <StateSection title="SUBMITTED" description="Review submitted success">
        <PageShell><SubmittedState /></PageShell>
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

  companionRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  companionInfo: { flex: 1, gap: 2 },
  companionName: { ...typography.h3, color: colors.text },
  companionDate: { ...typography.bodySmall, color: colors.textMuted },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 10,
  },

  label: { ...typography.bodyMedium, color: colors.text },

  starsRow: { flexDirection: 'row', gap: 8 },

  textArea: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: { ...typography.caption, color: colors.textLight, textAlign: 'right' },

  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  primaryBtnText: { ...typography.button, color: colors.textInverse },
  disabledBtn: { opacity: 0.5 },

  note: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },

  successCenter: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  successTitle: { ...typography.h2, color: colors.text },
  successSub: { ...typography.bodySmall, color: colors.textMuted },
});
