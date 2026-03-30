import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon } from '../../src/components/Icon';
import { Button } from '../../src/components/Button';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  borderWidth,
  shadows,
  PAGE_PADDING,
} from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { useEffect } from 'react';

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuthStore();

  // If somehow rendered on native, redirect to onboarding
  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/onboarding');
    }
  }, []);

  // If authenticated user lands here, redirect to tabs
  useEffect(() => {
    if (isAuthenticated && user) {
      const isCompanion = user.role === 'companion';
      router.replace(isCompanion ? '/(tabs)/female' : '/(tabs)/male');
    }
  }, [isAuthenticated, user]);

  if (Platform.OS !== 'web') return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Decorative blobs */}
      <View style={styles.decoBlob1} />
      <View style={styles.decoBlob2} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header / Logo */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <LinearGradient
              colors={colors.gradient.primary as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoIcon}
            >
              <Icon name="rabbit" size={20} color={colors.white} />
            </LinearGradient>
            <Text style={styles.logoText}>DateRabbit</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.headline}>
            Find your{'\n'}
            <Text style={styles.headlineHighlight}>perfect date</Text>
            {'\n'}companion.
          </Text>

          <Text style={styles.subtitle}>
            Book verified companions for dates, events, or great company.
            Safe, transparent, and on your schedule.
          </Text>
        </View>

        {/* Role Cards */}
        <View style={styles.roleCards}>
          <TouchableOpacity
            style={[styles.roleCard, styles.roleCardSeeker]}
            onPress={() => router.push('/onboarding?roleHint=seeker')}
            activeOpacity={0.85}
            accessibilityLabel="Looking for a Date"
            accessibilityRole="button"
          >
            <View style={styles.roleIconWrap}>
              <Icon name="heart" size={28} color={colors.primary} />
            </View>
            <Text style={styles.roleTitle}>Looking for a Date</Text>
            <Text style={styles.roleDesc}>
              Browse verified companions and book your perfect date
            </Text>
            <View style={styles.roleArrow}>
              <Icon name="chevron-right" size={20} color={colors.text} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.roleCard, styles.roleCardCompanion]}
            onPress={() => router.push('/onboarding?roleHint=companion')}
            activeOpacity={0.85}
            accessibilityLabel="Become a Companion"
            accessibilityRole="button"
          >
            <View style={[styles.roleIconWrap, styles.roleIconWrapAccent]}>
              <Icon name="sparkles" size={28} color={colors.accentDark} />
            </View>
            <Text style={styles.roleTitle}>Become a Companion</Text>
            <Text style={styles.roleDesc}>
              Set your own rates, schedule, and start earning
            </Text>
            <View style={styles.roleArrow}>
              <Icon name="chevron-right" size={20} color={colors.text} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Value props */}
        <View style={styles.valueProps}>
          <ValueItem text="All profiles verified with ID" />
          <ValueItem text="Secure payments via Stripe" />
          <ValueItem text="24/7 safety & support team" />
        </View>

        {/* Sign in link */}
        <View style={styles.signinWrap}>
          <Text style={styles.signinLink}>
            Already have an account?{' '}
            <Text
              style={styles.signinLinkAction}
              onPress={() => router.push('/(auth)/login')}
            >
              Sign in
            </Text>
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            onPress={() => router.push('/terms')}
            accessibilityLabel="Terms of Service"
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>Terms</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/privacy')}
            accessibilityLabel="Privacy Policy"
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/safety')}
            accessibilityLabel="Safety information"
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>Safety</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function ValueItem({ text }: { text: string }) {
  return (
    <View style={styles.valueItem}>
      <LinearGradient
        colors={colors.gradient.primary as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.valueDot}
      />
      <Text style={styles.valueText}>{text}</Text>
    </View>
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
    paddingHorizontal: PAGE_PADDING,
    paddingTop: spacing.xl,
  },

  // Decorative blobs
  decoBlob1: {
    position: 'absolute',
    width: 300,
    height: 300,
    backgroundColor: colors.primaryLight,
    opacity: 0.12,
    borderRadius: 150,
    top: -100,
    right: -120,
    transform: [{ scaleX: 1.2 }],
  },
  decoBlob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    backgroundColor: colors.accent,
    opacity: 0.1,
    borderRadius: 100,
    bottom: 150,
    left: -80,
    transform: [{ scaleX: 1.3 }],
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    marginTop: spacing.md,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
  },
  logoIcon: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontFamily: typography.fonts.heading,
    fontSize: 18,
    color: colors.text,
  },

  // Hero
  hero: {
    paddingVertical: spacing.md,
  },
  headline: {
    fontFamily: typography.fonts.heading,
    fontSize: 36,
    lineHeight: 42,
    color: colors.text,
    marginBottom: spacing.md,
  },
  headlineHighlight: {
    fontFamily: typography.fonts.headingItalic,
    color: colors.primary,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    lineHeight: 26,
    color: colors.textMuted,
    maxWidth: 340,
    marginBottom: spacing.lg,
  },

  // Role cards
  roleCards: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
  },
  roleCardSeeker: {
    // default styling
  },
  roleCardCompanion: {
    // default styling
  },
  roleIconWrap: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  roleIconWrapAccent: {
    backgroundColor: colors.accentLight + '30',
  },
  roleTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  roleDesc: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  roleArrow: {
    position: 'absolute',
    right: spacing.lg,
    top: spacing.lg,
  },

  // Value props
  valueProps: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  valueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  valueDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  valueText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm + 1,
    color: colors.textSecondary,
  },

  // Sign in
  signinWrap: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  signinLink: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  signinLinkAction: {
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.sm,
  },
  footerLink: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
});
