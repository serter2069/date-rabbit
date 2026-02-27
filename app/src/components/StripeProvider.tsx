import React from 'react';
import { Platform } from 'react-native';

interface StripeProviderProps {
  children: React.ReactNode;
}

// Web-only Stripe wrapper. On native platforms, just render children.
export function StripeProvider({ children }: StripeProviderProps) {
  if (Platform.OS !== 'web') {
    return <>{children}</>;
  }

  // Lazy import to avoid bundling on native
  const WebStripeProvider = require('./StripeProviderWeb').default;
  return <WebStripeProvider>{children}</WebStripeProvider>;
}
