import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader, ProtoTabBar } from '../NavComponents';
import { colors, typography, borderRadius, borderWidth, shadows, spacing } from '../../../constants/theme';


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
        <View style={{ flex: 1, maxWidth: 600, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
      {isMobile && <ProtoTabBar role="seeker" activeTab="profile" />}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function MenuItem({ icon, label, color, isLast, badge, onPress }: { icon: string; label: string; color?: string; isLast?: boolean; badge?: string; onPress?: () => void }) {
  return (
    <Pressable style={[s.menuItem, !isLast && s.menuItemBorder]} onPress={onPress}>
      <View style={[s.menuIcon, color ? { backgroundColor: color + '15' } : undefined]}>
        <Feather name={icon as any} size={18} color={color || colors.text} />
      </View>
      <Text style={[s.menuItemText, color ? { color } : undefined]}>{label}</Text>
      {badge && <View style={s.menuBadge}><Text style={s.menuBadgeText}>{badge}</Text></View>}
      <Feather name={"chevron-right" as any} size={16} color={colors.textLight} />
    </Pressable>
  );
}

function MenuGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.menuGroup}>
      <Text style={s.menuGroupTitle}>{title}</Text>
      <View style={[s.menuGroupCard, shadows.sm]}>
        {children}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>Settings</Text>

      {/* Profile section */}
      <View style={[s.profileCard, shadows.md]}>
        <Image source={{ uri: 'https://picsum.photos/seed/james-settings/56/56' }} style={s.profileAvatar} />
        <View style={s.profileInfo}>
          <Text style={s.profileName}>James Wilson</Text>
          <Text style={s.profileEmail}>james@email.com</Text>
          <View style={s.verifiedBadge}>
            <Feather name="check-circle" size={12} color={colors.success} />
            <Text style={s.verifiedText}>Verified</Text>
          </View>
        </View>
        <Pressable style={s.editBtn} onPress={() => router.push('/proto/states/settings-edit-profile' as any)}>
          <Feather name="edit-2" size={14} color={colors.primary} />
        </Pressable>
      </View>

      {/* Quick Stats */}
      <View style={s.statsRow}>
        <View style={[s.statCard, shadows.sm]}>
          <Text style={s.statValue}>12</Text>
          <Text style={s.statLabel}>Dates</Text>
        </View>
        <View style={[s.statCard, shadows.sm]}>
          <Text style={s.statValue}>4.9</Text>
          <Text style={s.statLabel}>Rating</Text>
        </View>
        <View style={[s.statCard, shadows.sm]}>
          <Text style={s.statValue}>3</Text>
          <Text style={s.statLabel}>Favorites</Text>
        </View>
      </View>

      {/* Account */}
      <MenuGroup title="Account">
        <MenuItem icon="user" label="Edit Profile" onPress={() => router.push('/proto/states/settings-edit-profile' as any)} />
        <MenuItem icon="bell" label="Notification Preferences" onPress={() => router.push('/proto/states/settings-notifications' as any)} badge="3" />
        <MenuItem icon="shield" label="Verification Status" isLast />
      </MenuGroup>

      {/* Payments */}
      <MenuGroup title="Payments">
        <MenuItem icon="credit-card" label="Payment Methods" badge="Visa *4242" />
        <MenuItem icon="file-text" label="Billing History" isLast />
      </MenuGroup>

      {/* Preferences */}
      <MenuGroup title="Preferences">
        <MenuItem icon="map-pin" label="Location" badge="New York" />
        <MenuItem icon="globe" label="Language" badge="English" />
        <MenuItem icon="moon" label="Dark Mode" isLast />
      </MenuGroup>

      {/* Privacy */}
      <MenuGroup title="Privacy">
        <MenuItem icon="lock" label="Privacy Settings" />
        <MenuItem icon="user-x" label="Block List" />
        <MenuItem icon="trash-2" label="Delete Account" color={colors.error} isLast />
      </MenuGroup>

      {/* Legal */}
      <MenuGroup title="Legal">
        <MenuItem icon="file-text" label="Terms of Service" />
        <MenuItem icon="shield" label="Privacy Policy" />
        <MenuItem icon="alert-circle" label="Safety Guidelines" isLast />
      </MenuGroup>

      {/* Sign Out */}
      <Pressable style={[s.signOutBtn, shadows.button]}>
        <Feather name={"log-out" as any} size={18} color={colors.error} />
        <Text style={s.signOutText}>Sign Out</Text>
      </Pressable>

      <Text style={s.versionText}>DateRabbit v1.0.0</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function SettingsStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Settings menu with all sections, profile card and quick stats">
        <PageShell><DefaultState /></PageShell>
      </StateSection>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16, paddingBottom: 32 },

  pageTitle: { ...typography.h2, color: colors.text, marginTop: 8 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  profileAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { ...typography.h3, color: colors.text },
  profileEmail: { ...typography.bodySmall, color: colors.textMuted },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  verifiedText: { ...typography.caption, color: colors.success, fontWeight: '600' },
  editBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.badge.pink.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },

  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 12,
    alignItems: 'center',
  },
  statValue: { ...typography.h3, color: colors.text },
  statLabel: { ...typography.caption, color: colors.textMuted },

  menuGroup: { gap: 6 },
  menuGroupTitle: { ...typography.label, color: colors.textMuted },
  menuGroupCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: colors.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: { ...typography.bodyMedium, color: colors.text, flex: 1 },
  menuBadge: {
    backgroundColor: colors.backgroundWarm,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  menuBadgeText: { ...typography.caption, color: colors.textMuted, fontSize: 10 },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  signOutText: { ...typography.button, color: colors.error },

  versionText: { ...typography.caption, color: colors.textLight, textAlign: 'center', marginTop: 8 },
});
