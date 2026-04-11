import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// Confetti particle (colored View squares)
// ===========================================================================
const CONFETTI_COLORS = [
  colors.primary,
  colors.accent,
  colors.warning,
  colors.success,
  colors.info,
  colors.primaryLight,
];

function ConfettiParticles() {
  const particles = CONFETTI_COLORS.map((color, i) => ({
    color,
    size: 8 + (i % 3) * 4,
    left: 10 + i * 60,
    top: 5 + ((i * 17) % 30),
    rotation: `${i * 30}deg`,
  }));

  return (
    <View style={s.confettiContainer}>
      {particles.map((p, i) => (
        <View
          key={i}
          style={[
            s.confettiPiece,
            {
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
              left: p.left,
              top: p.top,
              transform: [{ rotate: p.rotation }],
            },
          ]}
        />
      ))}
    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Verification approved
// ===========================================================================
function DefaultState() {
  return (
    <View style={s.page}>
      {/* Confetti */}
      <ConfettiParticles />

      {/* Icon */}
      <View style={s.iconContainer}>
        <Feather name="shield" size={64} color={colors.success} />
      </View>

      <Text style={s.headline}>You're Verified!</Text>

      {/* Success card */}
      <View style={[s.successCard, shadows.sm]}>
        <Text style={s.successText}>
          Your identity has been confirmed. You now have full access to
          DateRabbit.
        </Text>
      </View>

      {/* Start browsing CTA */}
      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/seeker-home' as any)}>
        <Text style={s.ctaPrimaryText}>START BROWSING</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function VerifyApprovedStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Verification approved, full access granted">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
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

  confettiContainer: {
    width: '100%',
    height: 40,
    position: 'relative',
    overflow: 'hidden',
  },
  confettiPiece: {
    position: 'absolute',
    borderRadius: 2,
  },

  iconContainer: {
    marginBottom: 8,
  },

  headline: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },

  successCard: {
    backgroundColor: colors.successLight,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
    width: '100%',
  },
  successText: {
    ...typography.body,
    color: colors.text,
    textAlign: 'center',
  },

  ctaPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
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
    fontSize: 18,
  },
});
