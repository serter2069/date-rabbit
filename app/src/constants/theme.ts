// ============================================
// DateRabbit Theme — Onyx Dark Design System
// Single dark theme, no light/dark switching
// ============================================

// Onyx color palette
export const colors = {
  // Primary — Onyx Indigo accent
  primary: '#6C63FF',
  primaryDark: '#5A52E0',
  primaryLight: '#8B85FF',

  // Accent — Indigo (same as primary for consistency)
  accent: '#6C63FF',
  accentDark: '#5A52E0',
  accentLight: '#8B85FF',

  // Secondary — Pink accent for secondary CTAs
  secondary: '#FF6B9D',
  secondaryDark: '#E8527A',
  secondaryLight: '#FF8DB8',

  // Neutrals — Onyx surfaces
  background: '#0A0A0B',
  backgroundWarm: '#0E0E10',
  surface: '#1A1A1C',
  surfaceElevated: '#242426',

  // Card — glassmorphism
  card: 'rgba(255,255,255,0.03)',

  // Text hierarchy
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textMuted: '#555555',
  textLight: '#3A3A3C',
  textInverse: '#0A0A0B',

  // UI elements
  border: 'rgba(255,255,255,0.05)',
  borderLight: 'rgba(255,255,255,0.03)',
  divider: 'rgba(255,255,255,0.05)',

  // Semantic
  success: '#34C759',
  successLight: 'rgba(52,199,89,0.15)',
  warning: '#FFD60A',
  warningLight: 'rgba(255,214,10,0.15)',
  error: '#FF453A',
  errorLight: 'rgba(255,69,58,0.15)',
  info: '#64D2FF',
  infoLight: 'rgba(100,210,255,0.15)',

  // Common
  white: '#FFFFFF',
  black: '#000000',

  // Shadows
  shadow: 'rgba(0,0,0,0.4)',
  shadowStrong: 'rgba(0,0,0,0.6)',

  // Gradients (for LinearGradient)
  gradient: {
    primary: ['#6C63FF', '#5A52E0'] as readonly [string, string],
    accent: ['#6C63FF', '#8B85FF'] as readonly [string, string],
    dark: ['#1A1A1C', '#242426'] as readonly [string, string],
    softPink: ['rgba(255,107,157,0.15)', 'rgba(255,107,157,0.05)'] as readonly [string, string],
    softPurple: ['rgba(108,99,255,0.15)', 'rgba(108,99,255,0.05)'] as readonly [string, string],
    secondary: ['#FF6B9D', '#E8527A'] as readonly [string, string],
  },

  // Booking status colors
  booking: {
    pending: '#FFD60A',
    confirmed: '#34C759',
    active: '#64D2FF',
    completed: '#555555',
    cancelled: '#FF453A',
  },

  // Badge colors — dark Onyx badges
  badge: {
    pink: { bg: 'rgba(255,107,157,0.12)', border: 'rgba(255,107,157,0.2)', text: '#FF6B9D' },
    purple: { bg: 'rgba(108,99,255,0.12)', border: 'rgba(108,99,255,0.2)', text: '#8B85FF' },
    gray: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.08)', text: '#8E8E93' },
    success: { bg: 'rgba(52,199,89,0.12)', border: 'rgba(52,199,89,0.2)', text: '#34C759' },
    warning: { bg: 'rgba(255,214,10,0.12)', border: 'rgba(255,214,10,0.2)', text: '#FFD60A' },
  },
};

// Backward compatibility aliases
export const lightColors = colors;
export const darkColors = colors;

// Spacing scale (4px base)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Standard page padding — replaces magic `spacing.lg + 4`
export const PAGE_PADDING = spacing.lg + 4; // 28

// Border radius scale — Onyx (larger radii)
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  full: 9999,
};

// Border widths
export const borderWidth = {
  thin: 1,
  normal: 1.5,
  thick: 2,
};

// Overlay tokens — for glassmorphism effects
export const overlay = {
  light: 'rgba(255,255,255,0.03)',
  medium: 'rgba(255,255,255,0.05)',
  heavy: 'rgba(255,255,255,0.08)',
};

// Typography scale
// Fonts: Plus Jakarta Sans (body/UI), Outfit (headings)
export const typography = {
  // Font families
  fonts: {
    heading: 'Outfit_600SemiBold',
    headingMedium: 'Outfit_500Medium',
    body: 'PlusJakartaSans_400Regular',
    bodyMedium: 'PlusJakartaSans_500Medium',
    bodySemiBold: 'PlusJakartaSans_600SemiBold',
    bodyBold: 'PlusJakartaSans_700Bold',
  },

  // Size scale
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 24,
    xxl: 32,
    display: 40,
  },

  // Pre-defined styles
  display: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 40,
    fontWeight: '600' as const,
    lineHeight: 45,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 32,
    fontWeight: '600' as const,
    lineHeight: 38,
  },
  h2: {
    fontFamily: 'Outfit_600SemiBold',
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 30,
  },
  h3: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'PlusJakartaSans_500Medium',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  label: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
};

// Touch target sizes (Apple HIG minimum 44pt)
export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
};

// Shadow presets — Onyx deep dark shadows
export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 40,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.5,
    shadowRadius: 80,
    elevation: 16,
  },
  // Button shadows
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 4,
  },
  buttonAccent: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 4,
  },
};

// Animation durations
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// Theme hook — returns single Onyx theme (no dark mode switching)
export function useTheme() {
  return {
    colors,
    isDark: true,
    spacing,
    borderRadius,
    typography,
    touchTargets,
    shadows,
    animation,
  };
}

// Type exports
export type ColorKey = keyof typeof colors;
export type ThemeColors = typeof colors;
