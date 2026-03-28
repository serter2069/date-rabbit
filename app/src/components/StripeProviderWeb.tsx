import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Constants from 'expo-constants';

const publishableKey =
  Constants.expoConfig?.extra?.stripePublishableKey ||
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  '';

if (!publishableKey) {
  console.warn('[Stripe] EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Stripe will not be initialized.');
}

const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

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
