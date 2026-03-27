import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  colors,
  spacing,
  borderRadius,
  borderWidth,
  typography,
  shadows,
  brutalist,
  PAGE_PADDING,
} from '../../src/constants/theme';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { Card } from '../../src/components/Card';
import { Badge } from '../../src/components/Badge';
import { Avatar } from '../../src/components/Avatar';
import { Icon, type IconName } from '../../src/components/Icon';

// ---------------------------------------------------------------------------
// Section header with neo-brutalist underline
// ---------------------------------------------------------------------------
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={sectionStyles.header}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.underline} />
      {subtitle && <Text style={sectionStyles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  header: {
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.5,
  },
  underline: {
    height: 4,
    width: 48,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginTop: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: spacing.sm,
  },
});

// ---------------------------------------------------------------------------
// Color swatch
// ---------------------------------------------------------------------------
function ColorSwatch({ name, hex }: { name: string; hex: string }) {
  const isDark = hex === '#000000' || hex === '#333333' || hex === '#666666';
  return (
    <View style={swatchStyles.container}>
      <View
        style={[
          swatchStyles.swatch,
          {
            backgroundColor: hex,
            borderColor: colors.black,
          },
        ]}
      >
        <Text style={[swatchStyles.hexOnSwatch, isDark && { color: colors.white }]}>
          {hex}
        </Text>
      </View>
      <Text style={swatchStyles.name}>{name}</Text>
    </View>
  );
}

