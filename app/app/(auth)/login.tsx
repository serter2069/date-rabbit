import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { startAuth, isLoading, error, clearError, authStep } = useAuthStore();
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (authStep === 'otp') {
      router.push('/(auth)/otp');
    }
  }, [authStep]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      Alert.alert('Required', 'Please enter your email address');
      return;
    }
    if (!validateEmail(email.trim())) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    clearError();
    const result = await startAuth(email.trim().toLowerCase());

    if (!result.success) {
      // API failed (no backend) - use demo mode login
      const { setUser, setOnboardingSeen } = useAuthStore.getState();

      // Create demo user based on email
      const demoUser = {
        id: 'demo-' + Date.now(),
        email: email.trim().toLowerCase(),
        name: email.split('@')[0], // Use email prefix as name
        role: 'seeker' as 'seeker' | 'companion',
        age: 28,
        location: 'New York',
        bio: '',
        photos: [] as { id: string; url: string; order: number; isPrimary: boolean }[],
        rating: 5.0,
        reviewCount: 0,
        isVerified: false,
        createdAt: new Date().toISOString(),
      };

      setUser(demoUser);
      setOnboardingSeen();

      // Navigate to home
      router.replace('/male');
      return;
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.content, { paddingTop: insets.top + spacing.lg }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="login-back-btn"
        >
          <Icon name="arrow-left" size={20} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}> Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Welcome</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Enter your email to sign in or create an account
        </Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
              placeholder="email@example.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearError();
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
              testID="login-email-input"
            />
          </View>

          {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
        </View>

        <Button
          title="Continue"
          onPress={handleSendCode}
          loading={isLoading}
          fullWidth
          size="lg"
          testID="login-continue-btn"
        />
      </View>
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  form: {
    marginBottom: spacing.lg,
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
  errorText: {
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
