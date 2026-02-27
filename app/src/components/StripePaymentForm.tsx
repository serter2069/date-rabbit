import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useTheme, spacing, typography, borderRadius } from '../constants/theme';

interface StripePaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: () => void;
  onError?: (error: string) => void;
}

// Native fallback
function NativeFallback() {
  const { colors } = useTheme();
  return (
    <View style={styles.fallback}>
      <Text style={[styles.fallbackText, { color: colors.textSecondary }]}>
        Open DateRabbit in your browser to complete payment.
      </Text>
    </View>
  );
}

// Web-only payment form
function WebPaymentForm({ clientSecret, amount, onSuccess, onError }: StripePaymentFormProps) {
  const { colors } = useTheme();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Dynamic imports for web only
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
    'pk_test_51T5TlyPIXSgCWIzOHEKqYS4Pqjt8VNkMlPx2aZ6MIqJQf1UWTEJvEdcSfrLj9z3qRzG49fQrF0FxEGqaNLNpSIX00Hb8bFncl';

  const stripePromise = loadStripe(publishableKey);

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <InnerForm
        amount={amount}
        onSuccess={onSuccess}
        onError={onError}
      />
    </Elements>
  );
}

function InnerForm({ amount, onSuccess, onError }: Omit<StripePaymentFormProps, 'clientSecret'>) {
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

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: 'https://daterabbit.smartlaunchhub.com/stripe/return',
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
      onError?.(error.message || 'Payment failed');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  return (
    <View style={styles.formContainer}>
      <PaymentElement />

      {errorMessage && (
        <View style={[styles.errorBox, { backgroundColor: colors.error + '15', borderColor: colors.error }]}>
          <Text style={[styles.errorText, { color: colors.error }]}>{errorMessage}</Text>
        </View>
      )}

      <View
        // @ts-ignore - web-only onClick
        onClick={!isProcessing ? handleSubmit : undefined}
        style={[
          styles.payButton,
          {
            backgroundColor: isProcessing ? colors.textMuted : colors.primary,
            borderColor: colors.text,
          },
        ]}
      >
        {isProcessing ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.payButtonText}>Pay ${amount.toFixed(2)}</Text>
        )}
      </View>
    </View>
  );
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  if (Platform.OS !== 'web') {
    return <NativeFallback />;
  }
  return <WebPaymentForm {...props} />;
}

const styles = StyleSheet.create({
  formContainer: {
    gap: spacing.md,
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
  payButton: {
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
  payButtonText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    color: '#fff',
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