const swatchStyles = StyleSheet.create({
  container: {
    width: '30%',
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  swatch: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hexOnSwatch: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: 10,
    color: colors.text,
    fontWeight: '500',
  },
  name: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

// ---------------------------------------------------------------------------
// Brand page
// ---------------------------------------------------------------------------
export default function BrandScreen() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState('');

  // All icon names for the grid
  const iconNames: IconName[] = [
    'search', 'settings', 'map-pin', 'star', 'heart', 'message',
    'calendar', 'clock', 'user', 'chevron-left', 'chevron-right', 'x',
    'check', 'plus', 'home', 'users', 'bookmark', 'camera',
    'image', 'send', 'filter', 'coffee', 'utensils', 'wine',
    'music', 'sparkles', 'shield', 'credit-card', 'help', 'alert',
    'check-circle', 'x-circle', 'info', 'zap', 'globe', 'phone',
    'mail', 'lock', 'eye', 'eye-off', 'edit', 'trash',
    'share', 'download', 'upload', 'refresh', 'arrow-left', 'arrow-right',
    'bell', 'volume', 'mic', 'video', 'more-vertical', 'menu',
    'grid', 'list', 'log-out', 'user-plus', 'rabbit', 'sliders',
    'navigation', 'receipt', 'cake', 'file-text', 'film', 'palette',
    'footprints', 'party-popper', 'theater',
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ====== BACK NAV ====== */}
        <Pressable
          onPress={() => router.canGoBack() ? router.back() : router.replace('/')}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={20} color={colors.text} />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        {/* ====== HEADER ====== */}
        <View style={styles.headerContainer}>
          <View style={styles.logoRow}>
            <View style={styles.logoBadge}>
              <Icon name="rabbit" size={32} color={colors.white} />
            </View>
            <View>
              <Text style={styles.brandName}>DateRabbit</Text>
              <Text style={styles.brandTagline}>Brand Style Guide</Text>
            </View>
          </View>
          <Text style={styles.headerDescription}>
            Neo-brutalism design system. Bold borders, offset shadows, vivid colors,
            Space Grotesk typography.
          </Text>
        </View>

        {/* ====== 1. COLORS ====== */}
        <SectionHeader
          title="Colors"
          subtitle="Neo-brutalism palette — warm beige base, bold accents"
        />

        <Text style={styles.subsectionTitle}>Primary & Accent</Text>
        <View style={styles.swatchGrid}>
          <ColorSwatch name="primary" hex={colors.primary} />
          <ColorSwatch name="primaryDark" hex={colors.primaryDark} />
          <ColorSwatch name="primaryLight" hex={colors.primaryLight} />
          <ColorSwatch name="accent" hex={colors.accent} />
          <ColorSwatch name="accentDark" hex={colors.accentDark} />
          <ColorSwatch name="accentLight" hex={colors.accentLight} />
        </View>

        <Text style={styles.subsectionTitle}>Backgrounds & Surfaces</Text>
        <View style={styles.swatchGrid}>
          <ColorSwatch name="background" hex={colors.background} />
          <ColorSwatch name="backgroundWarm" hex={colors.backgroundWarm} />
          <ColorSwatch name="surface" hex={colors.surface} />
        </View>

        <Text style={styles.subsectionTitle}>Text Hierarchy</Text>
        <View style={styles.swatchGrid}>
          <ColorSwatch name="text" hex={colors.text} />
          <ColorSwatch name="textSecondary" hex={colors.textSecondary} />
          <ColorSwatch name="textMuted" hex={colors.textMuted} />
          <ColorSwatch name="textLight" hex={colors.textLight} />
          <ColorSwatch name="textInverse" hex={colors.textInverse} />
        </View>

        <Text style={styles.subsectionTitle}>Semantic</Text>
        <View style={styles.swatchGrid}>
          <ColorSwatch name="success" hex={colors.success} />
          <ColorSwatch name="warning" hex={colors.warning} />
          <ColorSwatch name="error" hex={colors.error} />
          <ColorSwatch name="info" hex={colors.info} />
        </View>

        <Text style={styles.subsectionTitle}>Brutalist Accents</Text>
        <View style={styles.swatchGrid}>
          <ColorSwatch name="cyan" hex={brutalist.cyan} />
          <ColorSwatch name="pink" hex={brutalist.pink} />
          <ColorSwatch name="black" hex={brutalist.black} />
          <ColorSwatch name="beige" hex={brutalist.beige} />
        </View>

        {/* ====== 2. TYPOGRAPHY ====== */}
        <SectionHeader
          title="Typography"
          subtitle="Space Grotesk — all weights. Bold, geometric, neo-brutalist."
        />

        <View style={styles.typeSpecimen}>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>display / 42px Bold</Text>
            <Text style={[typography.display, { color: colors.text }]}>
              Date Night
            </Text>
          </View>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>h1 / 32px Bold</Text>
            <Text style={[typography.h1, { color: colors.text }]}>
              Find Your Match
            </Text>
          </View>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>h2 / 24px Bold</Text>
            <Text style={[typography.h2, { color: colors.text }]}>
              Popular Spots
            </Text>
          </View>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>h3 / 18px SemiBold</Text>
            <Text style={[typography.h3, { color: colors.text }]}>
              Restaurant Details
            </Text>
          </View>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>body / 15px Regular</Text>
            <Text style={[typography.body, { color: colors.text }]}>
              The perfect evening starts with the right companion and a great venue.
            </Text>
          </View>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>bodyMedium / 15px Medium</Text>
            <Text style={[typography.bodyMedium, { color: colors.text }]}>
              Booking confirmed for Saturday at 8:00 PM.
            </Text>
          </View>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>bodySmall / 14px Regular</Text>
            <Text style={[typography.bodySmall, { color: colors.text }]}>
              Last seen 5 minutes ago. Available for dates this weekend.
            </Text>
          </View>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>caption / 12px Medium</Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>
              Updated 2 hours ago
            </Text>
          </View>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>label / 12px Bold Uppercase</Text>
            <Text style={[typography.label, { color: colors.textSecondary }]}>
              NEW FEATURE
            </Text>
          </View>
          <View style={styles.typeRow}>
            <Text style={styles.typeLabel}>button / 16px Bold Uppercase</Text>
            <Text style={[typography.button, { color: colors.primary }]}>
              BOOK NOW
            </Text>
          </View>
        </View>

        {/* ====== 3. SPACING ====== */}
        <SectionHeader
          title="Spacing"
          subtitle="4px base grid. Consistent rhythm across all components."
        />

        <View style={styles.spacingList}>
          {(Object.entries(spacing) as [string, number][]).map(([key, value]) => (
            <View key={key} style={styles.spacingRow}>
              <Text style={styles.spacingLabel}>
                {key} — {value}px
              </Text>
              <View style={styles.spacingBarTrack}>
                <View
                  style={[
                    styles.spacingBar,
                    { width: value * 3, height: Math.max(value, 8) },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* ====== 4. SHADOWS ====== */}
        <SectionHeader
          title="Shadows"
          subtitle="Neo-brutalism: solid black offset shadows, zero blur."
        />

        <View style={styles.shadowGrid}>
          {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
            <View key={size} style={styles.shadowItem}>
              <View
                style={[
                  styles.shadowBox,
                  shadows[size],
                ]}
              />
              <Text style={styles.shadowLabel}>
                {size} — {shadows[size].shadowOffset.width}x{shadows[size].shadowOffset.height}
              </Text>
            </View>
          ))}
        </View>

        {/* ====== 5. BORDER RADIUS ====== */}
        <SectionHeader
          title="Border Radius"
          subtitle="Chunky, minimal rounding. Neo-brutalism favors sharp edges."
        />

        <View style={styles.radiusGrid}>
          {(Object.entries(borderRadius) as [string, number][]).map(([key, value]) => (
            <View key={key} style={styles.radiusItem}>
              <View
                style={[
                  styles.radiusShape,
                  {
                    borderRadius: value,
                    width: key === 'full' ? 56 : 56,
                    height: key === 'full' ? 56 : 56,
                  },
                ]}
              />
              <Text style={styles.radiusLabel}>
                {key}
              </Text>
              <Text style={styles.radiusValue}>
                {value === 9999 ? '9999' : `${value}px`}
              </Text>
            </View>
          ))}
        </View>

        {/* ====== 6. BUTTONS ====== */}
        <SectionHeader
          title="Buttons"
          subtitle="5 variants: primary (dark gradient), pink (pink gradient), secondary, outline, ghost."
        />

        <View style={styles.componentSection}>
          <Text style={styles.componentLabel}>Primary (Dark Gradient)</Text>
          <Button title="Book a Date" onPress={() => {}} variant="primary" fullWidth />

          <Text style={styles.componentLabel}>Pink (Gradient)</Text>
          <Button title="Match Now" onPress={() => {}} variant="pink" fullWidth />

          <Text style={styles.componentLabel}>Secondary</Text>
          <Button title="View Profile" onPress={() => {}} variant="secondary" fullWidth />

          <Text style={styles.componentLabel}>Outline</Text>
          <Button title="Cancel" onPress={() => {}} variant="outline" fullWidth />

          <Text style={styles.componentLabel}>Ghost</Text>
          <Button title="Skip for now" onPress={() => {}} variant="ghost" fullWidth />

          <Text style={styles.componentLabel}>Disabled</Text>
          <Button title="Unavailable" onPress={() => {}} variant="primary" disabled fullWidth />

          <Text style={styles.componentLabel}>Loading</Text>
          <Button title="Processing..." onPress={() => {}} variant="primary" loading fullWidth />

          <Text style={styles.componentLabel}>Sizes: sm / md / lg</Text>
          <View style={styles.row}>
            <Button title="SM" onPress={() => {}} variant="secondary" size="sm" />
            <Button title="MD" onPress={() => {}} variant="secondary" size="md" />
            <Button title="LG" onPress={() => {}} variant="secondary" size="lg" />
          </View>

          <Text style={styles.componentLabel}>With Icon</Text>
          <Button
            title="Find Nearby"
            onPress={() => {}}
            variant="primary"
            icon={<Icon name="map-pin" size={18} color={colors.white} />}
            fullWidth
          />

          <Text style={styles.componentLabel}>With Label</Text>
          <Button
            title="Premium"
            label="Upgrade to"
            onPress={() => {}}
            variant="pink"
            fullWidth
          />
        </View>

        {/* ====== 7. INPUTS ====== */}
        <SectionHeader
          title="Inputs"
          subtitle="Text fields with label, hint, error, icons, sizes."
        />

        <View style={styles.componentSection}>
          <Input
            label="Full Name"
            placeholder="Enter your name"
            value={inputValue}
            onChangeText={setInputValue}
          />

          <Input
            label="Email"
            placeholder="hello@daterabbit.com"
            hint="We'll send a confirmation code"
            leftIcon={<Icon name="mail" size={18} color={colors.textMuted} />}
          />

          <Input
            label="Password"
            placeholder="Enter password"
            secureTextEntry
            rightIcon={<Icon name="eye-off" size={18} color={colors.textMuted} />}
          />

          <Input
            label="City"
            placeholder="Select city"
            error="This field is required"
          />

          <Input
            label="Disabled"
            placeholder="Cannot edit"
            disabled
            value="Read-only value"
          />

          <Text style={styles.componentLabel}>Size: sm</Text>
          <Input placeholder="Small input" size="sm" />

          <Text style={styles.componentLabel}>Size: lg</Text>
          <Input placeholder="Large input" size="lg" />

          <Text style={styles.componentLabel}>Filled Variant</Text>
          <Input placeholder="Filled style" variant="filled" />
        </View>

        {/* ====== 8. CARDS ====== */}
        <SectionHeader
          title="Cards"
          subtitle="4 variants: default, elevated, outlined, gradient. Brutalist borders + shadows."
        />

        <View style={styles.componentSection}>
          <Text style={styles.componentLabel}>Default (shadow: md)</Text>
          <Card>
            <Text style={styles.cardTitle}>Date Night Spot</Text>
            <Text style={styles.cardBody}>
              Cozy Italian restaurant in downtown. Perfect for a romantic evening.
            </Text>
          </Card>

          <Text style={styles.componentLabel}>Elevated (shadow: lg)</Text>
          <Card variant="elevated" shadow="lg">
            <Text style={styles.cardTitle}>Featured Companion</Text>
            <Text style={styles.cardBody}>
              Top-rated this week. 4.9 stars from 127 reviews.
            </Text>
          </Card>

          <Text style={styles.componentLabel}>Outlined (no shadow)</Text>
          <Card variant="outlined">
            <Text style={styles.cardTitle}>Booking Summary</Text>
            <Text style={styles.cardBody}>
              Saturday, March 28 at 8:00 PM. Italian Bistro.
            </Text>
          </Card>

          <Text style={styles.componentLabel}>Gradient</Text>
          <Card variant="gradient">
            <Text style={styles.cardTitle}>Special Offer</Text>
            <Text style={styles.cardBody}>
              First date is on us! Use code RABBIT2026.
            </Text>
          </Card>

          <Text style={styles.componentLabel}>Pressable Card</Text>
          <Card onPress={() => {}} shadow="sm">
            <Text style={styles.cardTitle}>Tap me</Text>
            <Text style={styles.cardBody}>
              This card responds to press with scale animation.
            </Text>
          </Card>

          <Text style={styles.componentLabel}>Shadow variants: none / sm / md / lg</Text>
          <View style={styles.shadowCardsRow}>
            {(['none', 'sm', 'md', 'lg'] as const).map((s) => (
              <Card key={s} shadow={s} padding="sm" style={styles.miniCard}>
                <Text style={styles.miniCardText}>{s}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* ====== 9. BADGES ====== */}
        <SectionHeader
          title="Badges"
          subtitle="6 variants: pink, purple, gray, success, warning, gradient."
        />

        <View style={styles.componentSection}>
          <Text style={styles.componentLabel}>All Variants</Text>
          <View style={styles.badgeRow}>
            <Badge text="Pink" variant="pink" />
            <Badge text="Purple" variant="purple" />
            <Badge text="Gray" variant="gray" />
            <Badge text="Success" variant="success" />
            <Badge text="Warning" variant="warning" />
            <Badge text="Gradient" variant="gradient" />
          </View>

          <Text style={styles.componentLabel}>Sizes: sm / md / lg</Text>
          <View style={styles.badgeRow}>
            <Badge text="Small" variant="pink" size="sm" />
            <Badge text="Medium" variant="pink" size="md" />
            <Badge text="Large" variant="pink" size="lg" />
          </View>

          <Text style={styles.componentLabel}>With Icon</Text>
          <View style={styles.badgeRow}>
            <Badge
              text="Verified"
              variant="success"
              icon={<Icon name="check-circle" size={14} color={colors.success} />}
            />
            <Badge
              text="New"
              variant="purple"
              icon={<Icon name="sparkles" size={14} color="#635BFF" />}
            />
            <Badge
              text="Premium"
              variant="gradient"
              icon={<Icon name="zap" size={14} color={colors.primary} />}
            />
          </View>
        </View>

        {/* ====== 10. AVATARS ====== */}
        <SectionHeader
          title="Avatars"
          subtitle="Initials fallback, verified badge, multiple sizes."
        />

        <View style={styles.componentSection}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarItem}>
              <Avatar name="Anna" size={32} />
              <Text style={styles.avatarLabel}>32px</Text>
            </View>
            <View style={styles.avatarItem}>
              <Avatar name="Boris" size={48} />
              <Text style={styles.avatarLabel}>48px</Text>
            </View>
            <View style={styles.avatarItem}>
              <Avatar name="Clara D" size={64} verified />
              <Text style={styles.avatarLabel}>64px verified</Text>
            </View>
            <View style={styles.avatarItem}>
              <Avatar name="Dmitry K" size={80} />
              <Text style={styles.avatarLabel}>80px</Text>
            </View>
          </View>
        </View>

        {/* ====== 11. ICONS ====== */}
        <SectionHeader
          title="Icons"
          subtitle={`Lucide icons — ${iconNames.length} available via <Icon name="..." />`}
        />

        <View style={styles.iconGrid}>
          {iconNames.map((name) => (
            <View key={name} style={styles.iconItem}>
              <View style={styles.iconBox}>
                <Icon name={name} size={20} color={colors.text} />
              </View>
              <Text style={styles.iconName} numberOfLines={1}>
                {name}
              </Text>
            </View>
          ))}
        </View>

        {/* ====== FOOTER ====== */}
        <View style={styles.footer}>
          <View style={styles.footerDivider} />
          <Text style={styles.footerText}>
            DateRabbit Design System v1.0
          </Text>
          <Text style={styles.footerMeta}>
            Neo-Brutalism / Space Grotesk / Bold Borders / Offset Shadows
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: PAGE_PADDING,
    paddingBottom: spacing.xxxl * 2,
  },

  // Back button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '500',
  },

  // Header
  headerContainer: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.black,
    ...shadows.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.normal,
    borderColor: colors.black,
  },
  brandName: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -1,
  },
  brandTagline: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  headerDescription: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },

  // Subsection
  subsectionTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },

  // Color swatches
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },

  // Typography specimen
  typeSpecimen: {
    gap: spacing.md,
  },
  typeRow: {
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  typeLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    fontWeight: '500',
  },

  // Spacing
  spacingList: {
    gap: spacing.sm,
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  spacingLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    width: 100,
  },
  spacingBarTrack: {
    flex: 1,
    height: 32,
    justifyContent: 'center',
  },
  spacingBar: {
    backgroundColor: colors.accent,
    borderRadius: borderRadius.xs,
    borderWidth: borderWidth.thin,
    borderColor: colors.black,
    minWidth: 12,
  },

  // Shadows
  shadowGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    justifyContent: 'space-between',
  },
  shadowItem: {
    alignItems: 'center',
    width: '45%',
    marginBottom: spacing.md,
  },
  shadowBox: {
    width: 80,
    height: 80,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.black,
  },
  shadowLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.sm,
    fontWeight: '500',
  },

  // Border Radius
  radiusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'flex-start',
  },
  radiusItem: {
    alignItems: 'center',
    marginBottom: spacing.sm,
    width: 72,
  },
  radiusShape: {
    backgroundColor: colors.primary,
    borderWidth: borderWidth.normal,
    borderColor: colors.black,
  },
  radiusLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  radiusValue: {
    fontFamily: typography.fonts.body,
    fontSize: 10,
    color: colors.textMuted,
  },

  // Component sections
  componentSection: {
    gap: spacing.sm,
  },
  componentLabel: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
    alignItems: 'center',
  },

  // Cards
  cardTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  cardBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  shadowCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  miniCard: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniCardText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    alignItems: 'center',
  },

  // Avatars
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.lg,
    flexWrap: 'wrap',
  },
  avatarItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  avatarLabel: {
    fontFamily: typography.fonts.body,
    fontSize: 10,
    color: colors.textMuted,
  },

  // Icons
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  iconItem: {
    width: 64,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  iconName: {
    fontFamily: typography.fonts.body,
    fontSize: 8,
    color: colors.textMuted,
    textAlign: 'center',
  },

  // Footer
  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerDivider: {
    width: '100%',
    height: borderWidth.normal,
    backgroundColor: colors.black,
    marginBottom: spacing.lg,
  },
  footerText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
    color: colors.text,
    fontWeight: '700',
  },
  footerMeta: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});
