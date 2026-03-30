import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Icon, IconName } from '../../src/components/Icon';
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

const SECTION_GAP = spacing.xl * 2;

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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + spacing.lg },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Header / Nav */}
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
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            accessibilityLabel="Sign In"
            accessibilityRole="button"
          >
            <Text style={styles.signInNav}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* 2. Hero */}
        <View style={styles.hero}>
          <Text style={styles.headline}>
            Find Your{'\n'}
            <Text style={styles.headlineHighlight}>Perfect Date</Text>
            {'\n'}Companion.
          </Text>

          <Text style={styles.subtitle}>
            Browse verified companions for dates, events, and great company. Safe, transparent, and on your schedule.
          </Text>

          <View style={styles.heroButtons}>
            <View style={styles.heroButtonWrap}>
              <Button
                title="Find a Companion"
                variant="primary"
                onPress={() => router.push('/onboarding?roleHint=seeker')}
              />
            </View>
            <View style={styles.heroButtonWrap}>
              <Button
                title="Become a Companion"
                variant="outline"
                onPress={() => router.push('/onboarding?roleHint=companion')}
              />
            </View>
          </View>
        </View>

        {/* 3. Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>1,000+</Text>
            <Text style={styles.statLabel}>Companions</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>50+</Text>
            <Text style={styles.statLabel}>Cities</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.9</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* 4. How It Works */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={styles.stepsRow}>
            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepTitle}>Create Profile</Text>
              <Text style={styles.stepDesc}>Sign up and complete your profile in minutes</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepTitle}>Browse & Connect</Text>
              <Text style={styles.stepDesc}>Browse verified companions and chat before booking</Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepTitle}>Enjoy Your Date</Text>
              <Text style={styles.stepDesc}>Meet up and enjoy a great time, safely and on your terms</Text>
            </View>
          </View>
        </View>

        {/* 5. Why DateRabbit -- 6 Feature Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why DateRabbit?</Text>
          <View style={styles.featureGrid}>
            <FeatureCard icon="shield" title="Verified Profiles" desc="Every companion verified with government ID" />
            <FeatureCard icon="lock" title="Secure Payments" desc="Stripe-powered payments, never stored on our servers" />
            <FeatureCard icon="star" title="Real Reviews" desc="Honest ratings from verified bookings only" />
            <FeatureCard icon="message-circle" title="Chat First" desc="Message companions before committing to a booking" />
            <FeatureCard icon="calendar" title="Flexible Scheduling" desc="Book for any date, time, and activity you choose" />
            <FeatureCard icon="help-circle" title="24/7 Support" desc="Our safety team is available around the clock" />
          </View>
        </View>

        {/* 6. For Companions -- Dark Block */}
        <View style={styles.companionBlock}>
          <Text style={styles.companionHeadline}>Earn on Your Terms</Text>
          <Text style={styles.companionSubtitle}>
            Set your own rates, choose your schedule, and build a client base on your terms
          </Text>
          <View style={styles.companionStats}>
            <View style={styles.companionStatItem}>
              <Text style={styles.companionStatValue}>Set Your Rate</Text>
            </View>
            <View style={styles.companionStatItem}>
              <Text style={styles.companionStatValue}>Keep 85%</Text>
            </View>
            <View style={styles.companionStatItem}>
              <Text style={styles.companionStatValue}>You Decide</Text>
            </View>
          </View>
          <View style={styles.companionButtonWrap}>
            <TouchableOpacity
              style={styles.companionButton}
              onPress={() => router.push('/onboarding?roleHint=companion')}
              activeOpacity={0.85}
            >
              <Text style={styles.companionButtonText}>START EARNING TODAY</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 7. Testimonials */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What People Say</Text>
          <View style={styles.testimonialGrid}>
            <TestimonialCard
              quote="DateRabbit made it so easy to find a great companion for a work event. Professional and fun!"
              name="Michael R., New York"
            />
            <TestimonialCard
              quote="I've been a companion for 3 months and it's been incredible. The platform is safe and the earnings are great."
              name="Sofia M., Companion"
            />
            <TestimonialCard
              quote="The verification process gave me confidence. Great experience from start to finish."
              name="James K., Chicago"
            />
          </View>
        </View>

        {/* 8. Final CTA */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaHeadline}>Ready to Find Your Perfect Match?</Text>
          <Text style={styles.ctaSubtitle}>Join thousands of people already using DateRabbit</Text>
          <View style={styles.ctaButtons}>
            <View style={styles.heroButtonWrap}>
              <Button
                title="Get Started"
                variant="primary"
                onPress={() => router.push('/onboarding?roleHint=seeker')}
              />
            </View>
            <View style={styles.heroButtonWrap}>
              <Button
                title="Sign In"
                variant="outline"
                onPress={() => router.push('/(auth)/login')}
              />
            </View>
          </View>
        </View>

        {/* 9. Footer */}
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

