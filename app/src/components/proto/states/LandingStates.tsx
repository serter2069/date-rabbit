import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ===========================================================================
// STATE 1: DEFAULT — Full landing page
// ===========================================================================
function DefaultState() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={s.page}>
      {/* Hero */}
      <View style={s.hero}>
        <Image source={{ uri: 'https://picsum.photos/seed/luxury-dating-banner/800/200' }} style={{ width: '100%', height: 200, borderWidth: 2, borderColor: colors.border }} />
        <View style={s.heroContent}>
          <Text style={s.heroHeadline}>Real dates.{'\n'}Real connection.</Text>
          <Text style={s.heroSub}>
            Book a verified companion for an unforgettable evening
          </Text>
          <View style={s.heroCtas}>
            <Pressable style={[s.ctaPrimary, shadows.button]} onPress={() => router.push('/proto/states/auth-login')}>
              <Text style={s.ctaPrimaryText}>FIND A COMPANION</Text>
            </Pressable>
            <Pressable style={[s.ctaSecondary, shadows.button]} onPress={() => router.push('/proto/states/auth-welcome')}>
              <Text style={s.ctaSecondaryText}>BECOME A COMPANION</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Gender splash modal preview (inline) */}
      <View style={[s.card, shadows.md]}>
        <Text style={s.cardTitle}>Choose your preference</Text>
        <Text style={s.cardSub}>Who are you looking for?</Text>
        <View style={s.genderRow}>
          {(['Female companions', 'Male companions', 'Non-binary'] as const).map(label => (
            <Pressable key={label} style={[s.genderOption, shadows.sm]}>
              <Feather name="users" size={20} color={colors.primary} />
              <Text style={s.genderLabel}>{label}</Text>
              <Feather name="chevron-right" size={16} color={colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </View>

      {/* Stats row */}
      <View style={s.statsRow}>
        {[
          { value: '500+', label: 'Companions' },
          { value: '21+', label: 'Verified' },
          { value: '24/7', label: 'Safe & Discreet' },
        ].map(st => (
          <View key={st.label} style={s.statItem}>
            <Text style={s.statValue}>{st.value}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
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

      {/* Companion preview cards */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Featured companions</Text>
        <View style={s.companionRow}>
          {[
            { name: 'Sophia M.', city: 'New York', rating: '4.9' },
            { name: 'James K.', city: 'Los Angeles', rating: '4.8' },
          ].map(c => (
            <View key={c.name} style={[s.companionCard, shadows.sm]}>
              <Image source={{ uri: `https://picsum.photos/seed/${c.name === 'Sophia M.' ? 'jessica-comp' : 'ashley-comp'}/64/64` }} style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.border }} />
              <Text style={s.companionName}>{c.name}</Text>
              <View style={s.companionMeta}>
                <Text style={s.companionCity}>{c.city}</Text>
                <View style={s.ratingBadge}>
                  <Feather name="star" size={10} color={colors.primary} />
                  <Text style={s.ratingText}>{c.rating}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Trust badges */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Why DateRabbit?</Text>
        <View style={{ gap: 10 }}>
          {[
            { icon: 'shield', title: 'Verified IDs', desc: 'Every companion is identity-verified' },
            { icon: 'credit-card', title: 'Stripe Payments', desc: 'Secure escrow payments, no cash' },
            { icon: 'headphones', title: '24/7 Support', desc: 'Safety team available around the clock' },
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

      {/* Footer */}
      <View style={s.footer}>
        <Text style={s.footerBrand}>DateRabbit</Text>
        <View style={s.footerLinks}>
          {['Terms of Service', 'Privacy Policy', 'Safety Guidelines'].map(link => (
            <Pressable key={link}>
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
// STATE 2: LOGGED_IN_REDIRECT
// ===========================================================================
function LoggedInRedirectState() {
  return (
    <View style={s.page}>
      <View style={[s.card, shadows.md, { alignItems: 'center' as const }]}>
        <View style={s.welcomeAvatar}>
          <Image source={{ uri: 'https://picsum.photos/seed/companion-profile/80/80' }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.border }} />
        </View>
        <Text style={s.welcomeTitle}>Welcome back, Alex!</Text>
        <Text style={s.welcomeSub}>You are already signed in</Text>

        <View style={{ gap: 12, width: '100%', marginTop: 16 }}>
          <Pressable style={[s.ctaPrimary, shadows.button]}>
            <Text style={s.ctaPrimaryText}>GO TO BROWSE</Text>
            <Feather name="arrow-right" size={16} color={colors.textInverse} />
          </Pressable>
          <Pressable style={[s.ctaSecondary, shadows.button]}>
            <Text style={s.ctaSecondaryText}>GO TO DASHBOARD</Text>
            <Feather name="arrow-right" size={16} color={colors.text} />
          </Pressable>
        </View>

        <View style={s.roleBadgeRow}>
          <View style={[s.roleBadge, { backgroundColor: colors.badge.pink.bg }]}>
            <Text style={[s.roleBadgeText, { color: colors.badge.pink.text }]}>CLIENT</Text>
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
        <Pressable style={[s.ctaPrimary, shadows.button, { marginTop: 12 }]} onPress={() => router.push('/proto/states/auth-login')}>
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
        <Pressable style={[s.ctaPrimary, shadows.button, { marginTop: 8 }]} onPress={() => router.push('/proto/states/auth-login')}>
          <Text style={s.ctaPrimaryText}>CONTINUE</Text>
        </Pressable>
      </View>

      {/* Footer compact */}
      <View style={[s.footer, { paddingVertical: 16 }]}>
        <Text style={s.footerBrand}>DateRabbit</Text>
        <View style={s.footerLinks}>
          {['Terms', 'Privacy', 'Safety'].map(link => (
            <Pressable key={link}>
              <Text style={s.footerLink}>{link}</Text>
            </Pressable>
          ))}
        </View>
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
      <StateSection title="DEFAULT" description="Full landing page for DateRabbit">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>

      <StateSection title="LOGGED_IN_REDIRECT" description="User already signed in, role-based redirect">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <LoggedInRedirectState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>

      <StateSection title="MOBILE_WEB" description="Single-column compact layout (max 430px)">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <MobileWebState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16, width: '100%' },
  page: { gap: 16 },

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

  // Gender
  genderRow: { gap: 8 },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  genderLabel: { ...typography.bodyMedium, color: colors.text, flex: 1 },

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
  sectionTitle: { ...typography.h2, color: colors.text },

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

  // Companions
  companionRow: { flexDirection: 'row', gap: 12 },
  companionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
    alignItems: 'center',
    gap: 8,
  },
  companionName: { ...typography.bodyMedium, color: colors.text },
  companionMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  companionCity: { ...typography.caption, color: colors.textMuted },
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
  },
  footerBrand: { ...typography.h3, color: colors.text },
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
});
