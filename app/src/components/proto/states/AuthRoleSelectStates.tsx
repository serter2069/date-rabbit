import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — Role selection cards
// ===========================================================================
function DefaultState() {
  const [selectedRole, setSelectedRole] = useState<'seeker' | 'companion' | null>(null);

  return (
    <View style={s.page}>
      <Text style={s.title}>Who are you?</Text>

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
          <Image source={{ uri: 'https://picsum.photos/seed/man-suit/80/80' }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#000' }} />
          <Text style={s.roleTitle}>I'm looking for a companion</Text>
          <View style={[s.roleBadge, { backgroundColor: colors.badge.pink.bg }]}>
            <Feather name="shield" size={12} color={colors.badge.pink.text} />
            <Text style={[s.roleBadgeText, { color: colors.badge.pink.text }]}>Verified seekers</Text>
          </View>
          <View style={s.featureList}>
            <FeatureItem icon="search" text="Browse profiles" />
            <FeatureItem icon="zap" text="Book instantly" />
            <FeatureItem icon="shield" text="Safe & secure" />
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
          <Image source={{ uri: 'https://picsum.photos/seed/woman-elegant/80/80' }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: '#000' }} />
          <Text style={s.roleTitle}>I'm a companion</Text>
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
      </Pressable>
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
// MAIN EXPORT
// ===========================================================================
export function AuthRoleSelectStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Role selection: seeker vs companion">
        <DefaultState />
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 20, paddingHorizontal: 20, paddingVertical: 24 },

  title: { ...typography.h1, color: colors.text },

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

  roleTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
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
    justifyContent: 'center',
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
});
