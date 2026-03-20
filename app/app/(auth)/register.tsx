import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Modal,
  FlatList,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Icon } from '../../src/components/Icon';
import { colors, spacing, typography, borderRadius, borderWidth, shadows, PAGE_PADDING } from '../../src/constants/theme';
import type { UserRole } from '../../src/types';

const CURRENT_YEAR = new Date().getFullYear();
const MIN_YEAR = 1950;
const MAX_YEAR = CURRENT_YEAR - 18;
const BIRTH_YEARS = Array.from(
  { length: MAX_YEAR - MIN_YEAR + 1 },
  (_, i) => MAX_YEAR - i,
);

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { role } = useLocalSearchParams<{ role: UserRole }>();
  const { completeOnboarding } = useAuthStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    birthYear: '',
    location: '',
    hourlyRate: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showFormError, setShowFormError] = useState(false);
  const [yearPickerVisible, setYearPickerVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const isFemale = role === 'companion';

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Name must be less than 100 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.birthYear.trim()) {
      newErrors.birthYear = 'Birth year is required';
    } else {
      const year = parseInt(formData.birthYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(year) || year < 1900 || year > currentYear - 18) {
        newErrors.birthYear = 'You must be at least 18 years old';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'City is required';
    }

    if (isFemale) {
      if (!formData.hourlyRate.trim()) {
        newErrors.hourlyRate = 'Hourly rate is required';
      } else {
        const rate = parseInt(formData.hourlyRate);
        if (isNaN(rate) || rate <= 0) {
          newErrors.hourlyRate = 'Rate must be greater than $0';
        } else if (rate > 10000) {
          newErrors.hourlyRate = 'Rate must be less than $10,000';
        }
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    setShowFormError(!isValid);
    if (!isValid) {
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
    return isValid;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);

    const onboardingData = {
      name: formData.name,
      email: formData.email,
      age: parseInt(formData.birthYear) ? new Date().getFullYear() - parseInt(formData.birthYear) : 25,
      role: role || 'seeker',
      bio: '',
      photos: [],
      location: formData.location,
      hourlyRate: isFemale ? parseInt(formData.hourlyRate) || 100 : undefined,
    };

    const result = await completeOnboarding(onboardingData);

    if (!result.success) {
      const { setUser, setOnboardingSeen } = useAuthStore.getState();
      setUser({
        id: 'demo-' + Date.now(),
        email: formData.email,
        name: formData.name,
        role: (role || 'seeker') as 'seeker' | 'companion',
        age: onboardingData.age,
        location: formData.location || 'New York',
        bio: '',
        photos: [] as { id: string; url: string; order: number; isPrimary: boolean }[],
        hourlyRate: onboardingData.hourlyRate,
        rating: 5.0,
        reviewCount: 0,
        isVerified: false,
        verificationStatus: 'not_started',
        createdAt: new Date().toISOString(),
      });
      setOnboardingSeen();
    }

    setLoading(false);

    // Route to verification flow
    if (isFemale) {
      router.replace('/(comp-onboard)/step1');
    } else {
      router.replace('/(seeker-verify)/intro');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const updated = { ...prev, [field]: '' };
      // Hide banner when all errors are cleared
      const hasErrors = Object.values(updated).some(v => v);
      if (!hasErrors) setShowFormError(false);
      return updated;
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="register-back-btn"
        >
          <Icon name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            {isFemale
              ? "Let's set up your companion profile"
              : 'Join and start booking dates'
            }
          </Text>
        </View>

        {/* Validation error banner */}
        {showFormError && Object.keys(errors).length > 0 && (
          <View style={styles.errorBanner} testID="register-error-banner">
            <Icon name="alert-circle" size={18} color={colors.error} />
            <Text style={styles.errorBannerText}>
              Please fix the highlighted fields below
            </Text>
          </View>
        )}

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Full Name"
            placeholder="Your name"
            value={formData.name}
            onChangeText={(v) => updateField('name', v)}
            error={errors.name}
            autoCapitalize="words"
            maxLength={100}
            leftIcon={<Icon name="user" size={20} color={colors.textLight} />}
            testID="register-name-input"
          />

          <Input
            label="Email"
            placeholder="email@example.com"
            value={formData.email}
            onChangeText={(v) => updateField('email', v)}
            error={errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Icon name="mail" size={20} color={colors.textLight} />}
            testID="register-email-input"
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.pickerLabel}>Birth Year</Text>
              <TouchableOpacity
                style={[
                  styles.yearPickerTrigger,
                  errors.birthYear ? styles.yearPickerTriggerError : null,
                ]}
                onPress={() => setYearPickerVisible(true)}
                activeOpacity={0.7}
              >
                <Icon name="calendar" size={20} color={colors.textLight} />
                <Text
                  style={[
                    styles.yearPickerText,
                    !formData.birthYear && styles.yearPickerPlaceholder,
                  ]}
                >
                  {formData.birthYear || 'Select'}
                </Text>
                <Icon name="arrow-down" size={16} color={colors.textLight} />
              </TouchableOpacity>
              {errors.birthYear ? (
                <Text style={styles.yearPickerError}>{errors.birthYear}</Text>
              ) : null}
            </View>

            <View style={styles.halfWidth}>
              <Input
                label="Location"
                placeholder="City"
                value={formData.location}
                onChangeText={(v) => updateField('location', v)}
                error={errors.location}
                leftIcon={<Icon name="map-pin" size={20} color={colors.textLight} />}
              />
            </View>
          </View>

          {isFemale && (
            <View>
              <Input
                label="Hourly Rate ($)"
                placeholder="100"
                value={formData.hourlyRate}
                onChangeText={(v) => updateField('hourlyRate', v)}
                error={errors.hourlyRate}
                keyboardType="number-pad"
                hint="You can change this later"
                leftIcon={<Icon name="dollar" size={20} color={colors.textLight} />}
              />
            </View>
          )}
        </View>

        {/* Submit */}
        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          variant="pink"
          fullWidth
          size="lg"
          testID="register-submit-btn"
        />

        <Text style={styles.terms}>
          By creating an account, you agree to our{' '}
          <Text style={styles.termsLink} onPress={() => router.push('/terms')}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink} onPress={() => router.push('/privacy')}>Privacy Policy</Text>
        </Text>
      </ScrollView>

      {/* Birth Year Picker Modal */}
      <Modal
        visible={yearPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setYearPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setYearPickerVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Birth Year</Text>
              <TouchableOpacity onPress={() => setYearPickerVisible(false)}>
                <Icon name="x" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={BIRTH_YEARS}
              keyExtractor={(item) => item.toString()}
              style={styles.yearList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.yearItem,
                    formData.birthYear === item.toString() && styles.yearItemSelected,
                  ]}
                  onPress={() => {
                    updateField('birthYear', item.toString());
                    setYearPickerVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.yearItemText,
                      formData.birthYear === item.toString() && styles.yearItemTextSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: PAGE_PADDING,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    lineHeight: 24,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  errorBannerText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.error,
    flex: 1,
  },
  form: {
    marginBottom: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  terms: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  termsLink: {
    fontFamily: typography.fonts.bodyMedium,
    color: colors.secondary,
  },
  // Year picker trigger
  pickerLabel: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xs,
    color: colors.text,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  yearPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    gap: spacing.sm,
    ...shadows.sm,
  },
  yearPickerTriggerError: {
    borderColor: colors.error,
  },
  yearPickerText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  yearPickerPlaceholder: {
    color: colors.textLight,
  },
  yearPickerError: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  // Modal
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
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    ...shadows.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  yearList: {
    maxHeight: 360,
  },
  yearItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  yearItemSelected: {
    backgroundColor: colors.primary,
  },
  yearItemText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
    color: colors.text,
    textAlign: 'center',
  },
  yearItemTextSelected: {
    color: colors.textInverse,
    fontFamily: typography.fonts.heading,
  },
});
