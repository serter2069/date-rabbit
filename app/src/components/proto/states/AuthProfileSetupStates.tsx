import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// Shared progress bar
// ===========================================================================
function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = (step / total) * 100;
  return (
    <View style={s.progressWrap}>
      <View style={s.progressTrack}>
        <View style={[s.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={s.progressLabel}>Step {step} of {total}</Text>
    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Profile form with valid data
// ===========================================================================
function DefaultState() {
  const [firstName, setFirstName] = useState('Jessica');
  const [age, setAge] = useState('26');
  const [city] = useState('New York');

  return (
    <View style={s.page}>
      <Text style={s.title}>Complete your profile</Text>
      <ProgressBar step={1} total={3} />

      <View style={s.avatarArea}>
        <Image source={{ uri: 'https://picsum.photos/seed/profile-placeholder/100/100' }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#000' }} />
        <View style={s.cameraOverlay}>
          <Feather name="camera" size={16} color={colors.textInverse} />
        </View>
        <Text style={s.avatarLabel}>Tap to upload</Text>
      </View>

      <View style={s.form}>
        <View style={s.inputGroup}>
          <Text style={s.label}>First name</Text>
          <TextInput
            style={s.input}
            placeholder="Your first name"
            placeholderTextColor={colors.textLight}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>Age</Text>
          <TextInput
            style={s.input}
            placeholder="21+"
            placeholderTextColor={colors.textLight}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            maxLength={2}
          />
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>City</Text>
          <Pressable style={s.dropdown}>
            <Text style={s.dropdownText}>{city}</Text>
            <Feather name="chevron-down" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/verify-intro')}>
        <Text style={s.ctaPrimaryText}>CONTINUE</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// STATE 2: VALIDATION — Required fields highlighted
// ===========================================================================
function ValidationState() {
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('');

  return (
    <View style={s.page}>
      <Text style={s.title}>Complete your profile</Text>
      <ProgressBar step={1} total={3} />

      <View style={s.avatarArea}>
        <Image source={{ uri: 'https://picsum.photos/seed/profile-placeholder/100/100' }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: 2, borderColor: '#000' }} />
        <View style={s.cameraOverlay}>
          <Feather name="camera" size={16} color={colors.textInverse} />
        </View>
        <Text style={s.avatarLabel}>Tap to upload</Text>
      </View>

      <View style={s.form}>
        <View style={s.inputGroup}>
          <Text style={s.label}>First name</Text>
          <TextInput
            style={[s.input, s.inputError]}
            placeholder="Your first name"
            placeholderTextColor={colors.textLight}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
          <Text style={s.errorText}>First name is required</Text>
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>Age</Text>
          <TextInput
            style={[s.input, s.inputError]}
            placeholder="21+"
            placeholderTextColor={colors.textLight}
            value={age}
            onChangeText={setAge}
            keyboardType="number-pad"
            maxLength={2}
          />
          <Text style={s.errorText}>Age is required (21+)</Text>
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>City</Text>
          <Pressable style={[s.dropdown, s.dropdownError]}>
            <Text style={s.dropdownPlaceholder}>Select city</Text>
            <Feather name="chevron-down" size={18} color={colors.textMuted} />
          </Pressable>
          <Text style={s.errorText}>City is required</Text>
        </View>
      </View>

      <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/verify-intro')}>
        <Text style={s.ctaPrimaryText}>CONTINUE</Text>
      </Pressable>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function AuthProfileSetupStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Profile form with valid mock data">
        <DefaultState />
      </StateSection>
      <StateSection title="VALIDATION" description="Required fields highlighted with errors">
        <ValidationState />
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

  // Progress
  progressWrap: { gap: 6 },
  progressTrack: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressLabel: { ...typography.caption, color: colors.textMuted },

  // Avatar
  avatarArea: { alignItems: 'center', gap: 6 },
  cameraOverlay: {
    position: 'absolute',
    bottom: 22,
    right: '50%',
    marginRight: -50,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: { ...typography.caption, color: colors.textMuted },

  // Form
  form: { gap: 16 },
  inputGroup: { gap: 4 },
  label: { ...typography.caption, color: colors.text, textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    ...typography.body,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: borderWidth.normal,
  },
  errorText: { ...typography.caption, color: colors.error },

  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownError: {
    borderColor: colors.error,
    borderWidth: borderWidth.normal,
  },
  dropdownText: { ...typography.body, color: colors.text },
  dropdownPlaceholder: { ...typography.body, color: colors.textLight },

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
});
