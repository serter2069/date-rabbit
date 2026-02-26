import React, { useState, useRef, useEffect } from 'react';
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

const CODE_LENGTH = 8;

export default function OTPScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { pendingEmail, verifyCode, resendCode, isLoading, error, clearError, authStep } = useAuthStore();
  const [code, setCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (authStep === 'onboarding') {
      router.replace('/(auth)/profile-setup');
    }
  }, [authStep]);

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, CODE_LENGTH);
    setCode(cleaned);
    clearError();
  };

  const handleVerify = async () => {
    if (code.length !== CODE_LENGTH) {
      Alert.alert('Invalid Code', 'Please enter all 8 digits');
      return;
    }

    const result = await verifyCode(code);
    if (!result.success) {
      Alert.alert('Verification Failed', result.error || 'Invalid code. Please try again.');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;

    const result = await resendCode();
    if (result.success) {
      setResendCooldown(60);
      Alert.alert('Code Sent', 'A new code has been sent to your email');
    } else {
      Alert.alert('Error', result.error || 'Failed to resend code');
    }
  };

  const renderCodeBoxes = () => {
    const boxes = [];
    for (let i = 0; i < CODE_LENGTH; i++) {
      const isFilled = i < code.length;
      const isActive = i === code.length;
      boxes.push(
        <View
          key={i}
          style={[
            styles.codeBox,
            { borderColor: colors.border, backgroundColor: colors.surface },
            isFilled && { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
            isActive && { borderColor: colors.primary },
          ]}
        >
          <Text style={[styles.codeText, { color: colors.text }]}>{code[i] || ''}</Text>
        </View>
      );
    }
    return boxes;
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
          testID="otp-back-btn"
        >
          <Icon name="arrow-left" size={20} color={colors.primary} />
          <Text style={[styles.backText, { color: colors.primary }]}> Back</Text>
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Enter Code</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          We sent an 8-digit code to{'\n'}
          <Text style={[styles.email, { color: colors.primary }]}>{pendingEmail}</Text>
        </Text>

        <TouchableOpacity
          activeOpacity={1}
          onPress={() => inputRef.current?.focus()}
          style={styles.codeContainer}
        >
          {renderCodeBoxes()}
        </TouchableOpacity>

        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={code}
          onChangeText={handleCodeChange}
          keyboardType="number-pad"
          maxLength={CODE_LENGTH}
          autoComplete="one-time-code"
          testID="otp-code-input"
        />

        {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}

        <Button
          title="Verify"
          onPress={handleVerify}
          loading={isLoading}
          disabled={code.length !== CODE_LENGTH}
          fullWidth
          size="lg"
          testID="otp-verify-btn"
        />

        <View style={styles.resendContainer}>
          <Text style={[styles.resendText, { color: colors.textSecondary }]}>Didn't receive the code? </Text>
          <TouchableOpacity
            onPress={handleResend}
            disabled={resendCooldown > 0}
            style={styles.resendButton}
            testID="otp-resend-btn"
          >
            <Text style={[styles.resendLink, { color: colors.primary }, resendCooldown > 0 && { color: colors.textSecondary }]}>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
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
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  email: {
    fontWeight: '600',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  codeBox: {
    width: 40,
    height: 52,
    borderWidth: 2,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  codeText: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  errorText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
    minHeight: 44,
    alignItems: 'center',
  },
  resendText: {
    fontSize: typography.sizes.sm,
  },
  resendButton: {
    minHeight: 44,
    justifyContent: 'center',
  },
  resendLink: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
});
