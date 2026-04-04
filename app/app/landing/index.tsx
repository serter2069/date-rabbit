import React, { useEffect, useState } from 'react';
import {
  Image,
  View,
  Text,
  StyleSheet,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
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
  PAGE_PADDING,
} from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { apiRequest, CompanionListItem } from '../../src/services/api';

const GAP = spacing.xl * 2;

type Gender = 'female' | 'male';

const NEO_SHADOW = {
  shadowColor: colors.shadow,
  shadowOffset: { width: 3, height: 3 },
  shadowOpacity: 1,
  shadowRadius: 0,
  elevation: 3,
};

// ─────────────────────── Main component ───────────────────────

export default function LandingScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuthStore();
  const [gender, setGender] = useState<Gender | null>(null);
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/onboarding');
      return;
    }
    const saved = localStorage.getItem('dr_gender') as Gender | null;
    if (saved === 'female' || saved === 'male') {
      setGender(saved);
    } else {
      setShowSplash(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(user.role === 'companion' ? '/(tabs)/female' : '/(tabs)/male');
    }
  }, [isAuthenticated, user]);

  const selectGender = (g: Gender) => {
    if (Platform.OS === 'web') {
      localStorage.setItem('dr_gender', g);
    }
    setGender(g);
    setShowSplash(false);
  };

  if (Platform.OS !== 'web') return null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* ── GENDER SPLASH ── */}
      {showSplash && (
        <View style={styles.splash}>
          <View style={styles.splashInner}>
            <View style={styles.splashLogo}>
              <LinearGradient
                colors={colors.gradient.primary as readonly [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.splashLogoBox}
              >
                <Icon name="rabbit" size={28} color={colors.white} />
              </LinearGradient>
              <Text style={styles.splashLogoText}>DateRabbit</Text>
            </View>

            <Text style={styles.splashQuestion}>Who are you?</Text>

            <View style={styles.splashCards}>
              <TouchableOpacity
                style={[styles.splashCard, styles.splashCardFemale]}
                onPress={() => selectGender('female')}
                accessibilityLabel="I am a woman"
                accessibilityRole="button"
              >
                <Text style={styles.splashCardSymbol}>&#9792;</Text>
                <Text style={[styles.splashCardTitle, { color: colors.white }]}>Girl</Text>
                <Text style={[styles.splashCardSub, { color: colors.white, opacity: 0.85 }]}>
                  Go on dates, get paid
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.splashCard, styles.splashCardMale]}
                onPress={() => selectGender('male')}
                accessibilityLabel="I am a man"
                accessibilityRole="button"
              >
                <Text style={[styles.splashCardSymbol, { color: colors.white }]}>&#9794;</Text>
                <Text style={[styles.splashCardTitle, { color: colors.white }]}>Man</Text>
                <Text style={[styles.splashCardSub, { color: colors.white, opacity: 0.7 }]}>
                  Book a real date
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

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

          {gender !== null && (
            <View style={styles.genderToggle}>
              <TouchableOpacity
                style={[
                  styles.genderToggleBtn,
                  gender === 'female' && styles.genderToggleBtnActive,
                ]}
                onPress={() => selectGender('female')}
                accessibilityLabel="Switch to woman view"
                accessibilityRole="button"
              >
                <Text style={[
                  styles.genderToggleText,
                  gender === 'female' && styles.genderToggleTextActive,
                ]}>&#9792; Girl</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderToggleBtn,
                  gender === 'male' && styles.genderToggleBtnActiveMale,
                ]}
                onPress={() => selectGender('male')}
                accessibilityLabel="Switch to man view"
                accessibilityRole="button"
              >
                <Text style={[
                  styles.genderToggleText,
                  gender === 'male' && styles.genderToggleTextActive,
                ]}>&#9794; Man</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            onPress={() => router.push('/(auth)/login')}
            style={styles.signInBtn}
            accessibilityLabel="Sign In"
            accessibilityRole="button"
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* ── GENDER-SPECIFIC CONTENT ── */}
        {(gender ?? 'female') === 'female' ? (
          <FemaleLanding />
        ) : (
          <MaleLanding />
        )}

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

// ─────────────────────── Female Landing ───────────────────────

