import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// Bottom tab bar (shared navigation)
// ---------------------------------------------------------------------------
function BottomTabBar({ active }: { active: number }) {
  const router = useRouter();
  const tabs = [
    { icon: 'home' as const, label: 'Home', route: '/proto/states/seeker-home' },
    { icon: 'calendar' as const, label: 'Bookings', route: '/proto/states/seeker-bookings' },
    { icon: 'message-circle' as const, label: 'Messages', route: '/proto/states/seeker-messages' },
    { icon: 'user' as const, label: 'Profile', route: '/proto/states/seeker-profile' },
  ];
  return (
    <View style={s.bottomTabBar}>
      {tabs.map((t, i) => (
        <Pressable key={t.label} style={s.bottomTabItem} onPress={() => router.push(t.route as any)}>
          <Feather name={t.icon} size={20} color={i === active ? colors.primary : colors.textMuted} />
          <Text style={[s.bottomTabLabel, i === active && { color: colors.primary }]}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  const router = useRouter();
  return (
    <View style={s.page}>
      {/* Profile header */}
      <View style={[s.profileHeader, shadows.sm]}>
        <Image source={{ uri: 'https://picsum.photos/seed/james-seeker/100/100' }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: colors.border }} />
        <Text style={s.profileName}>James Wilson</Text>
        <View style={s.verifiedRow}>
          <Feather name={"check-circle" as any} size={14} color={colors.success} />
          <Text style={s.verifiedLabel}>Verified Seeker</Text>
        </View>
        <View style={s.profileMeta}>
          <View style={s.metaItem}>
            <Feather name={"calendar" as any} size={12} color={colors.textMuted} />
            <Text style={s.metaText}>Member since March 2026</Text>
          </View>
          <View style={s.metaItem}>
            <Feather name={"map-pin" as any} size={12} color={colors.textMuted} />
            <Text style={s.metaText}>New York, NY</Text>
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        <View style={s.statItem}>
          <Text style={s.statValue}>8</Text>
          <Text style={s.statLabel}>dates completed</Text>
        </View>
        <View style={[s.statDivider]} />
        <View style={s.statItem}>
          <Text style={s.statValue}>4.8</Text>
          <Text style={s.statLabel}>avg rating</Text>
        </View>
        <View style={[s.statDivider]} />
        <View style={s.statItem}>
          <Text style={s.statValue}>12</Text>
          <Text style={s.statLabel}>favorites saved</Text>
        </View>
      </View>

      {/* Menu list */}
      <View style={s.menuList}>
        {[
          { icon: 'user' as const, label: 'Edit Profile', route: '/proto/states/settings-edit-profile' },
          { icon: 'bell' as const, label: 'Notification Settings', route: '/proto/states/settings-notifications' },
          { icon: 'shield' as const, label: 'Verification Status', route: '' },
          { icon: 'heart' as const, label: 'Favorites', route: '/proto/states/seeker-favorites' },
          { icon: 'credit-card' as const, label: 'Payment Methods', route: '' },
          { icon: 'file-text' as const, label: 'Terms of Service', route: '' },
          { icon: 'lock' as const, label: 'Privacy Policy', route: '' },
        ].map(item => (
          <Pressable key={item.label} style={s.menuItem} onPress={() => item.route && router.push(item.route as any)}>
            <Feather name={item.icon} size={20} color={colors.text} />
            <Text style={s.menuLabel}>{item.label}</Text>
            <Feather name={"chevron-right" as any} size={16} color={colors.textLight} />
          </Pressable>
        ))}

        <Pressable style={s.menuItem}>
          <Feather name={"log-out" as any} size={20} color={colors.error} />
          <Text style={[s.menuLabel, { color: colors.error }]}>Sign Out</Text>
          <Feather name={"chevron-right" as any} size={16} color={colors.textLight} />
        </Pressable>
      </View>

      {/* Safety link */}
      <Pressable style={s.safetyLink}>
        <Feather name={"shield" as any} size={16} color={colors.error} />
        <Text style={s.safetyText}>Our Safety Guidelines</Text>
      </Pressable>

      <BottomTabBar active={3} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: EDIT_MODE
// ---------------------------------------------------------------------------
function EditModeState() {
  const [firstName, setFirstName] = useState('James');
  const [lastName, setLastName] = useState('Wilson');
  const [bio, setBio] = useState('Love exploring the city and meeting new people. Looking for great conversations over dinner.');
  const [city, setCity] = useState('New York, NY');

  return (
    <View style={s.page}>
      <Text style={s.editTitle}>Edit Profile</Text>

      {/* Photo */}
      <View style={s.photoSection}>
        <Image source={{ uri: 'https://picsum.photos/seed/james-seeker/100/100' }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: colors.border }} />
        <Pressable style={[s.changePhotoBtn, shadows.sm]}>
          <Feather name={"camera" as any} size={14} color={colors.primary} />
          <Text style={s.changePhotoText}>Change</Text>
        </Pressable>
      </View>

      {/* Form */}
      <View style={s.form}>
        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>FIRST NAME</Text>
          <TextInput
            style={[s.textInput, shadows.sm]}
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor={colors.textLight}
          />
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>LAST NAME</Text>
          <TextInput
            style={[s.textInput, shadows.sm]}
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor={colors.textLight}
          />
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>BIO</Text>
          <TextInput
            style={[s.textArea, shadows.sm]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={colors.textLight}
          />
        </View>
        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>CITY</Text>
          <TextInput
            style={[s.textInput, shadows.sm]}
            value={city}
            onChangeText={setCity}
            placeholderTextColor={colors.textLight}
          />
        </View>
      </View>

      {/* Buttons */}
      <View style={s.editActions}>
        <Pressable style={[s.primaryBtn, shadows.button]}>
          <Text style={s.primaryBtnText}>SAVE CHANGES</Text>
        </Pressable>
        <Pressable style={[s.ghostBtn, shadows.sm]}>
          <Text style={s.ghostBtnText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function SeekerProfileStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Seeker profile view with stats and menu">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="EDIT_MODE" description="Edit profile form with interactive inputs">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <EditModeState />
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

  // Profile header
  profileHeader: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  profileName: { ...typography.h2, color: colors.text, marginTop: 8 },
  verifiedRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  verifiedLabel: { ...typography.caption, color: colors.success, fontWeight: '700' },
  profileMeta: { gap: 4, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { ...typography.caption, color: colors.textMuted },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.h2, color: colors.primary, fontSize: 20 },
  statLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10, textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: colors.borderLight },

  // Menu
  menuList: {
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
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  menuLabel: { ...typography.bodyMedium, color: colors.text, flex: 1 },

  // Safety
  safetyLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  safetyText: { ...typography.bodyMedium, color: colors.error, fontSize: 13, textDecorationLine: 'underline' },

  // Edit mode
  editTitle: { ...typography.h2, color: colors.text },
  photoSection: { alignItems: 'center', gap: 8 },
  changePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  changePhotoText: { ...typography.caption, color: colors.primary, fontWeight: '700' },

  // Form
  form: { gap: 14 },
  fieldGroup: { gap: 4 },
  fieldLabel: { ...typography.label, color: colors.textMuted, fontSize: 10 },
  textInput: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  textArea: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
    minHeight: 100,
  },

  // Buttons
  editActions: { gap: 10 },
  primaryBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
  },
  primaryBtnText: { ...typography.button, color: colors.textInverse },
  ghostBtn: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  ghostBtnText: { ...typography.bodyMedium, color: colors.text },

  // Bottom tab bar
  bottomTabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingVertical: 8,
    marginTop: 8,
  },
  bottomTabItem: { flex: 1, alignItems: 'center', gap: 2 },
  bottomTabLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
});
