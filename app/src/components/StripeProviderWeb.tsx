import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Constants from 'expo-constants';

const publishableKey =
  Constants.expoConfig?.extra?.stripePublishableKey ||
  'pk_test_51T5TlyPIXSgCWIzOHEKqYS4Pqjt8VNkMlPx2aZ6MIqJQf1UWTEJvEdcSfrLj9z3qRzG49fQrF0FxEGqaNLNpSIX00Hb8bFncl';

const stripePromise = loadStripe(publishableKey);

interface Props {
  children: React.ReactNode;
}

export default function StripeProviderWeb({ children }: Props) {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