// -- Sub-components --

function FeatureCard({ icon, title, desc }: { icon: IconName; title: string; desc: string }) {
  return (
    <View style={styles.featureCard}>
      <View style={styles.featureIconWrap}>
        <Icon name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  );
}

function TestimonialCard({ quote, name }: { quote: string; name: string }) {
  return (
    <View style={styles.testimonialCard}>
      <Text style={styles.testimonialStars}>★★★★★</Text>
      <Text style={styles.testimonialQuote}>"{quote}"</Text>
      <Text style={styles.testimonialName}>{name}</Text>
    </View>
  );
}

// -- Styles --

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

  // 1. Header
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
  signInNav: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
    color: colors.text,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,

  // 2. Hero
  hero: {
    paddingVertical: spacing.md,
    marginBottom: SECTION_GAP,
  },
  headline: {
    fontFamily: typography.fonts.heading,
    fontSize: 48,
    lineHeight: 54,
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -1,
  },
  headlineHighlight: {
    fontFamily: typography.fonts.headingItalic,
    color: colors.primary,
    fontStyle: 'italic',
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    lineHeight: 26,
    color: colors.textMuted,
    maxWidth: 420,
    marginBottom: spacing.lg,
  },
  heroButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  heroButtonWrap: {
    minWidth: 180,
  },

  // 3. Stats Strip
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    marginBottom: SECTION_GAP,
    ...shadows.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.borderLight,
  },

  // 4. How It Works
  section: {
    marginBottom: SECTION_GAP,
  },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 30,
    color: colors.text,
    marginBottom: spacing.xl,
    letterSpacing: -0.5,
  },
  stepsRow: {
    flexDirection: 'row',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  stepItem: {
    flex: 1,
    minWidth: 200,
    alignItems: 'center',
  },
  stepCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  stepNumber: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    color: colors.white,
  },
  stepTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  stepDesc: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  // 5. Feature Grid
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  featureCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    width: '48%' as any,
    minWidth: 160,
  },
  featureIconWrap: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  featureTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  featureDesc: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },

  // 6. Companion Block (dark)
  companionBlock: {
    backgroundColor: colors.text,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: SECTION_GAP,
    marginHorizontal: -PAGE_PADDING,
    paddingHorizontal: PAGE_PADDING + spacing.md,
  },
  companionHeadline: {
    fontFamily: typography.fonts.heading,
    fontSize: 30,
    color: colors.white,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  companionSubtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.white,
    opacity: 0.7,
    lineHeight: 24,
    marginBottom: spacing.xl,
    maxWidth: 460,
  },
  companionStats: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.xl,
    flexWrap: 'wrap',
  },
  companionStatItem: {
    flex: 1,
    minWidth: 100,
    alignItems: 'center',
  },
  companionStatValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    color: colors.white,
  },
  companionButtonWrap: {
    alignItems: 'flex-start',
  },
  companionButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    ...shadows.md,
  },
  companionButtonText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.sm,
    color: colors.text,
    letterSpacing: 1,
  },

  // 7. Testimonials
  testimonialGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  testimonialCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.md,
    flex: 1,
    minWidth: 240,
  },
  testimonialStars: {
    fontSize: typography.sizes.lg,
    color: colors.primary,
    marginBottom: spacing.sm,
    letterSpacing: 2,
  },
  testimonialQuote: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  testimonialName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },

  // 8. Final CTA
  ctaSection: {
    alignItems: 'center',
    marginBottom: SECTION_GAP,
  },
  ctaHeadline: {
    fontFamily: typography.fonts.heading,
    fontSize: 30,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  ctaSubtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  // 9. Footer
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
