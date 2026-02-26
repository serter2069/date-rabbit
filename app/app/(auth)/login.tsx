import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../src/store/authStore';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Icon } from '../../src/components/Icon';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { startAuth, isLoading, error, clearError, authStep } = useAuthStore();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (authStep === 'otp') {
      router.push('/(auth)/otp');
    }
  }, [authStep]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSendCode = async () => {
    setEmailError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }

    clearError();
    const result = await startAuth(email.trim().toLowerCase());

    if (!result.success) {
      const { setUser, setOnboardingSeen } = useAuthStore.getState();

      const demoUser = {
        id: 'demo-' + Date.now(),
        email: email.trim().toLowerCase(),
        name: email.split('@')[0],
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
      router.replace('/male');
      return;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.lg },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          testID="login-back-btn"
        >
          <Icon name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>
            Enter your email to sign in or create an account
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="email@example.com"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
              clearError();
            }}
            error={emailError || error || undefined}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoCorrect={false}
            size="lg"
            leftIcon={<Icon name="mail" size={20} color={colors.textLight} />}
            testID="login-email-input"
          />
        </View>

        {/* Button */}
        <Button
          title="Continue"
          onPress={handleSendCode}
          loading={isLoading}
          fullWidth
          size="lg"
          testID="login-continue-btn"
        />

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social login */}
        <Button
          title="Continue with Google"
          onPress={() => {}}
          variant="secondary"
          fullWidth
          size="lg"
          icon={<Icon name="google" size={20} color={colors.text} />}
        />
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
  content: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg + 4,
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
    marginBottom: spacing.xl + spacing.md,
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
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.divider,
  },
  dividerText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textLight,
    paddingHorizontal: spacing.md,
  },
});
