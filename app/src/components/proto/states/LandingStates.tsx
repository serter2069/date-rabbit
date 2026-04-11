import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader } from '../NavComponents';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// Mock companion data for gallery
const MOCK_COMPANIONS = [
  { name: 'Sophia M.', city: 'New York', rating: '4.9', price: 120, seed: 'sophia-date' },
  { name: 'Emma L.', city: 'Miami', rating: '5.0', price: 150, seed: 'emma-date' },
  { name: 'Olivia R.', city: 'Los Angeles', rating: '4.8', price: 100, seed: 'olivia-date' },
  { name: 'Isabella K.', city: 'Chicago', rating: '4.7', price: 90, seed: 'isabella-date' },
  { name: 'Mia J.', city: 'San Francisco', rating: '4.9', price: 130, seed: 'mia-date' },
  { name: 'Ava T.', city: 'Las Vegas', rating: '4.6', price: 110, seed: 'ava-date' },
  { name: 'Charlotte W.', city: 'Seattle', rating: '4.8', price: 95, seed: 'charlotte-date' },
  { name: 'Amelia P.', city: 'Boston', rating: '4.9', price: 140, seed: 'amelia-date' },
  { name: 'Harper D.', city: 'Austin', rating: '4.7', price: 85, seed: 'harper-date' },
  { name: 'Evelyn S.', city: 'Denver', rating: '4.8', price: 105, seed: 'evelyn-date' },
];

