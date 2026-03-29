import React, { useState, useEffect } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Constants from 'expo-constants';

interface Props {
  children: React.ReactNode;
}

export default function StripeProviderWeb({ children }: Props) {
  const [stripePromise, setStripePromise] = useState<Promise<Stripe | null> | null>(null);

  useEffect(() => {
    // Defer Stripe SDK initialization until after first paint to avoid
    // blocking the initial bundle parse/execute on page load.
    const publishableKey =
      Constants.expoConfig?.extra?.stripePublishableKey ||
      process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
      '';

    if (!publishableKey) {
      console.warn('[Stripe] EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Stripe will not be initialized.');
      return;
    }

    setStripePromise(loadStripe(publishableKey));
  }, []);

  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
}
