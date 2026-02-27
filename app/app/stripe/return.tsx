import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Icon } from '../../src/components/Icon';
import { Button } from '../../src/components/Button';
import { useTheme, spacing, typography } from '../../src/constants/theme';

export default function StripeReturnScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)/female/earnings');
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconCircle, { backgroundColor: colors.success + '20' }]}>
        <Icon name="check" size={48} color={colors.success} />
      </View>
      <Text style={[styles.title, { color: colors.text }]}>Setup Complete!</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Your Stripe account has been connected. You can now receive payments.
      </Text>
      <Button
        title="Go to Earnings"
        onPress={() => router.replace('/(tabs)/female/earnings')}
        style={{ marginTop: spacing.lg }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 24,
  },
});
