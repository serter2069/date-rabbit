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
import { colors, spacing, typography, borderRadius, PAGE_PADDING } from '../../src/constants/theme';

export default function ForgotPasswordScreen() {
  const insets = useSafeAreaInsets();
  const { startAuth, isLoading, error, clearError, authStep } = useAuthStore();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  useEffect(() => {
    if (authStep === 'otp') {
      router.push(`/(auth)/otp?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    }
  }, [authStep]);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
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
      setEmailError(result.error || 'Failed to send code. Please try again.');
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
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(auth)/login');
            }
          }}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={20} color={colors.text} />
        </TouchableOpacity>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Trouble signing in?</Text>
          <Text style={styles.subtitle}>
            We use email codes, not passwords. Enter your email and we'll send you a sign-in code.
          </Text>
        </View>

        {/* Info box */}
        <View style={styles.infoBox}>
          <Icon name="info" size={18} color={colors.primary} />
          <Text style={styles.infoText}>
            No password needed — just enter your email and use the 6-digit code we send you to sign in instantly.
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
            testID="forgot-password-email-input"
          />
        </View>

        <Button
          title="Send code"
          onPress={handleSendCode}
          loading={isLoading}
          fullWidth
          size="lg"
          testID="forgot-password-send-btn"
        />

        {/* Back to login */}
        <TouchableOpacity
          style={styles.backToLogin}
          onPress={() => router.replace('/(auth)/login')}
          accessibilityRole="button"
        >
          <Text style={styles.backToLoginText}>Back to sign in</Text>
        </TouchableOpacity>
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
    marginBottom: spacing.lg,
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
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '12',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  form: {
    marginBottom: spacing.lg,
  },
  backToLogin: {
    alignItems: 'center',
    marginTop: spacing.xl,
    minHeight: 44,
    justifyContent: 'center',
  },
  backToLoginText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
});
