import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showAlert } from '../../src/utils/alert';
import { useAuthStore } from '../../src/store/authStore';
import { usersApi, referralApi, citiesApi } from '../../src/services/api';
import type { City } from '../../src/services/api';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import type { UserRole } from '../../src/types';

// Web-only: native <select> for city (RN Modal doesn't work well on web)
const WebCitySelect = Platform.OS === 'web'
  ? ({ value, cities, onChange, hasError, colors: c }: {
      value: string;
      cities: City[];
      onChange: (val: string) => void;
      hasError: boolean;
      colors: any;
    }) => {
      const selectStyle = {
        width: '100%' as const,
        height: 48,
        border: `2px solid ${hasError ? '#FF3B30' : c.border}`,
        borderRadius: 12,
        backgroundColor: c.surface,
        paddingLeft: 16,
        paddingRight: 16,
        fontSize: 16,
        color: value ? c.text : c.textSecondary,
        appearance: 'none' as const,
        WebkitAppearance: 'none' as const,
        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23999%27 stroke-width=%272%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        backgroundSize: '20px',
        cursor: 'pointer' as const,
        outline: 'none',
      };
      return (
        // @ts-ignore - web-only DOM element
        <select
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select city</option>
          {cities.map((city: City) => (
            <option key={city.id} value={city.name}>{city.name}</option>
          ))}
        </select>
      );
    }
  : null;

type Step = 'role' | 'basic' | 'details';

