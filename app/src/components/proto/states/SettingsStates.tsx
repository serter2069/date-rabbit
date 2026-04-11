import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function MenuItem({ icon, label, color, isLast, onPress }: { icon: string; label: string; color?: string; isLast?: boolean; onPress?: () => void }) {
  return (
    <Pressable style={[s.menuItem, !isLast && s.menuItemBorder]} onPress={onPress}>
      <Feather name={icon as any} size={20} color={color || colors.text} />
      <Text style={[s.menuItemText, color ? { color } : undefined]}>{label}</Text>
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
  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>Settings</Text>

      {/* Profile section */}
      <View style={[s.profileCard, shadows.sm]}>
        <Image source={{ uri: 'https://picsum.photos/seed/james-settings/56/56' }} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.border }} />
        <View style={s.profileInfo}>
          <Text style={s.profileName}>James Wilson</Text>
          <Text style={s.profileEmail}>james@email.com</Text>
        </View>
        <Pressable onPress={() => router.push('/proto/states/settings-edit-profile' as any)}>
          <Text style={s.editLink}>Edit Profile</Text>
        </Pressable>
      </View>

      {/* Account */}
      <MenuGroup title="Account">
        <MenuItem icon="user" label="Edit Profile" onPress={() => router.push('/proto/states/settings-edit-profile' as any)} />
        <MenuItem icon="bell" label="Notification Preferences" onPress={() => router.push('/proto/states/settings-notifications' as any)} />
        <MenuItem icon="shield" label="Verification Status" isLast />
      </MenuGroup>

      {/* Payments */}
      <MenuGroup title="Payments">
        <MenuItem icon="credit-card" label="Payment Methods" />
        <MenuItem icon="file-text" label="Billing History" isLast />
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
      <Pressable style={[s.signOutBtn, shadows.sm]}>
        <Feather name={"log-out" as any} size={18} color={colors.error} />
        <Text style={s.signOutText}>Sign Out</Text>
      </Pressable>

      <Text style={s.versionText}>v1.0.0</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function SettingsStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Settings menu with all sections">
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

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16 },

  pageTitle: { ...typography.h2, color: colors.text },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  profileInfo: { flex: 1, gap: 2 },
  profileName: { ...typography.h3, color: colors.text },
  profileEmail: { ...typography.bodySmall, color: colors.textMuted },
  editLink: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },

  menuGroup: { gap: 6 },
  menuGroupTitle: { ...typography.label, color: colors.textMuted },
  menuGroupCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  menuItemText: { ...typography.bodyMedium, color: colors.text, flex: 1 },

  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  signOutText: { ...typography.button, color: colors.error },

  versionText: { ...typography.caption, color: colors.textLight, textAlign: 'center' },
});
