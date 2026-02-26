import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Icon } from '../../src/components/Icon';
import { colors, spacing, typography, borderRadius, PAGE_PADDING } from '../../src/constants/theme';
import type { UserRole } from '../../src/types';

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
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLoading(true);

    const onboardingData = {
      name: formData.name,
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
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
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
              <Input
                label="Birth Year"
                placeholder="1995"
                value={formData.birthYear}
                onChangeText={(v) => updateField('birthYear', v)}
                error={errors.birthYear}
                keyboardType="number-pad"
                maxLength={4}
                leftIcon={<Icon name="calendar" size={20} color={colors.textLight} />}
              />
            </View>

            <View style={styles.halfWidth}>
              <Input
                label="Location"
                placeholder="City"
                value={formData.location}
                onChangeText={(v) => updateField('location', v)}
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
                hint="You can change this later. Platform fee is 15%."
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
          <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </ScrollView>
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
});
