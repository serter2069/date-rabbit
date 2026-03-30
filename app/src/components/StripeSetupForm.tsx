import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTheme, spacing, typography, borderRadius } from '../constants/theme';

interface StripeSetupFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

// Native fallback — SetupIntent UI is web-only
function NativeFallback() {
  const { colors } = useTheme();
  return (
    <View style={styles.fallback}>
      <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
        Open DateRabbit in your browser to manage payment methods.
      </Text>
    </View>
  );
}

function WebSetupForm({ clientSecret, onSuccess, onError, onCancel }: StripeSetupFormProps) {
  const { colors } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    useStripe,
    useElements,
    PaymentElement,
  } = require('@stripe/react-stripe-js');
  const { loadStripe } = require('@stripe/stripe-js');
  const { Elements } = require('@stripe/react-stripe-js');
  const Constants = require('expo-constants').default;

  const publishableKey =
    Constants.expoConfig?.extra?.stripePublishableKey ||
    process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
    '';

  if (!publishableKey) {
    return (
      <View style={styles.fallback}>
        <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
          Payment is not available. Stripe key is missing.
        </Text>
      </View>
    );
  }

  const stripePromise = loadStripe(publishableKey);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <InnerSetupForm
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
      />
    </Elements>
  );
}

function InnerSetupForm({
  onSuccess,
  onError,
  onCancel,
}: Omit<StripeSetupFormProps, 'clientSecret'>) {
  const { colors } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { useStripe, useElements, PaymentElement } = require('@stripe/react-stripe-js');
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async () => {
    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: 'https://daterabbit.smartlaunchhub.com/stripe/return',
      },
      redirect: 'if_required',
    });

    if (error) {
      const msg = error.message || 'Failed to save card';
      setErrorMessage(msg);
      onError?.(msg);
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <View style={styles.formContainer}>
      <PaymentElement />

      {errorMessage && (
        <View
          style={[
            styles.errorBox,
            { backgroundColor: colors.error + '15', borderColor: colors.error },
          ]}
        >
          <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
        </View>
      )}

      <View style={styles.buttonRow}>
        {onCancel && (
          <View
            // @ts-ignore web-only onClick
            onClick={!isProcessing ? onCancel : undefined}
            style={[
              styles.cancelButton,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
          </View>
        )}

        <View
          // @ts-ignore web-only onClick
          onClick={!isProcessing ? handleSubmit : undefined}
          style={[
            styles.saveButton,
            {
              backgroundColor: isProcessing ? colors.textMuted : colors.primary,
              borderColor: colors.text,
              flex: onCancel ? 1 : undefined,
            },
          ]}
        >
          {isProcessing ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveButtonText}>Save Card</Text>
          )}
        </View>
      </View>
    </View>
  );
}

export function StripeSetupForm(props: StripeSetupFormProps) {
  if (Platform.OS !== 'web') {
    return <NativeFallback />;
  }
  return <WebSetupForm {...props} />;
}

const styles = StyleSheet.create({
  formContainer: {
    gap: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  errorBox: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  saveButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    cursor: 'pointer',
  } as any,
  saveButtonText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    color: '#fff',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cancelButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    cursor: 'pointer',
  } as any,
  cancelButtonText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  fallback: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  fallbackText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
});
