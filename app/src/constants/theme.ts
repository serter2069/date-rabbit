import { useColorScheme } from 'react-native';

// Light theme colors
export const lightColors = {
  // Main brand color - warm coral/pink for dating app vibe
  primary: '#FF6B6B',
  primaryDark: '#E85555',
  primaryLight: '#FF8A8A',

  // Accent - gold for premium feel
  accent: '#FFB347',
  accentDark: '#E69A2E',

  // Secondary - soft purple for trust
  secondary: '#8B7CF6',
  secondaryDark: '#7B68EE',

  // Neutrals
  background: '#FFFFFF',
  surface: '#F8F9FA',
  surfaceElevated: '#FFFFFF',

  // Text
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  textInverse: '#FFFFFF',

  // UI elements
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  divider: '#E5E7EB',

  // Semantic
  success: '#10B981',
  successLight: '#D1FAE5',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  info: '#3B82F6',
  infoLight: '#DBEAFE',

  // Common
  white: '#FFFFFF',
  black: '#000000',

  // Card shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowStrong: 'rgba(0, 0, 0, 0.15)',

  // Gradients (as arrays for LinearGradient)
  gradient: {
    primary: ['#FF6B6B', '#FF8E72'],
    accent: ['#FFB347', '#FFCC80'],
    premium: ['#FFB347', '#FF6B6B'],
  },

  // Status colors for bookings
  booking: {
    pending: '#F59E0B',
    confirmed: '#10B981',
    active: '#3B82F6',
    completed: '#6B7280',
    cancelled: '#EF4444',
  },
};

// Dark theme colors
export const darkColors = {
  // Main brand color - slightly adjusted for dark mode
  primary: '#FF7B7B',
  primaryDark: '#FF6B6B',
  primaryLight: '#FF9A9A',

  // Accent - gold for premium feel
  accent: '#FFC05C',
  accentDark: '#FFB347',

  // Secondary - soft purple for trust
  secondary: '#9B8CF6',
  secondaryDark: '#8B7CF6',

  // Neutrals
  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#2A2A2A',

  // Text
  text: '#F5F5F5',
  textSecondary: '#A0A0A0',
  textMuted: '#707070',
  textInverse: '#1A1A2E',

  // UI elements
  border: '#333333',
  borderLight: '#2A2A2A',
  divider: '#333333',

  // Semantic
  success: '#34D399',
  successLight: '#065F46',
  warning: '#FBBF24',
  warningLight: '#78350F',
  error: '#F87171',
  errorLight: '#7F1D1D',
  info: '#60A5FA',
  infoLight: '#1E3A8A',

  // Common
  white: '#FFFFFF',
  black: '#000000',

  // Card shadows
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowStrong: 'rgba(0, 0, 0, 0.5)',

  // Gradients (as arrays for LinearGradient)
  gradient: {
    primary: ['#FF7B7B', '#FF9E82'],
    accent: ['#FFC05C', '#FFDC90'],
    premium: ['#FFC05C', '#FF7B7B'],
  },

  // Status colors for bookings
  booking: {
    pending: '#FBBF24',
    confirmed: '#34D399',
    active: '#60A5FA',
    completed: '#9CA3AF',
    cancelled: '#F87171',
  },
};

// Default to light colors for backward compatibility
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

// Touch target sizes (Apple HIG minimum 44pt)
export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
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
    animation,
  };
}

// Type for color keys
export type ColorKey = keyof typeof lightColors;
export type ThemeColors = typeof lightColors;
