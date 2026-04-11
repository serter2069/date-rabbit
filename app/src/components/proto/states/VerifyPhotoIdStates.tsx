import React from 'react';
import { View, Text, Pressable, StyleSheet, Image , ScrollView, useWindowDimensions} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader, ProtoTabBar } from '../NavComponents';
import { colors, typography, borderRadius, borderWidth, shadows } from '../../../constants/theme';

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
// Accepted ID chip
// ===========================================================================
function IdChip({ label }: { label: string }) {
  return (
    <View style={[s.chip, shadows.sm]}>
      <Feather name="credit-card" size={14} color={colors.primary} />
      <Text style={s.chipText}>{label}</Text>
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
      <ProtoHeader variant="auth" />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flex: 1, maxWidth: 960, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
      
    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Ready to capture
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      <Text style={s.stepHeader}>Step 1 of 3: Photo ID</Text>
      <ProgressBar percent={33} />

      <Text style={s.instructions}>
        Take a photo of your government-issued ID
      </Text>

      <View style={s.photoContainer}>
        <Image source={{ uri: 'https://picsum.photos/seed/passport-id/280/180' }} style={{ width: 280, height: 180, borderRadius: 8, borderWidth: 2, borderColor: '#000' }} />
      </View>

      <Text style={s.subLabel}>Accepted IDs</Text>
      <View style={s.chipRow}>
        <IdChip label="Driver's License" />
        <IdChip label="Passport" />
        <IdChip label="State ID" />
      </View>

      <Pressable style={[s.ctaPrimary, shadows.button]}>
        <Text style={s.ctaPrimaryText}>CAPTURE ID</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// STATE 2: CAPTURED — ID taken successfully
// ===========================================================================
function CapturedState() {
  return (
    <View style={s.page}>
      <Text style={s.stepHeader}>Step 1 of 3: Photo ID</Text>
      <ProgressBar percent={33} />

      <Text style={s.instructions}>
        Take a photo of your government-issued ID
      </Text>

      <View style={s.photoContainer}>
        <View style={s.capturedWrapper}>
          <Image source={{ uri: 'https://picsum.photos/seed/passport-id/280/180' }} style={{ width: 280, height: 180, borderRadius: 8, borderWidth: 2, borderColor: '#000' }} />
          <View style={[s.capturedBadge, shadows.sm]}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <Text style={s.capturedBadgeText}>ID Captured</Text>
          </View>
        </View>
      </View>

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/verify-selfie' as any)}>
        <Text style={s.ctaPrimaryText}>LOOKS GOOD, CONTINUE</Text>
      </Pressable>

      <Pressable style={s.ghostButton}>
        <Text style={s.ghostButtonText}>Retake</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// STATE 3: ERROR — Could not read ID
// ===========================================================================
function ErrorState() {
  return (
    <View style={s.page}>
      <Text style={s.stepHeader}>Step 1 of 3: Photo ID</Text>
      <ProgressBar percent={33} />

      <View style={[s.warningBanner, shadows.sm]}>
        <Feather name="alert-triangle" size={18} color={colors.warning} />
        <Text style={s.warningText}>
          Could not read ID clearly. Please try again in better lighting.
        </Text>
      </View>

      <View style={s.photoContainer}>
        <Image source={{ uri: 'https://picsum.photos/seed/passport-id/280/180' }} style={{ width: 280, height: 180, borderRadius: 8, borderWidth: 2, borderColor: '#000' }} />
      </View>

      <Pressable style={[s.ctaPrimary, shadows.button, s.retakeHighlight]}>
        <Text style={s.ctaPrimaryText}>RETAKE</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function VerifyPhotoIdStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Ready to capture government ID">
        <PageShell><DefaultState /></PageShell>
      </StateSection>
      <StateSection title="CAPTURED" description="ID photo taken successfully">
        <PageShell><CapturedState /></PageShell>
      </StateSection>
      <StateSection title="ERROR" description="Could not read ID, retry prompt">
        <PageShell><ErrorState /></PageShell>
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16, alignItems: 'center' },

  stepHeader: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
    width: '100%',
  },

  progressBarOuter: {
    width: '100%',
    height: 8,
    backgroundColor: colors.backgroundWarm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  progressBarInner: {
    height: '100%',
    backgroundColor: colors.primary,
  },

  instructions: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  photoContainer: {
    alignItems: 'center',
  },

  capturedWrapper: {
    position: 'relative',
  },
  capturedBadge: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  capturedBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },

  subLabel: {
    ...typography.label,
    color: colors.textMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },

  ctaPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  ctaPrimaryText: {
    ...typography.button,
    color: colors.textInverse,
  },

  retakeHighlight: {
    backgroundColor: colors.warning,
  },

  ghostButton: {
    paddingVertical: 8,
  },
  ghostButtonText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.warningLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 14,
    width: '100%',
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.text,
    flex: 1,
  },
});