function FemaleLanding() {
  return (
    <>
      {/* Section 1 — Hero */}
      <View style={styles.section}>
        <Text style={styles.headline}>
          {'Go on a date.\n'}
          <Text style={styles.headlineAccent}>Get paid.</Text>
        </Text>

        <Text style={styles.heroBody}>
          Your price. Your rules. Stripe pays today.
        </Text>

        <View style={styles.heroCtas}>
          <View style={styles.ctaWrap}>
            <Button
              title="Start Earning"
              variant="primary"
              onPress={() => router.push('/onboarding?roleHint=companion')}
            />
          </View>
        </View>

        <Image
          source={require('../../assets/images/hero-woman.jpeg')}
          style={styles.heroImage}
          resizeMode="cover"
        />
      </View>

      {/* Section 2 — How it works */}
      <View style={styles.section}>
        <View style={styles.stepsGrid}>
          <StepCard num="01" title="Set your price" body="" />
          <StepCard num="02" title="Accept a booking" body="" />
          <StepCard num="03" title="Show up. Get paid." body="" />
        </View>
      </View>

      {/* Section 3 — Safety */}
      <View style={styles.section}>
        <View style={styles.safetyCards}>
          <SafetyItem
            icon="shield"
            title="Every man is ID-verified."
            body=""
          />
          <SafetyItem
            icon="check"
            title="Accept or decline anyone."
            body="Zero explanation needed."
          />
          <SafetyItem
            icon="alert"
            title="Something feels off?"
            body="Leave. You keep the money."
          />
        </View>
      </View>

      {/* Section 4 — Earnings callout */}
      <View style={styles.earningsBlock}>
        <Text style={styles.earningsTitleLarge}>$150–300</Text>
        <View style={styles.earningsStats}>
          <View style={styles.earningsStat}>
            <Text style={styles.earningsStatValue}>$150–300</Text>
            <Text style={styles.earningsStatLabel}>per date</Text>
          </View>
          <View style={styles.earningsDivider} />
          <View style={styles.earningsStat}>
            <Text style={styles.earningsStatValue}>85%</Text>
            <Text style={styles.earningsStatLabel}>is yours</Text>
          </View>
          <View style={styles.earningsDivider} />
          <View style={styles.earningsStat}>
            <Text style={styles.earningsStatValue}>Same day</Text>
            <Text style={styles.earningsStatLabel}>payout</Text>
          </View>
        </View>
      </View>

      {/* Section 5 — CTA repeat */}
      <View style={styles.finalCta}>
        <View style={styles.ctaWrap}>
          <Button
            title="Start Earning"
            variant="primary"
            onPress={() => router.push('/onboarding?roleHint=companion')}
          />
        </View>
      </View>
    </>
  );
}

// ─────────────────────── Male Landing ───────────────────────

