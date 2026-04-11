import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, ScrollView, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader, ProtoTabBar } from '../NavComponents';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

const CITIES = ['New York', 'Los Angeles', 'Chicago', 'Miami', 'San Francisco', 'Las Vegas', 'Seattle', 'Boston', 'Austin', 'Denver', 'Atlanta', 'Houston', 'Dallas', 'Philadelphia', 'Phoenix'];

// ===========================================================================
// PageShell — wraps each state with header/footer for full-page appearance
// ===========================================================================
function PageShell({ children, navVariant }: { children: React.ReactNode; navVariant?: 'seeker' | 'companion' }) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="auth" title="Profile Setup" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, maxWidth: 480, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

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
// STATE 1: DEFAULT — Profile form with valid data (Companion view)
// ===========================================================================
function DefaultState() {
  const [firstName, setFirstName] = useState('Jessica');
  const [age, setAge] = useState('26');
  const [bio, setBio] = useState('Love exploring new restaurants and attending art galleries');
  const [hourlyRate, setHourlyRate] = useState('150');
  const [city, setCity] = useState('New York');
  const [showCities, setShowCities] = useState(false);
  const [selectedRole] = useState<'companion' | 'seeker'>('companion');

  return (
    <PageShell>
      <View style={s.page}>
        <Text style={s.title}>Complete your profile</Text>
        <Text style={s.subtitle}>Tell us about yourself to get started</Text>
        <ProgressBar step={1} total={3} />

        <View style={s.avatarArea}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-profile-setup/100/100' }} style={{ width: 100, height: 100, borderRadius: 50, borderWidth: borderWidth.normal, borderColor: colors.border }} />
          <Pressable style={s.cameraOverlay}>
            <Feather name="camera" size={16} color={colors.textInverse} />
          </Pressable>
          <Text style={s.avatarLabel}>Tap to upload photo</Text>
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
            <Text style={s.hint}>You must be 21 or older</Text>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>City</Text>
            <Pressable style={s.dropdown} onPress={() => setShowCities(!showCities)}>
              <Feather name="map-pin" size={16} color={colors.primary} />
              <Text style={s.dropdownText}>{city}</Text>
              <Feather name="chevron-down" size={18} color={colors.textMuted} />
            </Pressable>
            {showCities && (
              <View style={s.cityList}>
                {CITIES.filter(c => c !== city).map(c => (
                  <Pressable key={c} style={s.cityItem} onPress={() => { setCity(c); setShowCities(false); }}>
                    <Feather name="map-pin" size={14} color={colors.textMuted} />
                    <Text style={s.cityItemText}>{c}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>

          {selectedRole === 'companion' && (
            <View style={s.inputGroup}>
              <Text style={s.label}>Hourly rate ($)</Text>
              <View style={s.rateRow}>
                <TextInput
                  style={[s.input, { flex: 1 }]}
                  placeholder="Your hourly rate"
                  placeholderTextColor={colors.textLight}
                  value={hourlyRate}
                  onChangeText={setHourlyRate}
                  keyboardType="decimal-pad"
                />
                <View style={s.rateSuggestion}>
                  <Text style={s.rateSuggestionText}>Avg: $100-200/hr</Text>
                </View>
              </View>
            </View>
          )}

          <View style={s.inputGroup}>
            <Text style={s.label}>Short bio</Text>
            <TextInput
              style={[s.input, s.textArea]}
              placeholder="Tell seekers about yourself..."
              placeholderTextColor={colors.textLight}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              maxLength={300}
            />
            <Text style={s.charCount}>{bio.length}/300</Text>
          </View>
        </View>

        <View style={s.trustRow}>
          <Feather name="lock" size={14} color={colors.textMuted} />
          <Text style={s.trustText}>Your information is encrypted and secure</Text>
        </View>

        <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/verify-intro')}>
          <Text style={s.ctaPrimaryText}>CONTINUE</Text>
          <Feather name="arrow-right" size={16} color={colors.textInverse} />
        </Pressable>
      </View>
    </PageShell>
  );
}

// ===========================================================================
// STATE 2: VALIDATION — Required fields highlighted (Seeker view)
// ===========================================================================
function ValidationState() {
  const [firstName, setFirstName] = useState('');
  const [age, setAge] = useState('19');
  const [bio, setBio] = useState('');

  return (
    <PageShell>
      <View style={s.page}>
        <Text style={s.title}>Complete your profile</Text>
        <Text style={s.subtitle}>Tell us about yourself to get started</Text>
        <ProgressBar step={1} total={3} />

        <View style={s.avatarArea}>
          <View style={s.avatarPlaceholder}>
            <Feather name="user" size={40} color={colors.textLight} />
          </View>
          <Pressable style={s.cameraOverlay}>
            <Feather name="camera" size={16} color={colors.textInverse} />
          </Pressable>
          <Text style={s.avatarLabel}>Photo required</Text>
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
            <View style={s.errorRow}>
              <Feather name="alert-circle" size={12} color={colors.error} />
              <Text style={s.errorText}>First name is required</Text>
            </View>
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
            <View style={s.errorRow}>
              <Feather name="alert-circle" size={12} color={colors.error} />
              <Text style={s.errorText}>You must be 21 or older to use DateRabbit</Text>
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>City</Text>
            <Pressable style={[s.dropdown, s.dropdownError]}>
              <Feather name="map-pin" size={16} color={colors.textLight} />
              <Text style={s.dropdownPlaceholder}>Select city</Text>
              <Feather name="chevron-down" size={18} color={colors.textMuted} />
            </Pressable>
            <View style={s.errorRow}>
              <Feather name="alert-circle" size={12} color={colors.error} />
              <Text style={s.errorText}>City is required</Text>
            </View>
          </View>

          <View style={s.inputGroup}>
            <Text style={s.label}>Short bio</Text>
            <TextInput
              style={[s.input, s.textArea, s.inputError]}
              placeholder="Tell companions about yourself..."
              placeholderTextColor={colors.textLight}
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
            />
            <View style={s.errorRow}>
              <Feather name="alert-circle" size={12} color={colors.error} />
              <Text style={s.errorText}>Bio is required (min 20 characters)</Text>
            </View>
          </View>
        </View>

        <Pressable style={[s.ctaPrimary, shadows.button, { opacity: 0.6 }]}>
          <Text style={s.ctaPrimaryText}>CONTINUE</Text>
          <Feather name="arrow-right" size={16} color={colors.textInverse} />
        </Pressable>
      </View>
    </PageShell>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function AuthProfileSetupStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Companion profile form with valid mock data, city dropdown, bio, hourly rate">
        <DefaultState />
      </StateSection>
      <StateSection title="VALIDATION" description="Seeker view with required field errors, age under 21, no photo">
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
  page: { gap: 16, paddingVertical: 24 },

  title: { ...typography.h1, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: -8 },

  // Progress
  progressWrap: { gap: 6 },
  progressTrack: {
    height: 8,
    backgroundColor: colors.borderLight,
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin,
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
  avatarArea: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    backgroundColor: colors.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 22,
    right: '50%',
    marginRight: -50,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: { ...typography.caption, color: colors.textMuted },

  // Form
  form: { gap: 14 },
  inputGroup: { gap: 4 },
  label: { ...typography.caption, color: colors.text, textTransform: 'uppercase', letterSpacing: 1, fontWeight: '700' },
  hint: { ...typography.caption, color: colors.textLight },
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
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  charCount: { ...typography.caption, color: colors.textLight, textAlign: 'right' },
  inputError: {
    borderColor: colors.error,
    borderWidth: borderWidth.normal,
  },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  errorText: { ...typography.caption, color: colors.error },

  rateRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  rateSuggestion: {
    backgroundColor: colors.badge.pink.bg,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  rateSuggestionText: { ...typography.caption, color: colors.primary },

  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
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
  dropdownText: { ...typography.body, color: colors.text, flex: 1 },
  dropdownPlaceholder: { ...typography.body, color: colors.textLight, flex: 1 },

  cityList: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    maxHeight: 200,
    overflow: 'hidden',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cityItemText: { ...typography.body, color: colors.text },

  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  trustText: { ...typography.caption, color: colors.textMuted },

  ctaPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
  },
  ctaPrimaryText: { ...typography.button, color: colors.textInverse },
});