// ===========================================================================
// PageShell — wraps each state with header/footer for full-page appearance
// ===========================================================================
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="guest" onLogoPress={() => {}} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        {children}
      </ScrollView>
      <View style={s.footer}>
        <Text style={s.footerBrand}>DateRabbit</Text>
        <View style={s.footerLinks}>
          {['Terms of Service', 'Privacy Policy', 'Safety Guidelines'].map(link => (
            <Pressable key={link} onPress={() => {}}>
              <Text style={s.footerLink}>{link}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={s.footerCopy}>2026 DateRabbit Inc. All rights reserved.</Text>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 1: DEFAULT — Full landing page (Male/Seeker view, UC-L04)
// ===========================================================================
function DefaultState() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGender, setActiveGender] = useState<'seeker' | 'companion'>('seeker');

  return (
    <View style={s.page}>
      {/* Gender switcher pill (UC-L02) */}
      <View style={s.genderSwitcherRow}>
        <Pressable
          style={[s.genderPill, activeGender === 'seeker' ? s.genderPillActive : s.genderPillInactive]}
          onPress={() => setActiveGender('seeker')}
        >
          <Feather name="search" size={14} color={activeGender === 'seeker' ? colors.textInverse : colors.textMuted} />
          <Text style={activeGender === 'seeker' ? s.genderPillTextActive : s.genderPillTextInactive}>Find a companion</Text>
        </Pressable>
        <Pressable
          style={[s.genderPill, activeGender === 'companion' ? s.genderPillActive : s.genderPillInactive]}
          onPress={() => setActiveGender('companion')}
        >
          <Feather name="dollar-sign" size={14} color={activeGender === 'companion' ? colors.textInverse : colors.textMuted} />
          <Text style={activeGender === 'companion' ? s.genderPillTextActive : s.genderPillTextInactive}>Become a companion</Text>
        </Pressable>
      </View>

      {/* Hero */}
      <View style={s.hero}>
        <Image source={{ uri: 'https://picsum.photos/seed/luxury-dating-banner/800/200' }} style={{ width: '100%', height: 200, borderWidth: 2, borderColor: colors.border }} />
        <View style={s.heroContent}>
          <Text style={s.heroHeadline}>Pick a woman.{'\n'}Book a date.{'\n'}Show up.</Text>
          <Text style={s.heroSub}>
            Real offline dates. Not virtual. Verified companions. Full refund if she doesn't show up.
          </Text>
          <View style={s.heroCtas}>
            <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-welcome')}>
              <Text style={s.ctaPrimaryText}>FIND A COMPANION</Text>
            </Pressable>
            <Pressable style={[s.ctaSecondary, shadows.button]} onPress={() => router.push('/proto/states/auth-welcome')}>
              <Text style={s.ctaSecondaryText}>BECOME A COMPANION</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        {[
          { value: '500+', label: 'Companions' },
          { value: '21+', label: 'Age Verified' },
          { value: '24/7', label: 'Safe & Discreet' },
        ].map(st => (
          <View key={st.label} style={s.statItem}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Featured companions horizontal gallery (UC-L04: 10+ cards) */}
      <View style={s.section}>
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Featured companions</Text>
          <Pressable onPress={() => router.push('/proto/states/seeker-home')}>
            <Text style={s.viewAllLink}>View all</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.companionScroll}>
          {MOCK_COMPANIONS.map(c => (
            <View key={c.name} style={[s.companionCard, shadows.sm]}>
              <Image source={{ uri: `https://picsum.photos/seed/${c.seed}/200/280` }} style={s.companionPhoto} />
              <View style={s.companionInfo}>
                <Text style={s.companionName}>{c.name}</Text>
                <View style={s.companionMeta}>
                  <Feather name="map-pin" size={10} color={colors.textMuted} />
                  <Text style={s.companionCity}>{c.city}</Text>
                </View>
                <View style={s.companionBottom}>
                  <View style={s.ratingBadge}>
                    <Feather name="star" size={10} color={colors.primary} />
                    <Text style={s.ratingText}>{c.rating}</Text>
                  </View>
                  <Text style={s.companionPrice}>${c.price}/hr</Text>
                </View>
              </View>
            </View>
          ))}
          {/* View all card at end */}
          <Pressable style={[s.viewAllCard, shadows.sm]} onPress={() => router.push('/proto/states/seeker-home')}>
            <Feather name="arrow-right" size={24} color={colors.primary} />
            <Text style={s.viewAllCardText}>View 200+{'\n'}women</Text>
          </Pressable>
        </ScrollView>
      </View>

      {/* How it works */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>How it works</Text>
        {[
          { step: '1', icon: 'search', title: 'Browse', desc: 'Search verified companions by location, interests, and availability' },
          { step: '2', icon: 'calendar', title: 'Book', desc: 'Choose your date, time, and activity. Secure payment via Stripe' },
          { step: '3', icon: 'star', title: 'Meet', desc: 'Enjoy a genuine, unforgettable experience with your companion' },
        ].map(item => (
          <View key={item.step} style={[s.stepCard, shadows.sm]}>
            <View style={s.stepBadge}>
              <Text style={s.stepBadgeText}>{item.step}</Text>
            </View>
            <View style={s.stepContent}>
              <View style={s.stepHeader}>
                <Feather name={item.icon as any} size={18} color={colors.primary} />
                <Text style={s.stepTitle}>{item.title}</Text>
              </View>
              <Text style={s.stepDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Trust / Feature badges (UC-L04) */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Why DateRabbit?</Text>
        <View style={{ gap: 10 }}>
          {[
            { icon: 'shield', title: 'No swiping. No ghosting.', desc: 'Book directly. Real dates, not endless chats.' },
            { icon: 'credit-card', title: 'Transparent pricing', desc: 'See the rate upfront. No surprises. Secure Stripe payments.' },
            { icon: 'check-circle', title: 'ID-verified companions', desc: 'Every companion is age-verified via Stripe Identity.' },
            { icon: 'refresh-cw', title: 'Full refund guarantee', desc: "If she doesn't show up, you get a full refund. No questions." },
            { icon: 'clock', title: 'Book in minutes', desc: 'Pick a companion, choose date/time, pay. Done.' },
            { icon: 'headphones', title: '24/7 Support', desc: 'Safety team available around the clock.' },
          ].map(t => (
            <View key={t.title} style={[s.trustRow, shadows.sm]}>
              <View style={s.trustIcon}>
                <Feather name={t.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.trustTitle}>{t.title}</Text>
                <Text style={s.trustDesc}>{t.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Search bar */}
      <View style={s.section}>
        <View style={[s.searchBar, shadows.sm]}>
          <Feather name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search by city or name..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 2: LOGGED_IN_REDIRECT
// ===========================================================================
function LoggedInRedirectState() {
  return (
    <View style={[s.page, { justifyContent: 'center', flex: 1 }]}>
      <View style={[s.card, shadows.md, { alignItems: 'center' as const }]}>
        <View style={s.welcomeAvatar}>
          <Image source={{ uri: 'https://picsum.photos/seed/alex-seeker/80/80' }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.border }} />
        </View>
        <Text style={s.welcomeTitle}>Welcome back, Alex!</Text>
        <Text style={s.welcomeSub}>You are already signed in</Text>

        <View style={{ gap: 12, width: '100%', marginTop: 16 }}>
          <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/seeker-home')}>
            <Text style={s.ctaPrimaryText}>GO TO BROWSE</Text>
            <Feather name="arrow-right" size={16} color={colors.textInverse} />
          </Pressable>
          <Pressable style={[s.ctaSecondary, shadows.button]} onPress={() => router.push('/proto/states/seeker-profile')}>
            <Text style={s.ctaSecondaryText}>GO TO DASHBOARD</Text>
            <Feather name="arrow-right" size={16} color={colors.text} />
          </Pressable>
        </View>

        <View style={s.roleBadgeRow}>
          <View style={[s.roleBadge, { backgroundColor: colors.badge.pink.bg }]}>
            <Text style={[s.roleBadgeText, { color: colors.badge.pink.text }]}>SEEKER</Text>
          </View>
          <View style={[s.roleBadge, { backgroundColor: colors.badge.success.bg }]}>
            <Feather name="check-circle" size={12} color={colors.success} />
            <Text style={[s.roleBadgeText, { color: colors.success }]}>VERIFIED</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 3: MOBILE_WEB — single-column compact
// ===========================================================================
function MobileWebState() {
  const [email, setEmail] = useState('');

  return (
    <View style={s.page}>
      {/* Compact hero */}
      <View style={s.mobileHero}>
        <Text style={s.mobileHeadline}>Real dates.{'\n'}Real connection.</Text>
        <Text style={s.mobileSub}>
          Book a verified companion for an unforgettable evening
        </Text>
        <Pressable style={[s.ctaPrimary, shadows.button, { marginTop: 12 }]} onPress={() => router.push('/proto/states/auth-welcome')}>
          <Text style={s.ctaPrimaryText}>FIND A COMPANION</Text>
        </Pressable>
        <Pressable style={[s.ctaSecondary, shadows.sm, { marginTop: 8 }]} onPress={() => router.push('/proto/states/auth-welcome')}>
          <Text style={s.ctaSecondaryText}>BECOME A COMPANION</Text>
        </Pressable>
      </View>

      {/* Mobile stats */}
      <View style={s.mobileStatsRow}>
        {[
          { value: '500+', label: 'Companions' },
          { value: '21+', label: 'Verified' },
          { value: '24/7', label: 'Support' },
        ].map(st => (
          <View key={st.label} style={s.mobileStatItem}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </View>

      {/* Steps stacked */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>How it works</Text>
        {[
          { num: '1', title: 'Browse', icon: 'eye' },
          { num: '2', title: 'Book', icon: 'calendar' },
          { num: '3', title: 'Meet', icon: 'star' },
        ].map(step => (
          <View key={step.num} style={[s.mobileStep, shadows.sm]}>
            <View style={s.stepBadge}>
              <Text style={s.stepBadgeText}>{step.num}</Text>
            </View>
            <Feather name={step.icon as any} size={18} color={colors.primary} />
            <Text style={s.mobileStepTitle}>{step.title}</Text>
            <Feather name="chevron-right" size={16} color={colors.textLight} />
          </View>
        ))}
      </View>

      {/* Trust compact */}
      <View style={s.section}>
        <View style={s.trustCompactRow}>
          <View style={s.trustCompactItem}>
            <Feather name="shield" size={16} color={colors.primary} />
            <Text style={s.trustCompactText}>Verified IDs</Text>
          </View>
          <View style={s.trustCompactItem}>
            <Feather name="credit-card" size={16} color={colors.primary} />
            <Text style={s.trustCompactText}>Stripe Pay</Text>
          </View>
          <View style={s.trustCompactItem}>
            <Feather name="headphones" size={16} color={colors.primary} />
            <Text style={s.trustCompactText}>24/7 Help</Text>
          </View>
        </View>
      </View>

      {/* Email CTA */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.cardTitle}>Get started</Text>
        <TextInput
          style={s.emailInput}
          placeholder="your@email.com"
          placeholderTextColor={colors.textLight}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Pressable style={[s.ctaPrimary, shadows.button, { marginTop: 8 }]} onPress={() => router.push('/proto/states/auth-welcome')}>
          <Text style={s.ctaPrimaryText}>CONTINUE</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 4: GENDER_SPLASH — Full-screen gender selection overlay (UC-L01)
// ===========================================================================
function GenderSplashState() {
  const [selectedGender, setSelectedGender] = useState<string | null>(null);

  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background, position: 'relative' }}>
      {/* Background content (landing visible behind) */}
      <View style={{ padding: 20, opacity: 0.3 }}>
        <Text style={s.heroHeadline}>Real dates.{'\n'}Real connection.</Text>
        <Text style={s.heroSub}>Book a verified companion for an unforgettable evening</Text>
      </View>

      {/* Full-screen gender splash overlay (UC-L01) */}
      <View style={s.splashOverlay}>
        <View style={[s.splashCard, shadows.xl]}>
          <Text style={s.splashTitle}>Welcome to DateRabbit</Text>
          <Text style={s.splashSub}>Who are you looking for?</Text>

          <View style={s.splashOptions}>
            <Pressable
              style={[s.splashOption, selectedGender === 'female' && s.splashOptionSelected, shadows.md]}
              onPress={() => setSelectedGender('female')}
            >
              <View style={[s.splashIconCircle, { backgroundColor: colors.badge.pink.bg }]}>
                <Feather name="user" size={28} color={colors.primary} />
              </View>
              <Text style={s.splashOptionTitle}>Female companions</Text>
              <Text style={s.splashOptionDesc}>Browse women for real dates</Text>
              {selectedGender === 'female' && (
                <View style={s.splashCheck}>
                  <Feather name="check" size={14} color={colors.textInverse} />
                </View>
              )}
            </Pressable>

            <Pressable
              style={[s.splashOption, selectedGender === 'male' && s.splashOptionSelected, shadows.md]}
              onPress={() => setSelectedGender('male')}
            >
              <View style={[s.splashIconCircle, { backgroundColor: colors.accentLight }]}>
                <Feather name="user" size={28} color={colors.accentDark} />
              </View>
              <Text style={s.splashOptionTitle}>Male companions</Text>
              <Text style={s.splashOptionDesc}>Browse men for real dates</Text>
              {selectedGender === 'male' && (
                <View style={s.splashCheck}>
                  <Feather name="check" size={14} color={colors.textInverse} />
                </View>
              )}
            </Pressable>
          </View>

          <Pressable
            style={[s.ctaPrimary, shadows.button, { marginTop: 24, opacity: selectedGender ? 1 : 0.5 }]}
            onPress={() => selectedGender && router.push('/proto/states/auth-welcome')}
            disabled={!selectedGender}
          >
            <Text style={s.ctaPrimaryText}>CONTINUE</Text>
            <Feather name="arrow-right" size={16} color={colors.textInverse} />
          </Pressable>

          <Text style={s.splashNote}>This helps us personalize your experience</Text>
        </View>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 5: FEMALE_VARIANT — Companion-focused landing (UC-L03)
// ===========================================================================
function FemaleVariantState() {
  const [hourlyRate, setHourlyRate] = useState('');

  return (
    <View style={s.page}>
      {/* Gender switcher pill (UC-L02) */}
      <View style={s.genderSwitcherRow}>
        <Pressable style={[s.genderPill, s.genderPillInactive]}>
          <Feather name="search" size={14} color={colors.textMuted} />
          <Text style={s.genderPillTextInactive}>Find a companion</Text>
        </Pressable>
        <Pressable style={[s.genderPill, s.genderPillActive]}>
          <Feather name="dollar-sign" size={14} color={colors.textInverse} />
          <Text style={s.genderPillTextActive}>Become a companion</Text>
        </Pressable>
      </View>

      {/* Hero - Companion focus */}
      <View style={s.hero}>
        <Image source={{ uri: 'https://picsum.photos/seed/companion-earn-banner/800/200' }} style={{ width: '100%', height: 200, borderWidth: 2, borderColor: colors.border }} />
        <View style={s.heroContent}>
          <Text style={s.heroHeadline}>Go on a date.{'\n'}Get paid.</Text>
          <Text style={s.heroSub}>
            Earn on your terms. Set your price, control your schedule. Same-day Stripe payouts.
          </Text>
          <View style={s.heroCtas}>
            <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-welcome')}>
              <Text style={s.ctaPrimaryText}>START EARNING</Text>
            </Pressable>
            <Pressable style={[s.ctaSecondary, shadows.button]} onPress={() => router.push('/proto/states/auth-welcome')}>
              <Text style={s.ctaSecondaryText}>FIND A COMPANION</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Earnings calculator */}
      <View style={[s.card, shadows.md]}>
        <Text style={s.cardTitle}>Calculate your earnings</Text>
        <Text style={s.cardSub}>See how much you can earn per week</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <Text style={{ ...typography.body, color: colors.text }}>$</Text>
          <TextInput
            style={[s.emailInput, { flex: 1 }]}
            placeholder="Your hourly rate"
            placeholderTextColor={colors.textLight}
            value={hourlyRate}
            onChangeText={setHourlyRate}
            keyboardType="numeric"
          />
          <Text style={{ ...typography.bodySmall, color: colors.textMuted }}>/hour</Text>
        </View>
        {hourlyRate ? (
          <View style={{ backgroundColor: colors.badge.pink.bg, padding: 12, borderRadius: borderRadius.sm, borderWidth: 2, borderColor: colors.border }}>
            <Text style={{ ...typography.h3, color: colors.primary }}>
              ~${parseInt(hourlyRate) * 20 * 4}/month
            </Text>
            <Text style={{ ...typography.caption, color: colors.textMuted }}>
              Based on 20 hours/week, 4 weeks/month
            </Text>
          </View>
        ) : (
          <Text style={{ ...typography.bodySmall, color: colors.textLight }}>
            Enter your rate to see estimated monthly earnings
          </Text>
        )}
      </View>

      {/* How it works for companions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>How it works</Text>
        {[
          { step: '1', icon: 'dollar-sign', title: 'Set your rate', desc: 'You decide your hourly rate. Change it anytime.' },
          { step: '2', icon: 'calendar', title: 'Choose your schedule', desc: 'Accept or decline any date. Full control.' },
          { step: '3', icon: 'credit-card', title: 'Get paid same day', desc: 'Stripe Connect Express. Money in your account within hours.' },
        ].map(item => (
          <View key={item.step} style={[s.stepCard, shadows.sm]}>
            <View style={s.stepBadge}>
              <Text style={s.stepBadgeText}>{item.step}</Text>
            </View>
            <View style={s.stepContent}>
              <View style={s.stepHeader}>
                <Feather name={item.icon as any} size={18} color={colors.primary} />
                <Text style={s.stepTitle}>{item.title}</Text>
              </View>
              <Text style={s.stepDesc}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Trust badges for companions */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Why companions choose DateRabbit</Text>
        <View style={{ gap: 10 }}>
          {[
            { icon: 'shield', title: 'Safety first', desc: 'All seekers are ID-verified and fingerprint-checked.' },
            { icon: 'credit-card', title: 'Same-day payouts', desc: 'Stripe Connect Express. No waiting for checks.' },
            { icon: 'lock', title: 'Full privacy control', desc: 'Hide your profile anytime. Block any user.' },
            { icon: 'x-circle', title: 'Decline anytime', desc: 'No obligations. You choose who to meet.' },
            { icon: 'headphones', title: '24/7 Support', desc: 'Dedicated safety team. Emergency line available.' },
          ].map(t => (
            <View key={t.title} style={[s.trustRow, shadows.sm]}>
              <View style={s.trustIcon}>
                <Feather name={t.icon as any} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.trustTitle}>{t.title}</Text>
                <Text style={s.trustDesc}>{t.desc}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Testimonials */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>What companions say</Text>
        {[
          { name: 'Sarah K.', city: 'New York', text: 'I set my own schedule and earn $3,000+ per month. Best decision I made.', seed: 'sarah-testimonial' },
          { name: 'Mia L.', city: 'Los Angeles', text: 'The safety features give me peace of mind. Every seeker is background-checked.', seed: 'mia-testimonial' },
        ].map(t => (
          <View key={t.name} style={[s.card, shadows.sm]}>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 8 }}>
              <Image source={{ uri: `https://picsum.photos/seed/${t.seed}/48/48` }} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: colors.border }} />
              <View>
                <Text style={{ ...typography.bodyMedium, color: colors.text }}>{t.name}</Text>
                <Text style={{ ...typography.caption, color: colors.textMuted }}>{t.city}</Text>
              </View>
            </View>
            <Text style={{ ...typography.body, color: colors.textSecondary, fontStyle: 'italic' }}>"{t.text}"</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function LandingStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Full landing page — Seeker/Male view (UC-L04)">
        <PageShell>
          <DefaultState />
        </PageShell>
      </StateSection>

      <StateSection title="FEMALE_VARIANT" description="Companion-focused landing — Women view (UC-L03)">
        <PageShell>
          <FemaleVariantState />
        </PageShell>
      </StateSection>

      <StateSection title="GENDER_SPLASH" description="First-visit gender selection overlay (UC-L01)">
        <GenderSplashState />
      </StateSection>

      <StateSection title="LOGGED_IN_REDIRECT" description="User already signed in, role-based redirect">
        <PageShell>
          <LoggedInRedirectState />
        </PageShell>
      </StateSection>

      <StateSection title="MOBILE_WEB" description="Single-column compact layout (max 430px)">
        <PageShell>
          <MobileWebState />
        </PageShell>
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16, width: '100%' },
  page: { gap: 16, paddingHorizontal: 16 },

  // Hero
  hero: { gap: 0 },
  heroContent: { padding: 16, gap: 8 },
  heroHeadline: {
    ...typography.h1,
    color: colors.text,
  },
  heroSub: {
    ...typography.body,
    color: colors.textSecondary,
  },
  heroCtas: { gap: 10, marginTop: 8 },

  // CTAs
  ctaPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ctaPrimaryText: { ...typography.button, color: colors.textInverse },
  ctaSecondary: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  ctaSecondaryText: { ...typography.button, color: colors.text },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
  },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: 4 },
  cardSub: { ...typography.bodySmall, color: colors.textMuted, marginBottom: 12 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    backgroundColor: colors.text,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  statItem: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statValue: { ...typography.h2, color: colors.textInverse },
  statLabel: { ...typography.caption, color: colors.textLight },

  // Section
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.h2, color: colors.text },
  viewAllLink: { ...typography.bodyMedium, color: colors.primary },

  // Companion scroll
  companionScroll: { paddingHorizontal: 4, gap: 12 },
  companionCard: {
    width: 160,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  companionPhoto: {
    width: 160,
    height: 200,
    borderBottomWidth: borderWidth.normal,
    borderBottomColor: colors.border,
  },
  companionInfo: { padding: 10, gap: 4 },
  companionName: { ...typography.bodyMedium, color: colors.text },
  companionMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  companionCity: { ...typography.caption, color: colors.textMuted },
  companionBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  companionPrice: { ...typography.caption, color: colors.success, fontWeight: '700' },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.badge.pink.bg,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ratingText: { ...typography.caption, color: colors.primary, fontSize: 10 },
  viewAllCard: {
    width: 120,
    backgroundColor: colors.backgroundWarm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
  },
  viewAllCardText: { ...typography.bodyMedium, color: colors.primary, textAlign: 'center' },

  // Steps
  stepCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 14,
    gap: 12,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: { ...typography.caption, color: colors.textInverse, fontWeight: '700' },
  stepContent: { flex: 1 },
  stepHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 },
  stepTitle: { ...typography.h3, color: colors.text },
  stepDesc: { ...typography.bodySmall, color: colors.textSecondary },

  // Trust
  trustRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 14,
  },
  trustIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.badge.pink.bg,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustTitle: { ...typography.bodyMedium, color: colors.text },
  trustDesc: { ...typography.bodySmall, color: colors.textMuted },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { ...typography.body, flex: 1, color: colors.text },

  // Footer
  footer: {
    borderTopWidth: 2,
    borderTopColor: colors.border,
    paddingVertical: 24,
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
  },
  footerBrand: { ...typography.h3, color: colors.primary },
  footerLinks: { flexDirection: 'row', gap: 16 },
  footerLink: { ...typography.caption, color: colors.textMuted, textDecorationLine: 'underline' },
  footerCopy: { ...typography.caption, color: colors.textLight, fontSize: 10 },

  // Welcome / Logged in redirect
  welcomeAvatar: { marginBottom: 12 },
  welcomeTitle: { ...typography.h2, color: colors.text, marginBottom: 4 },
  welcomeSub: { ...typography.body, color: colors.textMuted, marginBottom: 8 },
  roleBadgeRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleBadgeText: { ...typography.label, fontSize: 10 },

  // Mobile
  mobileHero: { padding: 16, gap: 4 },
  mobileHeadline: { ...typography.h2, color: colors.text },
  mobileSub: { ...typography.bodySmall, color: colors.textSecondary },
  mobileStatsRow: {
    flexDirection: 'row',
    backgroundColor: colors.text,
    borderRadius: borderRadius.sm,
  },
  mobileStatItem: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  mobileStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  mobileStepTitle: { ...typography.bodyMedium, color: colors.text, flex: 1 },
  trustCompactRow: { flexDirection: 'row', gap: 8 },
  trustCompactItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
  },
  trustCompactText: { ...typography.caption, color: colors.text, textAlign: 'center', fontSize: 10 },

  // Email input
  emailInput: {
    ...typography.body,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },

  // Gender splash overlay (UC-L01)
  splashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  splashCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    padding: 32,
    width: '100%',
    maxWidth: 440,
    alignItems: 'center',
  },
  splashTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 4,
  },
  splashSub: {
    ...typography.body,
    color: colors.textMuted,
    marginBottom: 24,
  },
  splashOptions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  splashOption: {
    flex: 1,
    backgroundColor: colors.background,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
    alignItems: 'center',
    gap: 8,
  },
  splashOptionSelected: {
    backgroundColor: colors.badge.pink.bg,
    borderColor: colors.primary,
  },
  splashIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  splashOptionTitle: {
    ...typography.bodyMedium,
    color: colors.text,
    textAlign: 'center',
  },
  splashOptionDesc: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
  },
  splashCheck: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashNote: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 16,
  },

  // Gender switcher pills (UC-L02)
  genderSwitcherRow: {
    flexDirection: 'row',
    backgroundColor: colors.backgroundWarm,
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    padding: 3,
    marginBottom: 16,
  },
  genderPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: borderRadius.full,
  },
  genderPillActive: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
  },
  genderPillInactive: {
    backgroundColor: 'transparent',
  },
  genderPillTextActive: {
    ...typography.caption,
    color: colors.textInverse,
    fontWeight: '700',
  },
  genderPillTextInactive: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
