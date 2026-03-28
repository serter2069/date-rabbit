import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../src/components/Button';
// Badge removed -- "Premium dating marketplace" didn't match the color scheme
import { Icon } from '../../src/components/Icon';
import { colors, spacing, typography, borderRadius, PAGE_PADDING } from '../../src/constants/theme';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { redirect } = useLocalSearchParams<{ redirect?: string }>();
  const showRedirectMessage = redirect === '1';

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
        {/* Header */}
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

        {showRedirectMessage && (
          <View style={styles.redirectBanner}>
            <Text style={styles.redirectText}>Please sign in to access that page</Text>
          </View>
        )}

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.headline}>
            Real dates.{'\n'}
            <Text style={styles.headlineHighlight}>Your terms.</Text>
          </Text>

          <Text style={styles.subtitle}>
            Book verified companions for dates, events, or simply great company. Safe, transparent, and on your schedule.
          </Text>

          {/* Value props */}
          <View style={styles.valueProps}>
            <ValueItem text="All profiles verified with ID" />
            <ValueItem text="Secure payments via Stripe" />
            <ValueItem text="24/7 safety & support team" />
          </View>

        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Find Companions"
            label="Looking for a date?"
            onPress={() => router.push(`/(auth)/login?role=seeker`)}
            variant="primary"
            fullWidth
            size="lg"
            testID="welcome-seeker-btn"
          />
          <Button
            title="Become a Companion"
            label="Want to earn?"
            onPress={() => router.push(`/(auth)/register?role=companion`)}
            variant="secondary"
            fullWidth
            size="lg"
            testID="welcome-companion-btn"
          />
          <Text style={styles.signinLink}>
            Already have an account?{' '}
            <Text style={styles.signinLinkAction} onPress={() => router.push('/(auth)/login')}>
              Sign in
            </Text>
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.push('/terms')}
            accessibilityLabel="Terms of Service"
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>Terms</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/privacy')}
            accessibilityLabel="Privacy Policy"
            accessibilityRole="button"
          >
            <Text style={styles.footerLink}>Privacy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/safety')}
            testID="welcome-safety-link"
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
    // Do NOT use flexGrow: 1 — it expands content to fill the viewport
    // height, making ScrollView think everything fits and disabling scroll.
    // On small screens (390x664) the bottom buttons get clipped. Let
    // content be its natural height so the ScrollView actually scrolls.
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
    marginBottom: spacing.xl + spacing.md,
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

  // Redirect banner
  redirectBanner: {
    backgroundColor: colors.primaryLight + '30',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.lg,
  },
  redirectText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.secondary,
    textAlign: 'center',
  },

  // Hero
  hero: {
    paddingVertical: spacing.lg,
  },
  headline: {
    fontFamily: typography.fonts.heading,
    fontSize: 40,
    lineHeight: 45,
    color: colors.text,
    marginTop: spacing.lg,
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
    maxWidth: 300,
    marginBottom: spacing.xl,
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


  // Actions
  actions: {
    marginTop: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.md,
  },
  signinLink: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  signinLinkAction: {
    fontFamily: typography.fonts.bodyMedium,
    color: colors.text,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  footerLink: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
});
