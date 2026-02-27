import React from 'react';
import { View, Text, StyleSheet, Linking, Platform, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '../../src/components/Button';
import { Badge } from '../../src/components/Badge';
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
          <View style={styles.langBtn}>
            <Text style={styles.langBtnText}>EN</Text>
          </View>
        </View>

        {showRedirectMessage && (
          <View style={styles.redirectBanner}>
            <Text style={styles.redirectText}>Please sign in to access that page</Text>
          </View>
        )}

        {/* Hero */}
        <View style={styles.hero}>
          <Badge text="Premium dating marketplace" variant="gradient" size="md" />

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

          {/* Stats */}
          <View style={styles.statsRow}>
            <Stat number="2K+" label="Companions" />
            <Stat number="15K+" label="Bookings" />
            <Stat number="4.9" label="Rating" />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Find Companions"
            label="Looking for a date?"
            onPress={() => router.push({ pathname: '/(auth)/role-select', params: { role: 'seeker' } })}
            variant="primary"
            fullWidth
            size="lg"
            testID="welcome-seeker-btn"
          />
          <Button
            title="Become a Companion"
            label="Want to earn?"
            onPress={() => router.push({ pathname: '/(auth)/role-select', params: { role: 'companion' } })}
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
          <Text
            style={styles.footerLink}
            onPress={() => router.push('/terms')}
          >
            Terms
          </Text>
          <Text
            style={styles.footerLink}
            onPress={() => router.push('/privacy')}
          >
            Privacy
          </Text>
          <Text
            style={styles.footerLink}
            onPress={() => openLink('https://daterabbit.com/safety')}
          >
            Safety
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function openLink(url: string) {
  if (Platform.OS === 'web') {
    window.open(url, '_blank');
  } else {
    Linking.openURL(url);
  }
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

function Stat({ number, label }: { number: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statNumber}>{number}</Text>
      <Text style={styles.statLabel}>{label}</Text>
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
    flexGrow: 1,
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
  langBtn: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
  },
  langBtnText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
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
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.xl,
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

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl + spacing.sm,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  stat: {
    gap: spacing.xs,
  },
  statNumber: {
    fontFamily: typography.fonts.heading,
    fontSize: 24,
    color: colors.text,
  },
  statLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Actions
  actions: {
    marginTop: 'auto',
    gap: spacing.md,
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
  },
});
