import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader } from '../NavComponents';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// PageShell — full-screen wrapper with header
// ===========================================================================
function PageShell({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const isDesktop = width > 900;
  return (
    <View style={s.shell}>
      <ProtoHeader variant="back" onBack={() => router.push('/proto/states/auth-otp')} />
      <View style={[s.shellContent, isDesktop && s.shellDesktop]}>
        {children}
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={s.featureItem}>
      <Feather name={icon as any} size={14} color={colors.textSecondary} />
      <Text style={s.featureText}>{text}</Text>
    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Role selection cards
// ===========================================================================
function DefaultState() {
  const [selectedRole, setSelectedRole] = useState<'seeker' | 'companion' | null>(null);

  return (
    <View style={s.page}>
      <Text style={s.title}>Who are you?</Text>
      <Text style={s.subtitle}>Choose your role to get started. You can always change it later.</Text>

      <View style={s.cardsRow}>
        {/* Seeker card */}
        <Pressable
          style={[
            s.roleCard,
            shadows.md,
            selectedRole === 'seeker' && s.roleCardSelected,
          ]}
          onPress={() => setSelectedRole('seeker')}
        >
          <Image source={{ uri: 'https://picsum.photos/seed/man-suit/80/80' }} style={s.roleAvatar} />
          <Text style={s.roleTitle}>Seeker</Text>
          <Text style={s.roleDesc}>I want to book dates with companions</Text>
          <View style={[s.roleBadge, { backgroundColor: colors.badge.pink.bg }]}>
            <Feather name="shield" size={12} color={colors.badge.pink.text} />
            <Text style={[s.roleBadgeText, { color: colors.badge.pink.text }]}>Verified seekers</Text>
          </View>
          <View style={s.featureList}>
            <FeatureItem icon="search" text="Browse profiles" />
            <FeatureItem icon="zap" text="Book instantly" />
            <FeatureItem icon="shield" text="Background checked" />
          </View>
        </Pressable>

        {/* Companion card */}
        <Pressable
          style={[
            s.roleCard,
            shadows.md,
            selectedRole === 'companion' && s.roleCardSelected,
          ]}
          onPress={() => setSelectedRole('companion')}
        >
          <Image source={{ uri: 'https://picsum.photos/seed/woman-elegant/80/80' }} style={s.roleAvatar} />
          <Text style={s.roleTitle}>Companion</Text>
          <Text style={s.roleDesc}>I want to offer paid dates</Text>
          <View style={[s.roleBadge, { backgroundColor: colors.badge.success.bg }]}>
            <Feather name="dollar-sign" size={12} color={colors.badge.success.text} />
            <Text style={[s.roleBadgeText, { color: colors.badge.success.text }]}>Earn on your terms</Text>
          </View>
          <View style={s.featureList}>
            <FeatureItem icon="dollar-sign" text="Set your price" />
            <FeatureItem icon="calendar" text="Control schedule" />
            <FeatureItem icon="zap" text="Same-day payout" />
          </View>
        </Pressable>
      </View>

      <Pressable
        style={[
          selectedRole ? s.ctaPrimary : s.ctaDisabled,
          shadows.button,
        ]}
        disabled={!selectedRole}
        onPress={() => selectedRole && router.push('/proto/states/auth-profile-setup')}
      >
        <Text style={selectedRole ? s.ctaPrimaryText : s.ctaDisabledText}>CONTINUE</Text>
        {selectedRole && <Feather name="arrow-right" size={16} color={colors.textInverse} />}
      </Pressable>

      <Text style={s.disclaimer}>21+ only. All users must verify their identity.</Text>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function AuthRoleSelectStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Role selection: seeker vs companion">
        <PageShell>
          <DefaultState />
        </PageShell>
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  shell: {
    minHeight: 844,
    backgroundColor: colors.background,
    flex: 1,
  },
  shellContent: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  shellDesktop: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  page: { gap: 20, paddingVertical: 16 },

  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textMuted, marginTop: -12, marginBottom: 4 },

  cardsRow: {
    flexDirection: 'row',
    gap: 12,
  },

  roleCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    alignItems: 'center',
    gap: 10,
  },
  roleCardSelected: {
    borderColor: colors.primary,
    borderWidth: 3,
    shadowColor: colors.primary,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  roleAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
  },

  roleTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  roleDesc: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },

  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleBadgeText: { ...typography.caption, fontSize: 10 },

  featureList: { gap: 6, alignSelf: 'stretch' },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: { ...typography.bodySmall, color: colors.textSecondary },

  ctaPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ctaPrimaryText: { ...typography.button, color: colors.textInverse },

  ctaDisabled: {
    backgroundColor: colors.borderLight,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaDisabledText: { ...typography.button, color: colors.textLight },

  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
