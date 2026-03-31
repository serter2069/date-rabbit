import React, { useEffect } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  router
} from 'expo-router';
import {
  useSafeAreaInsets
} from 'react-native-safe-area-context';
import {
  LinearGradient
} from 'expo-linear-gradient';
import {
  Icon, IconName
} from '../../src/components/Icon';
import {
  Button
} from '../../src/components/Button';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  borderWidth,
  PAGE_PADDING,
} from '../../src/constants/theme';
import {
  useAuthStore
} from '../../src/store/authStore';

const GAP = spacing.xl * 2;

// Activities from ActivityType enum
const ACTIVITIES = [
  { label: 'Coffee', icon: 'coffee' as IconName },
  { label: 'Dinner', icon: 'utensils' as IconName },
  { label: 'Drinks', icon: 'wine' as IconName },
  { label: 'Museum', icon: 'image' as IconName },
  { label: 'Walk', icon: 'map-pin' as IconName },
  { label: 'Events', icon: 'calendar' as IconName },
];

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/onboarding');
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'companion' ? '/(tabs)/female' : '/(tabs)/male');
    }
  }, [isAuthenticated, user]);

  if (Platform.OS !== 'web') return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── NAV ── */}
        <View style={styles.nav}>
          <View style={styles.logo}>
            <LinearGradient
              colors={colors.gradient.primary as readonly [string, string, ...string[]]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.logoBox}
            >
              <Icon name="rabbit" size={18} color={colors.white} />
            </LinearGradient>
            <Text style={styles.logoText}>DateRabbit</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInBtn}
            accessibilityLabel="Sign In"
            accessibilityRole="button"
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* ── HERO ── */}
        <View style={styles.hero}>
          {/* Eyebrow */}
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrow}>
              <Text style={styles.eyebrowText}>For women who know their worth</Text>
            </View>
          </View>

          <Text style={styles.headline}>
            Your attention{'\n'}is{' '}
            <Text style={styles.headlineAccent}>worth money.</Text>
          </Text>

          <Text style={styles.heroBody}>
            Stop giving your time away for free. Set your price, meet verified men, get paid via Stripe.
            Your attention is the product — own it.
          </Text>

          <View style={styles.heroCtas}>
            <View style={styles.ctaWrap}>
              <Button
                title="Start Earning"
                variant="primary"
                onPress={() => router.push('/onboarding?roleHint=companion')}
              />
            </View>
            <View style={styles.ctaWrap}>
              <Button
                title="Find a Companion"
                variant="outline"
                onPress={() => router.push('/onboarding?roleHint=seeker')}
              />
            </View>
          </View>

          {/* ── HERO IMAGE ── */}
          <Image
            source={require('../../assets/images/hero-woman.jpeg')}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Activity tags */}
          <View style={styles.activityRow}>
            {ACTIVITIES.map((a) => (
              <View key={a.label} style={styles.activityTag}>
                <Icon name={a.icon} size={14} color={colors.primary} />
                <Text style={styles.activityLabel}>{a.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── HOW IT WORKS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>THE PROCESS</Text>
          <Text style={styles.sectionTitle}>4 steps to your first payout.</Text>

          <View style={styles.stepsGrid}>
            <StepCard
              num="01"
              title="Create your profile"
              body="Upload photos, set your rate ($50–200/hr), choose activities you enjoy. Takes 10 minutes."
            />
            <StepCard
              num="02"
              title="Get verified, get noticed"
              body="We verify every man before he can message you. No randoms. No creeps. Only serious, checked men."
            />
            <StepCard
              num="03"
              title="Accept what feels right"
              body="You decide who to meet, when, and where. Decline anything. No pressure, no quotas."
            />
            <StepCard
              num="04"
              title="Get paid after every date"
              body="Stripe deposits 85% of your rate directly to your bank. Payout after every booking."
            />
          </View>
        </View>

        {/* ── DUAL AUDIENCE ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TWO SIDES</Text>
          <Text style={styles.sectionTitle}>Built for women. Open to everyone.</Text>

          <View style={styles.twoCol}>
            {/* Companion card */}
            <View style={[styles.roleCard, styles.roleCardCompanion]}>
              <View style={[styles.roleIconWrap, { backgroundColor: colors.white + '20' }]}>
                <Icon name="sparkles" size={24} color={colors.white} />
              </View>
              <Text style={[styles.roleCardTitle, { color: colors.white }]}>You deserve to be paid</Text>
              <Text style={[styles.roleCardBody, { color: colors.white, opacity: 0.8 }]}>
                Your time is valuable. Your company is a premium experience. Set your rate, choose your dates, keep 85% of everything you earn. No games, no drama — just real money.
              </Text>
              <View style={styles.roleList}>
                <RolePoint text="$50–200/hr — you set the price" dark />
                <RolePoint text="Keep 85% of every booking" dark />
                <RolePoint text="Stripe direct deposit, no delays" dark />
                <RolePoint text="You choose who to meet" dark />
                <RolePoint text="Your schedule, your terms" dark />
              </View>
              <TouchableOpacity
                style={[styles.roleBtn, { backgroundColor: colors.white }]}
                onPress={() => router.push('/onboarding?roleHint=companion')}
                accessibilityLabel="Start earning"
                accessibilityRole="button"
              >
                <Text style={[styles.roleBtnText, { color: colors.text }]}>Start Earning →</Text>
              </TouchableOpacity>
            </View>

            {/* Seeker card */}
            <View style={[styles.roleCard, styles.roleCardSeeker]}>
              <View style={styles.roleIconWrap}>
                <Icon name="search" size={24} color={colors.primary} />
              </View>
              <Text style={styles.roleCardTitle}>Find someone worth your time</Text>
              <Text style={styles.roleCardBody}>
                Real, verified women who chose to be here. No fake profiles. Pay for their time — because women who know their worth don't give it away for free.
              </Text>
              <View style={styles.roleList}>
                <RolePoint text="Verified identity, real person" />
                <RolePoint text="Transparent hourly pricing" />
                <RolePoint text="No subscription, pay per date" />
                <RolePoint text="In-app safety for both sides" />
                <RolePoint text="Rate and review after" />
              </View>
              <TouchableOpacity
                style={styles.roleBtn}
                onPress={() => router.push('/onboarding?roleHint=seeker')}
                accessibilityLabel="Browse companions"
                accessibilityRole="button"
              >
                <Text style={styles.roleBtnText}>Browse Companions →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── TRUST / VERIFICATION ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SAFETY FIRST</Text>
          <Text style={styles.sectionTitle}>Every man is background-checked. No exceptions.</Text>
          <Text style={styles.sectionBody}>
            Before any man can message you, he passes a full identity and criminal background check. We verify government ID, run a criminal record check, and confirm it's really him with a live selfie. Your safety isn't a feature — it's the foundation.
          </Text>

          <View style={styles.verifyGrid}>
            <VerifyCard
              title="Women verify with"
              items={[
                'Government photo ID',
                'Live selfie match',
                'Video introduction',
                '2 personal references',
                'Background check consent',
              ]}
              color={colors.primary}
            />
            <VerifyCard
              title="Men verify with"
              items={[
                'Government photo ID',
                'Live selfie match',
                'SSN last 4 digits',
                'Criminal background check',
                'Identity verification (Stripe Identity)',
              ]}
              color={colors.accent}
            />
          </View>

          {/* Safety features */}
          <View style={styles.safetyRow}>
            <SafetyBadge icon="shield" text="Criminal background check on every man" />
            <SafetyBadge icon="eye-off" text="Government ID + live selfie required" />
            <SafetyBadge icon="alert" text="One-tap SOS during dates" />
            <SafetyBadge icon="lock" text="Payments via Stripe, never direct cash" />
          </View>
        </View>

        {/* ── PRICING TRANSPARENCY ── */}
        <View style={styles.pricingBlock}>
          <Text style={styles.pricingEyebrow}>YOUR EARNINGS</Text>
          <Text style={styles.pricingTitle}>Know exactly what you'll make.</Text>
          <Text style={styles.pricingBody}>
            Every booking is transparent. You set your hourly rate. DateRabbit takes 15%. The rest is yours — deposited to your bank account after every date.
          </Text>
          <View style={styles.pricingCards}>
            <View style={styles.pricingCard}>
              <Text style={styles.pricingCardValue}>$50–200</Text>
              <Text style={styles.pricingCardLabel}>per hour, set by companion</Text>
            </View>
            <View style={styles.pricingDivider} />
            <View style={styles.pricingCard}>
              <Text style={styles.pricingCardValue}>85%</Text>
              <Text style={styles.pricingCardLabel}>goes to companion, always</Text>
            </View>
            <View style={styles.pricingDivider} />
            <View style={styles.pricingCard}>
              <Text style={styles.pricingCardValue}>$0</Text>
              <Text style={styles.pricingCardLabel}>to browse, filter, and chat</Text>
            </View>
          </View>
        </View>

        {/* ── TESTIMONIALS ── */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>REAL FEEDBACK</Text>
          <Text style={styles.sectionTitle}>From people who've used it.</Text>
          <View style={styles.testimonialGrid}>
            <TestimonialCard
              quote="I was skeptical but I made $400 in my first week. Two dinners, one museum date. I set my rate at $80/hr and every man was respectful and verified."
              name="Sofia M."
              role="Companion, Los Angeles"
            />
            <TestimonialCard
              quote="What I love most is control. I decline anyone I'm not comfortable with. My time, my rules. I've been doing this for 3 months and it changed my finances."
              name="Anastasia K."
              role="Companion, 3 months"
            />
            <TestimonialCard
              quote="I had no idea this existed. I needed company for a business dinner in NY. The woman I met was brilliant. Worth every dollar. Totally respectful experience."
              name="James R."
              role="Seeker, New York"
            />
          </View>
        </View>

        {/* ── FINAL CTA ── */}
        <View style={styles.finalCta}>
          <Text style={styles.finalCtaTitle}>Ready to earn?</Text>
          <Text style={styles.finalCtaBody}>
            Create your profile in 10 minutes. Set your rate. Start meeting serious, verified men who value your time.
          </Text>
          <View style={styles.finalCtaBtns}>
            <View style={styles.ctaWrap}>
              <Button
                title="Become a Companion"
                variant="primary"
                onPress={() => router.push('/onboarding?roleHint=companion')}
              />
            </View>
            <View style={styles.ctaWrap}>
              <Button
                title="Find a Companion"
                variant="outline"
                onPress={() => router.push('/onboarding?roleHint=seeker')}
              />
            </View>
          </View>
        </View>

        {/* ── FOOTER ── */}
        <View style={styles.footer}>
          <Text style={styles.footerBrand}>DateRabbit</Text>
          <View style={styles.footerLinks}>
            <FooterLink label="Terms" onPress={() => router.push('/terms')} />
            <FooterLink label="Privacy" onPress={() => router.push('/privacy')} />
            <FooterLink label="Safety" onPress={() => router.push('/safety')} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────── Sub-components ───────────────────────

function StepCard({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <View style={styles.stepCard}>
      <Text style={styles.stepNum}>{num}</Text>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepBody}>{body}</Text>
    </View>
  );
}

function RolePoint({ text, dark }: { text: string; dark?: boolean }) {
  return (
    <View style={styles.rolePoint}>
      <View style={[styles.rolePointDot, dark && { backgroundColor: colors.white }]} />
      <Text style={[styles.rolePointText, dark && { color: colors.white }]}>{text}</Text>
    </View>
  );
}

function VerifyCard({ title, items, color }: { title: string; items: string[]; color: string }) {
  return (
    <View style={styles.verifyCard}>
      <View style={[styles.verifyAccent, { backgroundColor: color }]} />
      <Text style={styles.verifyTitle}>{title}</Text>
      {items.map((item, i) => (
        <View key={i} style={styles.verifyItem}>
          <Icon name="check" size={14} color={colors.success} />
          <Text style={styles.verifyItemText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function SafetyBadge({ icon, text }: { icon: IconName; text: string }) {
  return (
    <View style={styles.safetyBadge}>
      <Icon name={icon} size={16} color={colors.primary} />
      <Text style={styles.safetyBadgeText}>{text}</Text>
    </View>
  );
}

function TestimonialCard({ quote, name, role }: { quote: string; name: string; role: string }) {
  return (
    <View style={styles.testimonialCard}>
      <Text style={styles.testimonialQuote}>"{quote}"</Text>
      <View style={styles.testimonialAuthor}>
        <Text style={styles.testimonialName}>{name}</Text>
        <Text style={styles.testimonialRole}>{role}</Text>
      </View>
    </View>
  );
}

function FooterLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
    >
      <Text style={styles.footerLinkText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ─────────────────────── Styles ───────────────────────

const NEO_SHADOW = {
  shadowColor: colors.shadow,
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 3,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: PAGE_PADDING,
    paddingTop: spacing.xl,
  },

  // NAV
  nav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  logoBox: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
  },
  logoText: {
    fontFamily: typography.fonts.heading,
    fontSize: 16,
    color: colors.text,
  },
  signInBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    ...NEO_SHADOW,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
  signInText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },

  // HERO
  hero: {
    marginBottom: GAP,
  },
  eyebrowRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  eyebrow: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    ...NEO_SHADOW,
  },
  eyebrowText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    color: colors.white,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  headline: {
    fontFamily: typography.fonts.heading,
    fontSize: 52,
    lineHeight: 58,
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -1.5,
  },
  headlineAccent: {
    color: colors.primary,
    fontFamily: typography.fonts.headingItalic,
    fontStyle: 'italic',
  },
  heroBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    lineHeight: 28,
    color: colors.textMuted,
    maxWidth: 520,
    marginBottom: spacing.lg,
  },
  heroCtas: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  ctaWrap: {
    minWidth: 190,
  },
  heroImage: {
    width: '100%',
    height: 380,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.lg,
    ...NEO_SHADOW,
  },
  heroImageText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    color: colors.primary,
    opacity: 0.5,
    letterSpacing: 2,
    textTransform: 'uppercase' as const,
    marginTop: spacing.sm,
  },
  activityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  activityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    ...NEO_SHADOW,
  },
  activityLabel: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    color: colors.text,
  },

  // SECTIONS
  section: {
    marginBottom: GAP,
  },
  sectionLabel: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 30,
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  sectionBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    lineHeight: 26,
    marginBottom: spacing.xl,
    maxWidth: 580,
  },

  // HOW IT WORKS — 4 steps
  stepsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  stepCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...NEO_SHADOW,
    flex: 1,
    minWidth: 220,
  },
  stepNum: {
    fontFamily: typography.fonts.heading,
    fontSize: 32,
    color: colors.primary,
    marginBottom: spacing.sm,
    letterSpacing: -1,
  },
  stepTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  stepBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },

  // DUAL AUDIENCE
  twoCol: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  roleCard: {
    flex: 1,
    minWidth: 280,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    ...NEO_SHADOW,
  },
  roleCardSeeker: {
    backgroundColor: colors.surface,
  },
  roleCardCompanion: {
    backgroundColor: colors.text,
  },
  roleIconWrap: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
  },
  roleCardTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 22,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  roleCardBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  roleList: {
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  rolePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rolePointDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    flexShrink: 0,
  },
  rolePointText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  roleBtn: {
    backgroundColor: colors.primary,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignSelf: 'flex-start',
    ...NEO_SHADOW,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
  roleBtnText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.sm,
    color: colors.white,
    letterSpacing: 0.5,
  },

  // VERIFICATION
  verifyGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  verifyCard: {
    flex: 1,
    minWidth: 240,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...NEO_SHADOW,
    overflow: 'hidden',
  },
  verifyAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  verifyTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  verifyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  verifyItemText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  safetyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...NEO_SHADOW,
  },
  safetyBadgeText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },

  // PRICING BLOCK
  pricingBlock: {
    backgroundColor: colors.text,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    padding: spacing.xl,
    marginBottom: GAP,
    marginHorizontal: -PAGE_PADDING,
    paddingHorizontal: PAGE_PADDING + spacing.md,
    ...NEO_SHADOW,
  },
  pricingEyebrow: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  pricingTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 28,
    color: colors.white,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  pricingBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.white,
    opacity: 0.7,
    lineHeight: 26,
    marginBottom: spacing.xl,
    maxWidth: 540,
  },
  pricingCards: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  pricingCard: {
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
  },
  pricingCardValue: {
    fontFamily: typography.fonts.heading,
    fontSize: 36,
    color: colors.primary,
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  pricingCardLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.white,
    opacity: 0.6,
    textAlign: 'center',
  },
  pricingDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.white,
    opacity: 0.15,
  },

  // TESTIMONIALS
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
    ...NEO_SHADOW,
    flex: 1,
    minWidth: 240,
  },
  testimonialQuote: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 26,
    marginBottom: spacing.md,
    flex: 1,
  },
  testimonialAuthor: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: spacing.md,
  },
  testimonialName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  testimonialRole: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginTop: 2,
  },

  // FINAL CTA
  finalCta: {
    alignItems: 'center',
    marginBottom: GAP,
    paddingVertical: spacing.xl,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    ...NEO_SHADOW,
    paddingHorizontal: PAGE_PADDING,
  },
  finalCtaTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 48,
    color: colors.text,
    letterSpacing: -1.5,
    marginBottom: spacing.sm,
  },
  finalCtaBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  finalCtaBtns: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  // FOOTER
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginBottom: spacing.md,
  },
  footerBrand: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.sm,
    color: colors.textLight,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  footerLinkText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
});
