import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader } from '../NavComponents';
import { colors, typography, borderRadius, borderWidth, shadows, spacing } from '../../../constants/theme';

// ===========================================================================
// Progress bar component
// ===========================================================================
function ProgressBar({ percent }: { percent: number }) {
  return (
    <View style={s.progressBarOuter}>
      <View style={[s.progressBarInner, { width: `${percent}%` }]} />
    </View>
  );
}


// ===========================================================================
// PageShell
// ===========================================================================
function PageShell({ children }: { children: React.ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="auth" title="Verification" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, maxWidth: 520, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Ready to take selfie
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      <Text style={s.stepHeader}>Step 2 of 3: Selfie</Text>
      <ProgressBar percent={66} />

      {/* Viewfinder area */}
      <View style={s.viewfinderContainer}>
        <View style={[s.viewfinder, shadows.md]}>
          <Image source={{ uri: 'https://picsum.photos/seed/selfie-face/280/340' }} style={s.viewfinderImage} />
          {/* Face outline overlay */}
          <View style={s.faceOutline} />
        </View>
        <Text style={s.viewfinderLabel}>Position your face within the oval</Text>
      </View>

      {/* Instructions */}
      <View style={s.instructionsCard}>
        <Text style={s.instructionsTitle}>SELFIE TIPS</Text>
        {[
          { icon: 'sun', text: 'Good lighting, face clearly visible' },
          { icon: 'x-circle', text: 'No sunglasses or hats' },
          { icon: 'smartphone', text: 'Hold phone at eye level' },
        ].map((tip, i) => (
          <View key={i} style={s.tipRow}>
            <Feather name={tip.icon as any} size={14} color={colors.primary} />
            <Text style={s.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>

      <Pressable style={[s.ctaPrimary, shadows.button]}>
        <Feather name="camera" size={16} color={colors.textInverse} />
        <Text style={s.ctaPrimaryText}>TAKE SELFIE</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// STATE 2: CAPTURED — Selfie taken
// ===========================================================================
function CapturedState() {
  return (
    <View style={s.page}>
      <Text style={s.stepHeader}>Step 2 of 3: Selfie</Text>
      <ProgressBar percent={66} />

      <View style={s.viewfinderContainer}>
        <View style={[s.viewfinder, shadows.md]}>
          <Image source={{ uri: 'https://picsum.photos/seed/selfie-captured/280/340' }} style={s.viewfinderImage} />
          <View style={[s.capturedBadge, shadows.sm]}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <Text style={s.capturedBadgeText}>Selfie Captured</Text>
          </View>
        </View>
      </View>

      {/* Quality check */}
      <View style={s.qualityCard}>
        <Text style={s.qualityTitle}>QUALITY CHECK</Text>
        {[
          { icon: 'check-circle', text: 'Face clearly visible', pass: true },
          { icon: 'check-circle', text: 'Good lighting', pass: true },
          { icon: 'check-circle', text: 'No accessories', pass: true },
        ].map((check, i) => (
          <View key={i} style={s.qualityRow}>
            <Feather name={check.icon as any} size={14} color={colors.success} />
            <Text style={s.qualityText}>{check.text}</Text>
          </View>
        ))}
      </View>

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/verify-consent' as any)}>
        <Feather name="arrow-right" size={16} color={colors.textInverse} />
        <Text style={s.ctaPrimaryText}>CONTINUE</Text>
      </Pressable>

      <Pressable style={s.ghostButton}>
        <Feather name="refresh-cw" size={14} color={colors.textMuted} />
        <Text style={s.ghostButtonText}>Retake Selfie</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function VerifySelfieStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Camera viewfinder with face outline and selfie tips">
        <PageShell><DefaultState /></PageShell>
      </StateSection>
      <StateSection title="CAPTURED" description="Selfie taken successfully with quality check">
        <PageShell><CapturedState /></PageShell>
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16, alignItems: 'center', paddingVertical: 24 },

  stepHeader: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    width: '100%',
  },

  progressBarOuter: {
    width: '100%',
    height: 10,
    backgroundColor: colors.backgroundWarm,
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  viewfinderContainer: {
    alignItems: 'center',
    gap: 8,
  },
  viewfinder: {
    position: 'relative',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  viewfinderImage: {
    width: 280,
    height: 340,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
  },
  faceOutline: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    width: 140,
    height: 180,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.6)',
    borderStyle: 'dashed',
  },
  viewfinderLabel: { ...typography.caption, color: colors.textMuted },

  instructionsCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 14,
    width: '100%',
    gap: 8,
  },
  instructionsTitle: { ...typography.label, color: colors.textMuted, marginBottom: 4 },
  tipRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  tipText: { ...typography.bodySmall, color: colors.textSecondary },

  capturedBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    borderWidth: borderWidth.thin,
    borderColor: colors.success,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  capturedBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },

  qualityCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 14,
    width: '100%',
    gap: 8,
  },
  qualityTitle: { ...typography.label, color: colors.textMuted, marginBottom: 4 },
  qualityRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qualityText: { ...typography.bodySmall, color: colors.textSecondary },

  ctaPrimary: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  ctaPrimaryText: {
    ...typography.button,
    color: colors.textInverse,
  },

  ghostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  ghostButtonText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
