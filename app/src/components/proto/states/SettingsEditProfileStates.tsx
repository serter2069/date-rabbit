import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet, Image , ScrollView, useWindowDimensions} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader, ProtoTabBar } from '../NavComponents';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';


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
        <View style={{ flex: 1, maxWidth: 960, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  const [firstName, setFirstName] = useState('James');
  const [lastName, setLastName] = useState('Wilson');
  const [bio, setBio] = useState('Looking for genuine connections and great evenings.');

  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>Edit Profile</Text>

      {/* Photo */}
      <View style={s.photoSection}>
        <Image source={{ uri: 'https://picsum.photos/seed/james-edit/100/100' }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: colors.border }} />
        <Pressable>
          <Text style={s.changePhotoLink}>Change Photo</Text>
        </Pressable>
      </View>

      {/* Fields */}
      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>First Name</Text>
        <TextInput
          style={[s.input, shadows.sm]}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          placeholderTextColor={colors.textLight}
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Last Name</Text>
        <TextInput
          style={[s.input, shadows.sm]}
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name"
          placeholderTextColor={colors.textLight}
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Bio</Text>
        <TextInput
          style={[s.textArea, shadows.sm]}
          value={bio}
          onChangeText={setBio}
          placeholder="Tell about yourself..."
          placeholderTextColor={colors.textLight}
          multiline
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>City</Text>
        <Pressable style={[s.citySelector, shadows.sm]}>
          <Text style={s.citySelectorText}>New York</Text>
          <Feather name={"map-pin" as any} size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      <Pressable style={[s.primaryBtn, shadows.button]}>
        <Text style={s.primaryBtnText}>SAVE CHANGES</Text>
      </Pressable>

      <Pressable style={[s.ghostBtn, shadows.sm]} onPress={() => router.push('/proto/states/settings' as any)}>
        <Text style={s.ghostBtnText}>Cancel</Text>
      </Pressable>

      <Text style={s.note}>Changes are visible to companions</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: SAVED
// ---------------------------------------------------------------------------
function SavedState() {
  const [firstName, setFirstName] = useState('James');
  const [lastName, setLastName] = useState('Wilson');
  const [bio, setBio] = useState('Looking for genuine connections and great evenings.');

  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>Edit Profile</Text>

      {/* Success banner */}
      <View style={s.successBanner}>
        <Feather name={"check-circle" as any} size={16} color={colors.success} />
        <Text style={s.successText}>Profile updated successfully</Text>
      </View>

      <View style={s.photoSection}>
        <Image source={{ uri: 'https://picsum.photos/seed/james-edit/100/100' }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: colors.border }} />
        <Pressable>
          <Text style={s.changePhotoLink}>Change Photo</Text>
        </Pressable>
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>First Name</Text>
        <TextInput
          style={[s.input, shadows.sm]}
          value={firstName}
          onChangeText={setFirstName}
          placeholderTextColor={colors.textLight}
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Last Name</Text>
        <TextInput
          style={[s.input, shadows.sm]}
          value={lastName}
          onChangeText={setLastName}
          placeholderTextColor={colors.textLight}
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>Bio</Text>
        <TextInput
          style={[s.textArea, shadows.sm]}
          value={bio}
          onChangeText={setBio}
          placeholderTextColor={colors.textLight}
          multiline
        />
      </View>

      <View style={s.fieldGroup}>
        <Text style={s.fieldLabel}>City</Text>
        <Pressable style={[s.citySelector, shadows.sm]}>
          <Text style={s.citySelectorText}>New York</Text>
          <Feather name={"map-pin" as any} size={16} color={colors.textMuted} />
        </Pressable>
      </View>

      <Pressable style={[s.primaryBtn, shadows.button]}>
        <Text style={s.primaryBtnText}>SAVE CHANGES</Text>
      </Pressable>

      <Pressable style={[s.ghostBtn, shadows.sm]}>
        <Text style={s.ghostBtnText}>Cancel</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function SettingsEditProfileStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Edit profile form">
        <PageShell><DefaultState /></PageShell>
      </StateSection>
      <StateSection title="SAVED" description="Profile updated with success banner">
        <PageShell><SavedState /></PageShell>
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

  photoSection: { alignItems: 'center', gap: 8 },
  changePhotoLink: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },

  fieldGroup: { gap: 4 },
  fieldLabel: { ...typography.bodyMedium, color: colors.text },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  textArea: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },

  citySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  citySelectorText: { ...typography.body, color: colors.text },

  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  primaryBtnText: { ...typography.button, color: colors.textInverse },

  ghostBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  ghostBtnText: { ...typography.button, color: colors.text },

  note: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },

  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.successLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  successText: { ...typography.bodyMedium, color: colors.success },
});
