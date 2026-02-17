import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import type { UserRole } from '../../src/types';

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
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
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.birthYear.trim()) {
      newErrors.birthYear = 'Birth year is required';
    } else {
      const year = parseInt(formData.birthYear);
      const currentYear = new Date().getFullYear();
      if (year < 1940 || year > currentYear - 18) {
        newErrors.birthYear = 'You must be at least 18 years old';
      }
    }
    if (isFemale && !formData.hourlyRate.trim()) {
      newErrors.hourlyRate = 'Hourly rate is required';
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

    // Try to complete onboarding via API
    const result = await completeOnboarding(onboardingData);

    if (!result.success) {
      // API failed (no backend) - use demo mode
      // Directly set user in store for demo/testing
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
        createdAt: new Date().toISOString(),
      });
      setOnboardingSeen();
    }

    setLoading(false);

    // Navigate to correct tabs based on role
    // In Expo Router, /male is equivalent to /male/index when index.tsx exists
    if (isFemale) {
      router.replace('/female');
    } else {
      router.replace('/male');
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="register-back-btn"
        >
          <Icon name="arrow-left" size={20} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}> Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isFemale
            ? "Let's set up your companion profile"
            : "Join and start booking dates"
          }
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.white, borderColor: errors.name ? colors.primary : colors.border, color: colors.text }]}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
              value={formData.name}
              onChangeText={(v) => { updateField('name', v); setErrors(e => ({...e, name: ''})); }}
              autoCapitalize="words"
              testID="register-name-input"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.white, borderColor: errors.email ? colors.primary : colors.border, color: colors.text }]}
              placeholder="email@example.com"
              placeholderTextColor={colors.textSecondary}
              value={formData.email}
              onChangeText={(v) => { updateField('email', v); setErrors(e => ({...e, email: ''})); }}
              keyboardType="email-address"
              autoCapitalize="none"
              testID="register-email-input"
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>Birth Year</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.white, borderColor: errors.birthYear ? colors.primary : colors.border, color: colors.text }]}
                placeholder="1995"
                placeholderTextColor={colors.textSecondary}
                value={formData.birthYear}
                onChangeText={(v) => { updateField('birthYear', v); setErrors(e => ({...e, birthYear: ''})); }}
                keyboardType="number-pad"
                maxLength={4}
              />
              {errors.birthYear && <Text style={styles.errorText}>{errors.birthYear}</Text>}
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={[styles.label, { color: colors.text }]}>Location</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
                placeholder="City"
                placeholderTextColor={colors.textSecondary}
                value={formData.location}
                onChangeText={(v) => updateField('location', v)}
              />
            </View>
          </View>

          {isFemale && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Hourly Rate ($)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
                placeholder="100"
                placeholderTextColor={colors.textSecondary}
                value={formData.hourlyRate}
                onChangeText={(v) => updateField('hourlyRate', v)}
                keyboardType="number-pad"
              />
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                You can change this later. Platform fee is 15%.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
            fullWidth
            size="lg"
            testID="register-submit-btn"
          />
        </View>

        <Text style={[styles.terms, { color: colors.textSecondary }]}>
          By creating an account, you agree to our{' '}
          <Text style={[styles.link, { color: colors.primary }]}>Terms of Service</Text> and{' '}
          <Text style={[styles.link, { color: colors.primary }]}>Privacy Policy</Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    marginBottom: spacing.lg,
    minHeight: 44,
  },
  backText: {
    fontSize: typography.sizes.md,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xl,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.md,
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
  hint: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  buttonContainer: {
    marginBottom: spacing.lg,
  },
  terms: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    fontWeight: '600',
  },
  errorText: {
    color: '#E57373',
    fontSize: 12,
    marginTop: 4,
  },
});
