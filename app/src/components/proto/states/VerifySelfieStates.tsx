import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
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
// STATE 1: DEFAULT — Ready to take selfie
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      <Text style={s.stepHeader}>Step 2 of 3: Selfie</Text>
      <ProgressBar percent={66} />

      <View style={s.viewfinder}>
        <Image source={{ uri: 'https://picsum.photos/seed/selfie-camera/280/340' }} style={{ width: 280, height: 340, borderRadius: 8, borderWidth: 2, borderColor: colors.border }} />
      </View>

      <Text style={s.instructions}>
        Look straight at camera. Remove sunglasses.
      </Text>

      <Pressable style={[s.ctaPrimary, shadows.button]}>
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

      <View style={s.viewfinder}>
        <View style={s.capturedWrapper}>
          <Image source={{ uri: 'https://picsum.photos/seed/selfie-camera/280/340' }} style={{ width: 280, height: 340, borderRadius: 8, borderWidth: 2, borderColor: colors.border }} />
          <View style={[s.capturedBadge, shadows.sm]}>
            <Feather name="check-circle" size={14} color={colors.success} />
            <Text style={s.capturedBadgeText}>Selfie Captured</Text>
          </View>
        </View>
      </View>

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/verify-consent' as any)}>
        <Text style={s.ctaPrimaryText}>CONTINUE</Text>
      </Pressable>

      <Pressable style={s.ghostButton}>
        <Text style={s.ghostButtonText}>Retake</Text>
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
      <StateSection title="DEFAULT" description="Camera viewfinder for selfie capture">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="CAPTURED" description="Selfie taken successfully">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <CapturedState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
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

  viewfinder: {
    alignItems: 'center',
  },

  instructions: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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

  ghostButton: {
    paddingVertical: 8,
  },
  ghostButtonText: {
    ...typography.bodySmall,
    color: colors.textMuted,
    textDecorationLine: 'underline',
  },
});