function MaleLanding() {
  const [companions, setCompanions] = useState<CompanionListItem[]>([]);
  const [loadingCompanions, setLoadingCompanions] = useState(true);

  useEffect(() => {
    const fetchCompanions = async () => {
      try {
        const res = await apiRequest<{ companions: CompanionListItem[]; total: number }>(
          '/companions?limit=10',
          { auth: false }
        );
        setCompanions(res.companions ?? []);
      } catch {
        setCompanions([]);
      } finally {
        setLoadingCompanions(false);
      }
    };
    fetchCompanions();
  }, []);

  const PLACEHOLDER_PROFILES = [
    { id: 'p1', name: 'Sofia', rate: 120, city: 'New York', initials: 'S', color: '#FF2A5F' },
    { id: 'p2', name: 'Emma', rate: 95, city: 'Los Angeles', initials: 'E', color: '#E91E8C' },
    { id: 'p3', name: 'Mia', rate: 140, city: 'Miami', initials: 'M', color: '#9C27B0' },
    { id: 'p4', name: 'Ava', rate: 110, city: 'Chicago', initials: 'A', color: '#673AB7' },
    { id: 'p5', name: 'Chloe', rate: 85, city: 'Austin', initials: 'C', color: '#FF5722' },
  ];

  // Merge real profiles with placeholders to always show at least 5
  const displayProfiles = (() => {
    if (loadingCompanions) return null; // show skeletons
    const real = companions.map((c) => ({
      id: c.id,
      name: c.name,
      rate: c.hourlyRate,
      city: c.location ?? '',
      initials: c.name ? c.name.charAt(0).toUpperCase() : '?',
      color: '#FF2A5F',
      photo: c.primaryPhoto ?? null,
      isReal: true as const,
    }));
    const needed = Math.max(0, 5 - real.length);
    const fillers = PLACEHOLDER_PROFILES.slice(0, needed).map((p) => ({
      ...p,
      photo: null as string | null,
      isReal: false as const,
    }));
    return [...real, ...fillers];
  })();

  return (
    <>
      {/* Section 1 — Hero */}
      <View style={styles.section}>
        <View style={styles.eyebrowRow}>
          <View style={styles.eyebrowMaleWrap}>
            <Text style={styles.eyebrowText}>Real girls. Real dates.</Text>
          </View>
        </View>

        <Text style={styles.headline}>
          {'Book a date.\n'}
          <Text style={styles.headlineAccentMale}>She'll show up.</Text>
        </Text>

        <Text style={styles.heroBody}>
          Not virtual. Not Tinder. She'll actually be there.
        </Text>

        <View style={styles.heroCtas}>
          <View style={styles.ctaWrap}>
            <Button
              title="Find a Girl"
              variant="primary"
              onPress={() => router.push('/onboarding?roleHint=seeker')}
            />
          </View>
        </View>
      </View>

      {/* Section 2 — Profile horizontal scroll (moved before trust badges) */}
      <View style={[styles.section, { marginBottom: GAP }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.profileScroll}
          contentContainerStyle={styles.profileScrollContent}
        >
          {displayProfiles === null ? (
            // Skeleton cards
            [1, 2, 3, 4].map((i) => (
              <View key={i} style={styles.profileCardSkeleton} />
            ))
          ) : (
            displayProfiles.map((p) => (
              <TouchableOpacity
                key={p.id}
                style={styles.profileCard}
                onPress={() => p.isReal ? router.push(`/profile/${p.id}`) : router.push('/onboarding?roleHint=seeker')}
                accessibilityLabel={`View ${p.name}'s profile`}
                accessibilityRole="button"
              >
                {/* Photo or initial circle */}
                {p.photo ? (
                  <Image
                    source={{ uri: p.photo }}
                    style={styles.profileCardPhoto}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.profileCardPhoto, styles.profileCardPhotoPlaceholder, { backgroundColor: p.color + '20' }]}>
                    <Text style={[styles.profileCardInitial, { color: p.color }]}>
                      {p.initials}
                    </Text>
                  </View>
                )}
                {/* Info */}
                <View style={styles.profileCardInfo}>
                  <Text style={styles.profileCardName} numberOfLines={1}>{p.name}</Text>
                  <Text style={styles.profileCardRate}>${p.rate}/hr</Text>
                  {p.city ? (
                    <Text style={styles.profileCardCity} numberOfLines={1}>{p.city}</Text>
                  ) : null}
                  <TouchableOpacity
                    style={styles.profileCardBtn}
                    onPress={() => p.isReal ? router.push(`/profile/${p.id}`) : router.push('/onboarding?roleHint=seeker')}
                    accessibilityLabel={`View ${p.name}'s profile`}
                    accessibilityRole="button"
                  >
                    <Text style={styles.profileCardBtnText}>View Profile</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Last card: CTA */}
          <TouchableOpacity
            style={styles.profileCardCta}
            onPress={() => router.push('/onboarding?roleHint=seeker')}
            accessibilityLabel="See 200+ girls"
            accessibilityRole="button"
          >
            <Text style={styles.profileCardCtaText}>200+{'\n'}girls</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Section 3 — Trust badges */}
      <View style={[styles.section, { marginBottom: GAP }]}>
        <View style={styles.trustRow}>
          <TrustBadge text="Real people, not virtual" />
          <TrustBadge text="ID-Verified" />
          <TrustBadge text="Full Refund" />
          <TrustBadge text="Book in 2 min" />
        </View>
      </View>

      {/* Section 4 — Problem / Solution */}
      <View style={styles.section}>
        <View style={styles.compareGrid}>
          {/* Dating apps column */}
          <View style={[styles.compareCard, styles.compareCardBad]}>
            <Text style={styles.compareCardLabelSmall}>Other apps</Text>
            <ComparePoint text="Ghosting" bad />
            <ComparePoint text="Fake profiles" bad />
            <ComparePoint text="Weeks of texting" bad />
            <ComparePoint text="No accountability" bad />
          </View>

          {/* DateRabbit column */}
          <View style={[styles.compareCard, styles.compareCardGood]}>
            <Text style={[styles.compareCardLabelSmall, { color: colors.primary }]}>DateRabbit</Text>
            <ComparePoint text="She shows up" good />
            <ComparePoint text="ID-verified" good />
            <ComparePoint text="Book today" good />
            <ComparePoint text="Full refund" good />
          </View>
        </View>
      </View>

      {/* Section 5 — How it works */}
      <View style={styles.section}>
        <View style={styles.stepsGrid}>
          <StepCard num="01" title="Browse girls" body="" />
          <StepCard num="02" title="Book a date" body="" />
          <StepCard num="03" title="Show up" body="" />
        </View>
      </View>

      {/* Section 6 — CTA repeat */}
      <View style={styles.finalCta}>
        <Text style={styles.finalCtaTitle}>Real girls. Real dates.</Text>
        <View style={styles.ctaWrap}>
          <Button
            title="Find a Girl"
            variant="primary"
            onPress={() => router.push('/onboarding?roleHint=seeker')}
          />
        </View>
      </View>
    </>
  );
}

// ─────────────────────── Shared sub-components ───────────────────────

function StepCard({ num, title, body }: { num: string; title: string; body: string }) {
  return (
    <View style={styles.stepCard}>
      <Text style={styles.stepNum}>{num}</Text>
      <Text style={styles.stepTitle}>{title}</Text>
      {body ? <Text style={styles.stepBody}>{body}</Text> : null}
    </View>
  );
}

function SafetyItem({ icon, title, body }: { icon: IconName; title: string; body: string }) {
  return (
    <View style={styles.safetyCard}>
      <View style={styles.safetyCardIcon}>
        <Icon name={icon} size={20} color={colors.primary} />
      </View>
      <Text style={styles.safetyCardTitle}>{title}</Text>
      <Text style={styles.safetyCardBody}>{body}</Text>
    </View>
  );
}

function TrustBadge({ text }: { text: string }) {
  return (
    <View style={styles.trustBadge}>
      <Icon name="check" size={14} color={colors.success} />
      <Text style={styles.trustBadgeText}>{text}</Text>
    </View>
  );
}

function ComparePoint({ text, bad, good }: { text: string; bad?: boolean; good?: boolean }) {
  return (
    <View style={styles.comparePoint}>
      <Text style={bad ? styles.comparePointIconBad : styles.comparePointIconGood}>
        {bad ? '\u2715' : '\u2713'}
      </Text>
      <Text style={[styles.comparePointText, bad && styles.comparePointTextBad, good && styles.comparePointTextGood]}>
        {text}
      </Text>
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

  // SPLASH
  splash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: PAGE_PADDING,
  } as any,
  splashInner: {
    alignItems: 'center',
    maxWidth: 480,
    width: '100%',
  },
  splashLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl * 2,
  },
  splashLogoBox: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
  },
  splashLogoText: {
    fontFamily: typography.fonts.heading,
    fontSize: 24,
    color: colors.text,
  },
  splashQuestion: {
    fontFamily: typography.fonts.heading,
    fontSize: 32,
    color: colors.text,
    marginBottom: spacing.xl,
    letterSpacing: -0.5,
  },
  splashCards: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  splashCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 5, height: 5 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
  splashCardFemale: {
    backgroundColor: colors.primary,
  },
  splashCardMale: {
    backgroundColor: colors.text,
  },
  splashCardSymbol: {
    fontSize: 40,
    marginBottom: spacing.sm,
    color: colors.white,
  },
  splashCardTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 20,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  splashCardSub: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
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

  // GENDER TOGGLE
  genderToggle: {
    flexDirection: 'row',
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    ...NEO_SHADOW,
  },
  genderToggleBtn: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
  genderToggleBtnActive: {
    backgroundColor: colors.primary,
  },
  genderToggleBtnActiveMale: {
    backgroundColor: colors.text,
  },
  genderToggleText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
  genderToggleTextActive: {
    color: colors.white,
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

  // HERO
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
  eyebrowMaleWrap: {
    backgroundColor: colors.text,
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
  headlineAccentMale: {
    color: colors.text,
    fontFamily: typography.fonts.headingItalic,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
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

  // STEPS
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

  // SAFETY (female)
  safetyCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  safetyCard: {
    flex: 1,
    minWidth: 220,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...NEO_SHADOW,
  },
  safetyCardIcon: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  safetyCardTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  safetyCardBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },

  // EARNINGS BLOCK (female)
  earningsBlock: {
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
  earningsEyebrow: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    color: colors.primary,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },
  earningsTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: 28,
    color: colors.white,
    marginBottom: spacing.md,
    letterSpacing: -0.5,
  },
  earningsTitleLarge: {
    fontFamily: typography.fonts.heading,
    fontSize: 48,
    color: colors.primary,
    marginBottom: spacing.lg,
    letterSpacing: -1.5,
    textAlign: 'center',
  },
  earningsBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.white,
    opacity: 0.7,
    lineHeight: 26,
    marginBottom: spacing.xl,
    maxWidth: 540,
  },
  earningsStats: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  earningsStat: {
    flex: 1,
    minWidth: 140,
    alignItems: 'center',
  },
  earningsStatValue: {
    fontFamily: typography.fonts.heading,
    fontSize: 30,
    color: colors.primary,
    letterSpacing: -1,
    marginBottom: spacing.xs,
  },
  earningsStatLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.white,
    opacity: 0.6,
    textAlign: 'center',
  },
  earningsDivider: {
    width: 1,
    height: 60,
    backgroundColor: colors.white,
    opacity: 0.15,
  },

  // FINAL CTA (shared)
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
    fontSize: 36,
    color: colors.text,
    letterSpacing: -1,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  finalCtaBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.lg,
    maxWidth: 460,
  },

  // PROFILE SCROLL (male)
  profileScroll: {
    flexGrow: 0,
    marginHorizontal: -PAGE_PADDING,
  },
  profileScrollContent: {
    paddingHorizontal: PAGE_PADDING,
    gap: spacing.md,
    flexDirection: 'row',
  },
  profileCard: {
    width: 140,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...NEO_SHADOW,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
  profileCardPhoto: {
    width: 140,
    height: 170,
    backgroundColor: colors.borderLight,
  },
  profileCardPhotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundWarm,
  },
  profileCardInitial: {
    fontFamily: typography.fonts.heading,
    fontSize: 40,
    color: colors.textLight,
  },
  profileCardInfo: {
    padding: spacing.sm,
  },
  profileCardName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: 2,
  },
  profileCardRate: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    marginBottom: 2,
  },
  profileCardCity: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    marginBottom: spacing.sm,
  },
  profileCardBtn: {
    backgroundColor: colors.text,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 6,
    alignItems: 'center',
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
  profileCardBtnText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    color: colors.white,
  },
  profileCardSkeleton: {
    width: 140,
    height: 260,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.borderLight,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
  },
  profileCardEmpty: {
    width: 140,
    height: 260,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...NEO_SHADOW,
  },
  profileCardEmptyIcon: {
    marginBottom: spacing.sm,
  },
  profileCardEmptyText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  profileCardCta: {
    width: 140,
    height: 260,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    backgroundColor: colors.text,
    alignItems: 'center',
    justifyContent: 'center',
    ...NEO_SHADOW,
    ...(Platform.OS === 'web' ? { cursor: 'pointer' } : {}),
  } as any,
  profileCardCtaText: {
    fontFamily: typography.fonts.heading,
    fontSize: 20,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: -0.5,
  },

  // TRUST BADGES (male)
  trustRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  trustBadge: {
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
  trustBadgeText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },

  // COMPARE (male)
  compareGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  compareCard: {
    flex: 1,
    minWidth: 240,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...NEO_SHADOW,
  },
  compareCardBad: {
    backgroundColor: colors.surface,
  },
  compareCardGood: {
    backgroundColor: colors.text,
  },
  compareCardLabel: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
  compareCardLabelSmall: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  comparePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  comparePointIconBad: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: 13,
    color: colors.error,
    width: 16,
    textAlign: 'center',
  },
  comparePointIconGood: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: 13,
    color: colors.success,
    width: 16,
    textAlign: 'center',
  },
  comparePointText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  comparePointTextBad: {
    color: colors.textMuted,
  },
  comparePointTextGood: {
    color: colors.white,
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
