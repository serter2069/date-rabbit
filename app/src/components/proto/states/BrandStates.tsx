import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// COLORS
// ---------------------------------------------------------------------------
function ColorsGrid() {
  const groups: { label: string; items: { name: string; hex: string }[] }[] = [
    {
      label: 'PRIMARY / ACCENT',
      items: [
        { name: 'primary', hex: colors.primary },
        { name: 'primaryDark', hex: colors.primaryDark },
        { name: 'primaryLight', hex: colors.primaryLight },
        { name: 'accent', hex: colors.accent },
        { name: 'accentDark', hex: colors.accentDark },
        { name: 'accentLight', hex: colors.accentLight },
      ],
    },
    {
      label: 'SURFACES',
      items: [
        { name: 'background', hex: colors.background },
        { name: 'backgroundWarm', hex: colors.backgroundWarm },
        { name: 'surface', hex: colors.surface },
      ],
    },
    {
      label: 'TEXT',
      items: [
        { name: 'text', hex: colors.text },
        { name: 'textSecondary', hex: colors.textSecondary },
        { name: 'textMuted', hex: colors.textMuted },
        { name: 'textLight', hex: colors.textLight },
        { name: 'textInverse', hex: colors.textInverse },
      ],
    },
    {
      label: 'SEMANTIC',
      items: [
        { name: 'success', hex: colors.success },
        { name: 'warning', hex: colors.warning },
        { name: 'error', hex: colors.error },
        { name: 'info', hex: colors.info },
      ],
    },
  ];

  return (
    <View>
      {groups.map(g => (
        <View key={g.label} style={s.colorGroup}>
          <Text style={s.colorGroupLabel}>{g.label}</Text>
          <View style={s.colorRow}>
            {g.items.map(c => (
              <View key={c.name} style={s.colorChip}>
                <View
                  style={[
                    s.colorSwatch,
                    {
                      backgroundColor: c.hex,
                      borderColor: c.hex === '#FFFFFF' || c.hex === '#F4F0EA' ? colors.border : c.hex,
                    },
                  ]}
                />
                <Text style={s.colorName}>{c.name}</Text>
                <Text style={s.colorHex}>{c.hex}</Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// TYPOGRAPHY
// ---------------------------------------------------------------------------
function TypographyScale() {
  const items: { label: string; style: Record<string, any> }[] = [
    { label: 'Display (42)', style: typography.display },
    { label: 'H1 (32)', style: typography.h1 },
    { label: 'H2 (24)', style: typography.h2 },
    { label: 'H3 (18)', style: typography.h3 },
    { label: 'Body (15)', style: typography.body },
    { label: 'Body Medium (15)', style: typography.bodyMedium },
    { label: 'Body Small (14)', style: typography.bodySmall },
    { label: 'Caption (12)', style: typography.caption },
    { label: 'Label (12)', style: typography.label },
    { label: 'Button (16)', style: typography.button },
  ];

  return (
    <View style={{ gap: 12 }}>
      {items.map(t => (
        <View key={t.label} style={s.typoRow}>
          <Text style={[t.style as any, { color: colors.text }]}>
            {t.label}
          </Text>
          <Text style={s.typoMeta}>
            {t.style.fontFamily} / {t.style.fontSize}px
          </Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// SPACING
// ---------------------------------------------------------------------------
function SpacingScale() {
  const items: { name: string; px: number }[] = [
    { name: 'xs', px: spacing.xs },
    { name: 'sm', px: spacing.sm },
    { name: 'md', px: spacing.md },
    { name: 'lg', px: spacing.lg },
    { name: 'xl', px: spacing.xl },
    { name: 'xxl', px: spacing.xxl },
    { name: 'xxxl', px: spacing.xxxl },
  ];

  return (
    <View style={{ gap: 8 }}>
      {items.map(sp => (
        <View key={sp.name} style={s.spacingRow}>
          <Text style={s.spacingLabel}>{sp.name} ({sp.px}px)</Text>
          <View style={[s.spacingBar, { width: sp.px, height: 16 }]} />
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// BORDER RADIUS
// ---------------------------------------------------------------------------
function BorderRadiusScale() {
  const items: { name: string; value: number }[] = [
    { name: 'xs (4)', value: borderRadius.xs },
    { name: 'sm (8)', value: borderRadius.sm },
    { name: 'lg (12)', value: borderRadius.lg },
    { name: 'xl (16)', value: borderRadius.xl },
    { name: 'full', value: borderRadius.full },
  ];

  return (
    <View style={s.radiusRow}>
      {items.map(r => (
        <View key={r.name} style={s.radiusChip}>
          <View
            style={[
              s.radiusBox,
              { borderRadius: Math.min(r.value, 24) },
            ]}
          />
          <Text style={s.radiusLabel}>{r.name}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// NEO-BRUTALISM SHADOWS
// ---------------------------------------------------------------------------
function ShadowDemo() {
  const items: { name: string; shadow: typeof shadows.sm }[] = [
    { name: 'sm (2px)', shadow: shadows.sm },
    { name: 'md (4px)', shadow: shadows.md },
    { name: 'lg (6px)', shadow: shadows.lg },
    { name: 'xl (8px)', shadow: shadows.xl },
  ];

  return (
    <View style={s.shadowRow}>
      {items.map(sh => (
        <View key={sh.name} style={[s.shadowBox, sh.shadow]}>
          <Text style={s.shadowLabel}>{sh.name}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// BORDER WIDTHS
// ---------------------------------------------------------------------------
function BorderWidthDemo() {
  const items: { name: string; value: number }[] = [
    { name: 'thin (2)', value: borderWidth.thin },
    { name: 'normal (3)', value: borderWidth.normal },
    { name: 'thick (4)', value: borderWidth.thick },
  ];

  return (
    <View style={s.borderWidthRow}>
      {items.map(b => (
        <View key={b.name} style={[s.borderWidthBox, { borderWidth: b.value }]}>
          <Text style={s.borderWidthLabel}>{b.name}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// BUTTON VARIANTS
// ---------------------------------------------------------------------------
function ButtonVariants() {
  return (
    <View style={{ gap: 12 }}>
      <Pressable style={[s.btnBase, s.btnPrimary, shadows.button]}>
        <Text style={[s.btnText, { color: colors.textInverse }]}>PRIMARY</Text>
      </Pressable>
      <Pressable style={[s.btnBase, s.btnSecondary, shadows.button]}>
        <Text style={[s.btnText, { color: colors.text }]}>SECONDARY</Text>
      </Pressable>
      <Pressable style={[s.btnBase, s.btnGhost]}>
        <Text style={[s.btnText, { color: colors.text }]}>GHOST</Text>
      </Pressable>
      <Pressable style={[s.btnBase, s.btnDanger, shadows.button]}>
        <Text style={[s.btnText, { color: colors.textInverse }]}>DANGER</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// INPUT STATES
// ---------------------------------------------------------------------------
function InputStates() {
  const [focusedValue, setFocusedValue] = useState('Focused input');

  return (
    <View style={{ gap: 12 }}>
      <View>
        <Text style={s.inputLabel}>DEFAULT</Text>
        <TextInput style={s.inputDefault} placeholder="Enter text..." placeholderTextColor={colors.textLight} />
      </View>
      <View>
        <Text style={s.inputLabel}>FOCUSED</Text>
        <TextInput
          style={[s.inputDefault, s.inputFocused]}
          value={focusedValue}
          onChangeText={setFocusedValue}
        />
      </View>
      <View>
        <Text style={s.inputLabel}>ERROR</Text>
        <TextInput style={[s.inputDefault, s.inputError]} value="Invalid value" />
        <Text style={s.inputErrorText}>This field is required</Text>
      </View>
      <View>
        <Text style={s.inputLabel}>DISABLED</Text>
        <TextInput style={[s.inputDefault, s.inputDisabled]} value="Disabled" editable={false} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// BADGE VARIANTS
// ---------------------------------------------------------------------------
function BadgeVariants() {
  const badges: { label: string; bg: string; border: string; text: string }[] = [
    { label: 'PENDING', bg: colors.badge.pink.bg, border: colors.badge.pink.border, text: colors.badge.pink.text },
    { label: 'CONFIRMED', bg: colors.badge.success.bg, border: colors.badge.success.border, text: colors.badge.success.text },
    { label: 'ACTIVE', bg: colors.accentLight, border: colors.border, text: colors.accentDark },
    { label: 'CANCELLED', bg: colors.errorLight, border: colors.border, text: colors.error },
    { label: 'PREMIUM', bg: colors.badge.purple.bg, border: colors.badge.purple.border, text: colors.badge.purple.text },
    { label: 'WARNING', bg: colors.badge.warning.bg, border: colors.badge.warning.border, text: colors.badge.warning.text },
  ];

  return (
    <View style={s.badgeRow}>
      {badges.map(b => (
        <View key={b.label} style={[s.badge, { backgroundColor: b.bg, borderColor: b.border }]}>
          <Text style={[s.badgeText, { color: b.text }]}>{b.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ICON SHOWCASE
// ---------------------------------------------------------------------------
function IconShowcase() {
  const icons: { label: string; name: string }[] = [
    { label: 'Heart', name: 'heart' },
    { label: 'Star', name: 'star' },
    { label: 'Calendar', name: 'calendar' },
    { label: 'User', name: 'user' },
    { label: 'MapPin', name: 'map-pin' },
    { label: 'Clock', name: 'clock' },
    { label: 'DollarSign', name: 'dollar-sign' },
    { label: 'Shield', name: 'shield' },
    { label: 'Bell', name: 'bell' },
    { label: 'Search', name: 'search' },
    { label: 'X', name: 'x' },
    { label: 'ChevronRight', name: 'chevron-right' },
  ];

  return (
    <View style={s.iconGrid}>
      {icons.map(ic => (
        <View key={ic.label} style={s.iconChip}>
          <Feather name={ic.name as any} size={24} color={colors.text} />
          <Text style={s.iconName}>{ic.label}</Text>
        </View>
      ))}
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function BrandStates() {
  return (
    <View style={s.root}>
      <StateSection title="BACKGROUND_COLOR" description="Background color for ALL screens — use this as base">
        <View style={{ gap: 12 }}>
          <View style={[s.bgTokenCard, { backgroundColor: colors.background }]}>
            <Text style={{ ...typography.h2, color: colors.text }}>background</Text>
            <Text style={{ ...typography.body, color: colors.textSecondary }}>{colors.background}</Text>
            <Text style={{ ...typography.caption, color: colors.textMuted }}>
              Main background. Used on every screen as the base layer.
            </Text>
          </View>
          <View style={[s.bgTokenCard, { backgroundColor: colors.backgroundWarm }]}>
            <Text style={{ ...typography.h3, color: colors.text }}>backgroundWarm</Text>
            <Text style={{ ...typography.body, color: colors.textSecondary }}>{colors.backgroundWarm}</Text>
            <Text style={{ ...typography.caption, color: colors.textMuted }}>
              Warm variant for cards and secondary sections.
            </Text>
          </View>
          <View style={[s.bgTokenCard, { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border }]}>
            <Text style={{ ...typography.h3, color: colors.text }}>surface</Text>
            <Text style={{ ...typography.body, color: colors.textSecondary }}>{colors.surface}</Text>
            <Text style={{ ...typography.caption, color: colors.textMuted }}>
              Cards, modals, elevated surfaces.
            </Text>
          </View>
        </View>
      </StateSection>

      <StateSection title="COLORS" description="Full color palette">
        <ColorsGrid />
      </StateSection>

      <StateSection title="TYPOGRAPHY" description="Space Grotesk type scale">
        <TypographyScale />
      </StateSection>

      <StateSection title="SPACING" description="4px base unit scale">
        <SpacingScale />
      </StateSection>

      <StateSection title="BORDER RADIUS" description="Radius tokens">
        <BorderRadiusScale />
      </StateSection>

      <StateSection title="NEO-BRUTALISM SHADOWS" description="Solid offset shadows">
        <ShadowDemo />
      </StateSection>

      <StateSection title="BORDER WIDTHS" description="Thick brutalist borders">
        <BorderWidthDemo />
      </StateSection>

      <StateSection title="BUTTON VARIANTS" description="Primary, secondary, ghost, danger">
        <ButtonVariants />
      </StateSection>

      <StateSection title="INPUT STATES" description="Default, focused, error, disabled">
        <InputStates />
      </StateSection>

      <StateSection title="BADGE VARIANTS" description="Status badges">
        <BadgeVariants />
      </StateSection>

      <StateSection title="ICON SHOWCASE" description="12 Feather icons">
        <IconShowcase />
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16, width: '100%' },

  // Background token card
  bgTokenCard: {
    padding: 24,
    borderRadius: borderRadius.lg,
    borderWidth: 3,
    borderColor: colors.border,
  },

  // Colors
  colorGroup: { marginBottom: 16 },
  colorGroupLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: 8,
  },
  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  colorChip: { alignItems: 'center', width: 64 },
  colorSwatch: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  colorName: { ...typography.caption, color: colors.text, marginTop: 4, textAlign: 'center' },
  colorHex: { fontSize: 9, color: colors.textMuted, textAlign: 'center' },

  // Typography
  typoRow: { marginBottom: 4 },
  typoMeta: { ...typography.caption, color: colors.textLight },

  // Spacing
  spacingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  spacingLabel: { ...typography.caption, color: colors.text, width: 90 },
  spacingBar: { backgroundColor: colors.primary, borderRadius: 2 },

  // Border Radius
  radiusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  radiusChip: { alignItems: 'center' },
  radiusBox: {
    width: 48,
    height: 48,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.border,
  },
  radiusLabel: { ...typography.caption, color: colors.text, marginTop: 4 },

  // Shadows
  shadowRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  shadowBox: {
    width: 72,
    height: 72,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadowLabel: { ...typography.caption, color: colors.text, textAlign: 'center' },

  // Border Widths
  borderWidthRow: { flexDirection: 'row', gap: 12 },
  borderWidthBox: {
    flex: 1,
    height: 56,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  borderWidthLabel: { ...typography.caption, color: colors.text },

  // Buttons
  btnBase: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnSecondary: { backgroundColor: colors.surface },
  btnGhost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  btnDanger: { backgroundColor: colors.error },
  btnText: { ...typography.button, color: colors.text },

  // Inputs
  inputLabel: { ...typography.label, color: colors.textMuted, marginBottom: 4 },
  inputDefault: {
    ...typography.body,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.error },
  inputErrorText: { ...typography.caption, color: colors.error, marginTop: 4 },
  inputDisabled: { backgroundColor: colors.borderLight, color: colors.textLight },

  // Badges
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.border,
  },
  badgeText: { ...typography.label, fontSize: 10 },

  // Icons
  iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  iconChip: {
    alignItems: 'center',
    width: 64,
    paddingVertical: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  iconName: { ...typography.caption, color: colors.text, marginTop: 4, textAlign: 'center', fontSize: 9 },
});
