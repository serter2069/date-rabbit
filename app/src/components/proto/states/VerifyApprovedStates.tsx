import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader } from '../NavComponents';
import { colors, typography, borderRadius, borderWidth, shadows, spacing } from '../../../constants/theme';

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
// PageShell
// ===========================================================================
function PageShell({ children }: { children: React.ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="auth" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, maxWidth: 520, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
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
      <View style={s.iconArea}>
        <View style={[s.iconCircle, shadows.md]}>
          <Feather name="shield" size={56} color={colors.success} />
        </View>
      </View>

      <Text style={s.headline}>You're Verified!</Text>

      {/* Success card */}
      <View style={[s.successCard, shadows.sm]}>
        <Feather name="check-circle" size={24} color={colors.success} />
        <Text style={s.successText}>
          Your identity has been confirmed by Stripe. You now have full access to DateRabbit.
        </Text>
      </View>

      {/* What you can do now */}
      <View style={s.featuresCard}>
        <Text style={s.featuresTitle}>What you can do now</Text>
        {[
          { icon: 'search', text: 'Browse verified companions near you' },
          { icon: 'calendar', text: 'Book real offline dates instantly' },
          { icon: 'message-circle', text: 'Chat with companions directly' },
          { icon: 'heart', text: 'Save favorites to your list' },
        ].map((item, i) => (
          <View key={i} style={s.featureRow}>
            <View style={s.featureIcon}>
              <Feather name={item.icon as any} size={14} color={colors.primary} />
            </View>
            <Text style={s.featureText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* Trust badge */}
      <View style={s.trustRow}>
        <View style={s.trustBadge}>
          <Feather name="shield" size={12} color={colors.success} />
          <Text style={s.trustBadgeText}>ID Verified</Text>
        </View>
        <View style={s.trustBadge}>
          <Feather name="user-check" size={12} color={colors.success} />
          <Text style={s.trustBadgeText}>21+ Confirmed</Text>
        </View>
        <View style={s.trustBadge}>
          <Feather name="lock" size={12} color={colors.success} />
          <Text style={s.trustBadgeText}>Secure</Text>
        </View>
      </View>

      {/* Start browsing CTA */}
      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/seeker-home' as any)}>
        <Feather name="arrow-right" size={16} color={colors.textInverse} />
        <Text style={s.ctaPrimaryText}>START BROWSING</Text>
      </Pressable>

      <Text style={s.disclaimer}>DateRabbit is for adults 21+. Be respectful and safe.</Text>
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
        <PageShell><DefaultState /></PageShell>
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

  iconArea: { marginBottom: 8 },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.successLight,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headline: {
    ...typography.h1,
    color: colors.text,
    textAlign: 'center',
  },

  successCard: {
    backgroundColor: colors.successLight,
    borderWidth: borderWidth.normal,
    borderColor: colors.success,
    borderRadius: borderRadius.lg,
    padding: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  successText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    lineHeight: 22,
  },

  featuresCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    width: '100%',
    gap: 12,
  },
  featuresTitle: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.badge.pink.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  featureText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },

  trustRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.success,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  trustBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },

  ctaPrimary: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 32,
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
    fontSize: 18,
  },

  disclaimer: {
    ...typography.caption,
    color: colors.textLight,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});
