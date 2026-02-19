import { useColorScheme } from 'react-native';

// ============================================
// DateRabbit Theme — Clean Airy Style
// Based on brandbook: soft feminine palette
// ============================================

// Light theme colors
export const lightColors = {
  // Primary brand colors — Blush Pink gradient
  primary: '#F8B4C4',
  primaryDark: '#E89AAE',
  primaryLight: '#FFC8D4',

  // Accent — Lavender for trust
  accent: '#B8A9E8',
  accentDark: '#9B8AD6',
  accentLight: '#D4CCF4',

  // Secondary — Dusty Rose for highlights
  secondary: '#C4748A',
  secondaryDark: '#A85A70',
  secondaryLight: '#D99AAC',

  // Neutrals
  background: '#FFFFFF',
  backgroundWarm: '#FDF9FA',
  surface: '#F5F0F2',
  surfaceElevated: '#FFFFFF',

  // Text hierarchy
  text: '#2D2A32',           // Charcoal — primary text
  textSecondary: '#4A4550',  // Dark Gray — secondary
  textMuted: '#6B6570',      // Gray — muted
  textLight: '#9B959F',      // Light Gray — placeholders
  textInverse: '#FFFFFF',

  // UI elements
  border: '#E8E4EC',
  borderLight: '#F0EBF0',
  divider: '#F0EBF0',

  // Semantic
  success: '#4CAF50',
  successLight: '#E8F5E9',
  warning: '#F9A825',
  warningLight: '#FFF8E1',
  error: '#E57373',
  errorLight: '#FFEBEE',
  info: '#64B5F6',
  infoLight: '#E3F2FD',

  // Common
  white: '#FFFFFF',
  black: '#000000',

  // Shadows
  shadow: 'rgba(45, 42, 50, 0.08)',
  shadowStrong: 'rgba(45, 42, 50, 0.12)',

  // Gradients (for LinearGradient)
  gradient: {
    primary: ['#F8B4C4', '#E89AAE'],          // Blush Pink
    accent: ['#F8B4C4', '#B8A9E8'],            // Pink to Lavender
    dark: ['#2D2A32', '#3D3A42'],              // Charcoal
    softPink: ['#FFF0F3', '#FFE4EC'],          // Very soft pink
    softPurple: ['#F0EEFF', '#E8E4F8'],        // Very soft purple
  },

  // Booking status colors
  booking: {
    pending: '#F9A825',
    confirmed: '#4CAF50',
    active: '#64B5F6',
    completed: '#9B959F',
    cancelled: '#E57373',
  },

  // Badge colors
  badge: {
    pink: { bg: '#FFF0F3', border: 'rgba(248, 180, 196, 0.3)', text: '#C4748A' },
    purple: { bg: '#F0EEFF', border: 'rgba(184, 169, 232, 0.3)', text: '#8B7CC4' },
    gray: { bg: '#F5F0F2', border: '#E8E4EC', text: '#6B6570' },
    success: { bg: '#E8F5E9', border: '#C8E6C9', text: '#4CAF50' },
    warning: { bg: '#FFF8E1', border: '#FFE082', text: '#F9A825' },
  },
};

// Dark theme colors
export const darkColors = {
  // Primary brand colors
  primary: '#F8B4C4',
  primaryDark: '#E89AAE',
  primaryLight: '#FFC8D4',

  // Accent
  accent: '#C4B8F0',
  accentDark: '#B8A9E8',
  accentLight: '#DCD6F8',

  // Secondary
  secondary: '#D99AAC',
  secondaryDark: '#C4748A',
  secondaryLight: '#E8B8C6',

  // Neutrals
  background: '#1A1820',
  backgroundWarm: '#1E1C24',
  surface: '#252330',
  surfaceElevated: '#302D3A',

  // Text hierarchy
  text: '#F5F2F8',
  textSecondary: '#C8C4CE',
  textMuted: '#9B959F',
  textLight: '#6B6570',
  textInverse: '#2D2A32',

  // UI elements
  border: '#3D3A45',
  borderLight: '#302D38',
  divider: '#3D3A45',

  // Semantic
  success: '#66BB6A',
  successLight: '#1B3D1E',
  warning: '#FFB74D',
  warningLight: '#3D2E14',
  error: '#EF9A9A',
  errorLight: '#3D1A1A',
  info: '#90CAF9',
  infoLight: '#1A2A3D',

  // Common
  white: '#FFFFFF',
  black: '#000000',

  // Shadows
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowStrong: 'rgba(0, 0, 0, 0.5)',

  // Gradients
  gradient: {
    primary: ['#F8B4C4', '#E89AAE'],
    accent: ['#F8B4C4', '#C4B8F0'],
    dark: ['#252330', '#302D3A'],
    softPink: ['#2D2530', '#302830'],
    softPurple: ['#282635', '#2D2A38'],
  },

  // Booking status colors
  booking: {
    pending: '#FFB74D',
    confirmed: '#66BB6A',
    active: '#90CAF9',
    completed: '#9B959F',
    cancelled: '#EF9A9A',
  },

  // Badge colors
  badge: {
    pink: { bg: '#302530', border: 'rgba(248, 180, 196, 0.2)', text: '#F8B4C4' },
    purple: { bg: '#282638', border: 'rgba(184, 169, 232, 0.2)', text: '#C4B8F0' },
    gray: { bg: '#302D38', border: '#3D3A45', text: '#9B959F' },
    success: { bg: '#1B3D1E', border: '#2E5030', text: '#66BB6A' },
    warning: { bg: '#3D2E14', border: '#5C4520', text: '#FFB74D' },
  },
};

// Default to light colors for backward compatibility
export const colors = lightColors;

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

// Border radius scale
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
};

// Typography scale
// Fonts: DM Sans (body/UI), Fraunces (headlines)
export const typography = {
  // Font families
  fonts: {
    heading: 'Fraunces_500Medium',
    headingItalic: 'Fraunces_500Medium_Italic',
    body: 'DMSans_400Regular',
    bodyMedium: 'DMSans_500Medium',
    bodySemiBold: 'DMSans_600SemiBold',
    bodyBold: 'DMSans_700Bold',
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
    fontFamily: 'Fraunces_500Medium',
    fontSize: 40,
    fontWeight: '500' as const,
    lineHeight: 45,
    letterSpacing: -0.5,
  },
  h1: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 32,
    fontWeight: '500' as const,
    lineHeight: 38,
  },
  h2: {
    fontFamily: 'Fraunces_500Medium',
    fontSize: 24,
    fontWeight: '500' as const,
    lineHeight: 30,
  },
  h3: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  label: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily: 'DMSans_600SemiBold',
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

// Shadow presets
export const shadows = {
  sm: {
    shadowColor: '#2D2A32',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D2A32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2D2A32',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 48,
    elevation: 8,
  },
  xl: {
    shadowColor: '#2D2A32',
    shadowOffset: { width: 0, height: 25 },
    shadowOpacity: 0.16,
    shadowRadius: 80,
    elevation: 16,
  },
  // Button shadows
  button: {
    shadowColor: '#2D2A32',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 4,
  },
  buttonPink: {
    shadowColor: '#F8B4C4',
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

// Theme hook for dark mode support
export function useTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
    spacing,
    borderRadius,
    typography,
    touchTargets,
    shadows,
    animation,
  };
}

// Type exports
export type ColorKey = keyof typeof lightColors;
export type ThemeColors = typeof lightColors;
