import React from 'react';
import { View, Text, Pressable, StyleSheet , ScrollView, useWindowDimensions} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader, ProtoTabBar } from '../NavComponents';
import { colors, typography, borderRadius, borderWidth, shadows } from '../../../constants/theme';


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
// STATE 1: DEFAULT — Companion identity verification intro
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      {/* Header */}
      <View style={s.header}>
        <View style={[s.iconCircle, shadows.md]}>
          <Feather name={"shield" as any} size={36} color={colors.textInverse} />
        </View>
        <Text style={s.heading}>Almost there! Verify your identity</Text>
        <Text style={s.sub}>
          Identity verification protects both you and your clients. It builds trust and ensures a safe experience for everyone.
        </Text>
      </View>

      {/* Steps card */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>How Stripe Identity works</Text>
        {[
          { num: '1', icon: 'file-text', text: 'Take a photo of your government-issued ID' },
          { num: '2', icon: 'camera', text: 'Take a quick selfie to match your ID' },
          { num: '3', icon: 'check-circle', text: 'Stripe securely verifies your identity' },
        ].map(step => (
          <View key={step.num} style={s.stepRow}>
            <View style={s.stepBadge}>
              <Text style={s.stepBadgeText}>{step.num}</Text>
            </View>
            <Feather name={step.icon as any} size={18} color={colors.primary} />
            <Text style={s.stepText}>{step.text}</Text>
          </View>
        ))}
      </View>

      {/* Note */}
      <View style={[s.noteCard, shadows.sm]}>
        <Feather name={"shield" as any} size={16} color={colors.accent} />
        <Text style={s.noteText}>
          Your information is securely handled by Stripe. DateRabbit does not store your ID photos.
        </Text>
      </View>

      {/* CTA */}
      <Pressable style={[s.btnPrimary, shadows.button]} onPress={() => router.push('/proto/states/comp-onboard-pending' as any)}>
        <Text style={s.btnPrimaryText}>START VERIFICATION</Text>
      </Pressable>

      <Text style={s.footerNote}>
        Verification required before accepting bookings
      </Text>
    </View>
  );
}

// ===========================================================================
// STATE 2: IN_PROGRESS — Camera/document capture in progress
// ===========================================================================
function InProgressState() {
  return (
    <View style={s.page}>
      {/* Header */}
      <View style={s.header}>
        <View style={[s.iconCircle, { backgroundColor: colors.accent }, shadows.md]}>
          <Feather name={"camera" as any} size={36} color={colors.text} />
        </View>
        <Text style={s.heading}>Verification in Progress</Text>
        <Text style={s.sub}>
          Please complete the verification steps in the Stripe window. Do not close this screen.
        </Text>
      </View>

      {/* Progress steps */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>Verification Steps</Text>
        {[
          { label: 'Upload ID document', done: true },
          { label: 'Take selfie photo', done: false },
          { label: 'Processing verification', done: false },
        ].map((step, i) => (
          <View key={i} style={s.progressRow}>
            <View style={[s.progressDot, step.done && s.progressDotDone]}>
              {step.done && <Feather name={"check-circle" as any} size={14} color={colors.textInverse} />}
            </View>
            <Text style={[s.progressLabel, step.done && s.progressLabelDone]}>
              {step.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Companion-specific messaging */}
      <View style={[s.noteCard, shadows.sm]}>
        <Feather name={"shield" as any} size={16} color={colors.accent} />
        <Text style={s.noteText}>
          As a companion, your verification helps clients feel safe booking with you. Verified companions receive more booking requests.
        </Text>
      </View>

      {/* Disabled button */}
      <Pressable style={[s.btnPrimary, shadows.button, { opacity: 0.5 }]} disabled>
        <Text style={s.btnPrimaryText}>VERIFICATION IN PROGRESS...</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function CompOnboardVerifyStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Companion identity verification intro">
        <PageShell><DefaultState /></PageShell>
      </StateSection>

      <StateSection title="IN_PROGRESS" description="Camera/document capture in progress">
        <PageShell><InProgressState /></PageShell>
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

  // Header
  header: { alignItems: 'center', gap: 8 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  heading: { ...typography.h2, color: colors.text, textAlign: 'center' },
  sub: { ...typography.body, color: colors.textMuted, textAlign: 'center', paddingHorizontal: 8 },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
    gap: 12,
  },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: 4 },

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: { ...typography.caption, color: colors.textInverse, fontWeight: '700' },
  stepText: { ...typography.bodySmall, color: colors.text, flex: 1 },

  // Progress rows (IN_PROGRESS)
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressDotDone: {
    backgroundColor: colors.success,
    borderColor: colors.border,
  },
  progressLabel: { ...typography.bodySmall, color: colors.textMuted },
  progressLabelDone: { color: colors.text, fontWeight: '600' },

  // Note
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 14,
  },
  noteText: { ...typography.bodySmall, color: colors.textMuted, flex: 1 },

  // Buttons
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: { ...typography.button, color: colors.textInverse },

  footerNote: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