export default function ProfileSetupScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { completeOnboarding } = useAuthStore();
  const params = useLocalSearchParams<{ role?: string }>();
  const initialRole = (params.role as UserRole) || null;
  const [step, setStep] = useState<Step>(initialRole ? 'basic' : 'role');
  const [role, setRole] = useState<UserRole | null>(initialRole);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCities = async () => {
      setCitiesLoading(true);
      setCitiesError(false);
      try {
        const data = await citiesApi.getActive();
        if (!cancelled) setCities(data);
      } catch {
        if (!cancelled) setCitiesError(true);
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    };
    fetchCities();
    return () => { cancelled = true; };
  }, []);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setStep('basic');
  };

  const handleBasicNext = () => {
    if (!name.trim()) {
      showAlert('Required', 'Please enter your name');
      return;
    }
    const ageNum = parseInt(age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99) {
      showAlert('Invalid Age', 'Please enter a valid age (18-99)');
      return;
    }
    if (!location.trim()) {
      showAlert('Required', 'Please enter your location');
      return;
    }
    setStep('details');
  };

  const handleComplete = async () => {
    if (!bio.trim()) {
      showAlert('Required', 'Please write something about yourself');
      return;
    }

    if (role === 'companion') {
      const rate = parseInt(hourlyRate, 10);
      if (isNaN(rate) || rate <= 0) {
        showAlert('Required', 'Please enter your hourly rate (must be greater than 0)');
        return;
      }
      if (rate >= 10000) {
        showAlert('Invalid Rate', 'Hourly rate must be less than $10,000');
        return;
      }
    }

    const result = await completeOnboarding({
      name: name.trim(),
      age: parseInt(age),
      role: role!,
      bio: bio.trim(),
      photos: [],
      location: location.trim(),
      hourlyRate: role === 'companion' ? parseInt(hourlyRate) : undefined,
    });

    if (!result.success) {
      showAlert('Error', result.error || 'Failed to complete setup. Please try again.');
      return;
    }

    // Non-blocking referral code application after auth is established
    if (referralCode.trim()) {
      try {
        await referralApi.applyCode(referralCode.trim().toUpperCase());
      } catch {
        // Referral code failure should not block registration
      }
    }

    // Non-blocking avatar upload after auth is established
    if (avatarUri) {
      try {
        await usersApi.uploadProfilePhoto(avatarUri);
      } catch {
        // Avatar upload failure should not block registration
      }
    }

    // Navigate to verification flow based on role
    // Companions need identity/background verification before going live
    // Seekers need identity verification before booking
    router.replace(role === 'companion' ? '/(comp-onboard)/step2' : '/(seeker-verify)/intro');
  };

  const handleBack = () => {
    if (step === 'basic') {
      setStep('role');
    } else if (step === 'details') {
      setStep('basic');
    }
  };

  if (step === 'role') {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.content, { paddingTop: insets.top + spacing.xl }]}>
          <Text style={[styles.title, { color: colors.text }]}>Who are you?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose your role to personalize your experience
          </Text>

          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleCard, { borderColor: colors.black, backgroundColor: colors.accent }]}
              onPress={() => handleRoleSelect('companion')}
              testID="setup-companion-btn"
              accessibilityLabel="Select Companion role"
              accessibilityRole="button"
              accessibilityHint="Get paid to go on amazing dates"
            >
              <View style={[styles.roleIconContainer, { backgroundColor: colors.black }]}>
                <Icon name="user" size={32} color={colors.accent} />
              </View>
              <Text style={[styles.roleTitle, { color: colors.text }]}>Companion</Text>
              <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
                Get paid to go on amazing dates. Set your own rates and schedule.
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.roleCard, { borderColor: colors.black, backgroundColor: colors.secondary }]}
              onPress={() => handleRoleSelect('seeker')}
              testID="setup-seeker-btn"
              accessibilityLabel="Select Date Seeker role"
              accessibilityRole="button"
              accessibilityHint="Find interesting companions for dinners and events"
            >
              <View style={[styles.roleIconContainer, { backgroundColor: colors.black }]}>
                <Icon name="search" size={32} color={colors.secondary} />
              </View>
              <Text style={[styles.roleTitle, { color: colors.text }]}>Date Seeker</Text>
              <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
                Find interesting companions for dinners, events, and experiences.
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity style={styles.backButton} onPress={handleBack} testID="setup-back-btn"
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={20} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}> Back</Text>
        </TouchableOpacity>

        {step === 'basic' && (
          <>
            <Text style={[styles.title, { color: colors.text }]}>Tell us about yourself</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>This helps others get to know you</Text>

            {/* Avatar picker */}
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={pickAvatar}
              activeOpacity={0.7}
              accessibilityLabel={avatarUri ? 'Change profile photo' : 'Add profile photo'}
              accessibilityRole="button"
              testID="setup-avatar-picker"
            >
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={[styles.avatarImage, { borderColor: colors.border }]} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Icon name="camera" size={24} color={colors.textSecondary} />
                </View>
              )}
              <Text style={[styles.avatarHint, { color: colors.textSecondary }]}>
                {avatarUri ? 'Change photo' : 'Add photo'}
              </Text>
            </TouchableOpacity>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Your name</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="Enter your name"
                  placeholderTextColor={colors.textSecondary}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  testID="setup-name-input"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Age</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder="Your age"
                  placeholderTextColor={colors.textSecondary}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  maxLength={2}
                  testID="setup-age-input"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>City</Text>
                {Platform.OS === 'web' && WebCitySelect ? (
                  <WebCitySelect
                    value={location}
                    cities={cities}
                    onChange={setLocation}
                    hasError={false}
                    colors={colors}
                  />
                ) : (
                  <TouchableOpacity
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }]}
                    onPress={() => setCityPickerVisible(true)}
                    activeOpacity={0.7}
                    accessibilityLabel={location ? `City: ${location}` : 'Select city'}
                    accessibilityRole="button"
                    testID="setup-location-input"
                  >
                    <Icon name="map-pin" size={20} color={colors.textSecondary} />
                    <Text
                      style={[
                        { flex: 1, fontSize: typography.sizes.md, marginLeft: spacing.sm },
                        location ? { color: colors.text } : { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {location || 'Select city'}
                    </Text>
                    <Icon name="arrow-down" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
                {citiesError && (
                  <Text style={[styles.hint, { color: '#FF3B30' }]}>Failed to load cities</Text>
                )}
              </View>
            </View>

            <Button
              title="Continue"
              onPress={handleBasicNext}
              fullWidth
              size="lg"
              testID="setup-basic-continue-btn"
            />
          </>
        )}

        {step === 'details' && (
          <>
            <Text style={[styles.title, { color: colors.text }]}>Complete your profile</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {role === 'companion'
                ? 'Help potential clients understand who you are'
                : 'Tell companions about your interests'}
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>About you</Text>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                  placeholder={
                    role === 'companion'
                      ? 'Share your interests, personality, what you enjoy on dates...'
                      : 'What kind of experiences are you looking for?'
                  }
                  placeholderTextColor={colors.textSecondary}
                  value={bio}
                  onChangeText={setBio}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  testID="setup-bio-input"
                />
              </View>

              {role === 'seeker' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Referral Code (optional)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="e.g. DR-ABC12"
                    placeholderTextColor={colors.textSecondary}
                    value={referralCode}
                    onChangeText={setReferralCode}
                    autoCapitalize="characters"
                    maxLength={8}
                    testID="setup-referral-input"
                  />
                  <Text style={[styles.hint, { color: colors.textSecondary }]}>
                    Have a friend's code? Get 50% off your Background Check.
                  </Text>
                </View>
              )}

              {role === 'companion' && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, { color: colors.text }]}>Hourly Rate ($)</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                    placeholder="Your hourly rate"
                    placeholderTextColor={colors.textSecondary}
                    value={hourlyRate}
                    onChangeText={setHourlyRate}
                    keyboardType="number-pad"
                    testID="setup-rate-input"
                  />
                  <Text style={[styles.hint, { color: colors.textSecondary }]}>
                    You can change this anytime. Platform takes 15% service fee.
                  </Text>
                </View>
              )}
            </View>

            <Button
              title="Complete Setup"
              onPress={handleComplete}
              fullWidth
              size="lg"
              testID="setup-complete-btn"
            />

            <Text style={[styles.photoNote, { color: colors.textSecondary }]}>
              You can add photos later from your profile
            </Text>
          </>
        )}
      </ScrollView>

      {/* City Picker Modal (native only -- web uses <select>) */}
      {Platform.OS !== 'web' && (
        <Modal
          visible={cityPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCityPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCityPickerVisible(false)}
            accessibilityLabel="Close city picker"
            accessibilityRole="button"
          >
            <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select City</Text>
                <TouchableOpacity
                  onPress={() => setCityPickerVisible(false)}
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                >
                  <Icon name="x" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              {citiesLoading ? (
                <View style={styles.cityPickerLoading}>
                  <Text style={[styles.cityPickerLoadingText, { color: colors.textSecondary }]}>Loading cities...</Text>
                </View>
              ) : citiesError ? (
                <View style={styles.cityPickerLoading}>
                  <Text style={{ color: '#FF3B30', fontSize: typography.sizes.sm }}>Failed to load cities. Please try again.</Text>
                </View>
              ) : (
                <FlatList
                  data={cities}
                  keyExtractor={(item) => item.id}
                  style={styles.cityList}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.cityPickerLoading}>
                      <Text style={[styles.cityPickerLoadingText, { color: colors.textSecondary }]}>No cities available</Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.cityItem,
                        { borderBottomColor: colors.border },
                        location === item.name && styles.cityItemSelected,
                      ]}
                      onPress={() => {
                        setLocation(item.name);
                        setCityPickerVisible(false);
                      }}
                      accessibilityLabel={`City ${item.name}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: location === item.name }}
                    >
                      <Text
                        style={[
                          styles.cityItemText,
                          { color: colors.text },
                          location === item.name && styles.cityItemTextSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    minHeight: 44,
  },
  backText: {
    fontSize: typography.sizes.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  roleContainer: {
    gap: spacing.lg,
  },
  roleCard: {
    padding: spacing.xl,
    borderRadius: borderRadius.xl,
    borderWidth: 3,
    alignItems: 'center',
    minHeight: 180,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  roleIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  roleTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  roleDescription: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarHint: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    minHeight: 48,
  },
  textArea: {
    minHeight: 120,
    paddingTop: spacing.md,
  },
  hint: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  photoNote: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  // City picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    maxHeight: 420,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  cityList: {
    maxHeight: 360,
  },
  cityItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  cityItemSelected: {
    backgroundColor: '#FF69B4',
  },
  cityItemText: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    textAlign: 'center',
  },
  cityItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cityPickerLoading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  cityPickerLoadingText: {
    fontSize: typography.sizes.md,
  },
});
