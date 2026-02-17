import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { useTheme } from '../../src/constants/theme';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { colors, spacing, typography } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.lg,
      justifyContent: 'space-between',
      paddingTop: insets.top + spacing.xl,
      paddingBottom: insets.bottom + spacing.lg,
    },
    header: {
      alignItems: 'center',
    },
    logoContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: 36,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: spacing.sm,
    },
    subtitle: {
      fontSize: typography.sizes.md,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 24,
    },
    features: {
      alignItems: 'flex-start',
      paddingHorizontal: spacing.xl,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
      gap: spacing.md,
    },
    featureIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.success + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureText: {
      fontSize: typography.sizes.md,
      color: colors.text,
    },
    buttonContainer: {
      width: '100%',
      gap: spacing.md,
    },
    terms: {
      fontSize: typography.sizes.xs,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
      marginTop: spacing.md,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Icon name="rabbit" size={64} color={colors.primary} />
        </View>
        <Text style={styles.title}>DateRabbit</Text>
        <Text style={styles.subtitle}>
          Where meaningful connections meet premium experiences
        </Text>
      </View>

      <View style={styles.features}>
        <FeatureItem
          icon={<Icon name="user-check" size={18} color={colors.success} />}
          text="Verified profiles only"
          colors={colors}
          spacing={spacing}
          typography={typography}
        />
        <FeatureItem
          icon={<Icon name="shield" size={18} color={colors.success} />}
          text="Safe & secure payments"
          colors={colors}
          spacing={spacing}
          typography={typography}
        />
        <FeatureItem
          icon={<Icon name="help" size={18} color={colors.success} />}
          text="24/7 support"
          colors={colors}
          spacing={spacing}
          typography={typography}
        />
      </View>

      <View>
        <View style={styles.buttonContainer}>
          <Button
            title="Create Account"
            onPress={() => router.push('/(auth)/role-select')}
            fullWidth
            size="lg"
            testID="welcome-create-account-btn"
          />
          <Button
            title="I already have an account"
            onPress={() => router.push('/(auth)/login')}
            variant="outline"
            fullWidth
            size="lg"
            testID="welcome-login-btn"
          />
        </View>
        <Text style={styles.terms}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

function FeatureItem({
  icon,
  text,
  colors,
  spacing,
  typography,
}: {
  icon: React.ReactNode;
  text: string;
  colors: any;
  spacing: any;
  typography: any;
}) {
  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
      gap: spacing.md,
    }}>
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.success + '20',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {icon}
      </View>
      <Text style={{
        fontSize: typography.sizes.md,
        color: colors.text,
      }}>{text}</Text>
    </View>
  );
}
