// ============================================
// DateRabbit Theme — Neo-Brutalism
// Based on SchemeCloud prototype (Space Grotesk)
// Bold borders, offset shadows, vivid colors
// ============================================

// Neo-Brutalism color palette
export const colors = {
  // Primary — Bold Red-Pink
  primary: '#FF2A5F',
  primaryDark: '#E0224F',
  primaryLight: '#FF5A85',

  // Accent — Cyan
  accent: '#4DF0FF',
  accentDark: '#00D4E8',
  accentLight: '#80F4FF',

  // Secondary — Yellow highlight
  secondary: '#FFE600',
  secondaryDark: '#E6CF00',
  secondaryLight: '#FFF04D',

  // Neutrals — Warm beige base
  background: '#F4F0EA',
  backgroundWarm: '#EDE8E0',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text hierarchy — Black-based
  text: '#000000',
  textSecondary: '#333333',
  textMuted: '#666666',
  textLight: '#999999',
  textInverse: '#FFFFFF',

  // UI elements — Bold black borders
  border: '#000000',
  borderLight: '#E5E5E5',
  divider: '#E5E5E5',

  // Semantic
  success: '#4CAF50',
  successLight: '#D1FAE5',
  warning: '#F9A825',
  warningLight: '#FEF3C7',
  error: '#FF3B30',
  errorLight: '#FFE4E4',
  info: '#007AFF',
  infoLight: '#E3F2FD',

  // Common
  white: '#FFFFFF',
  black: '#000000',

  // Shadows — brutalist style uses solid black
  shadow: '#000000',
  shadowStrong: '#000000',

  // Gradients (for LinearGradient)
  gradient: {
    primary: ['#FF2A5F', '#E0224F'] as readonly [string, string],
    accent: ['#4DF0FF', '#00D4E8'] as readonly [string, string],
    dark: ['#1A1A1A', '#333333'] as readonly [string, string],
    softPink: ['#FFF0F3', '#FFE4EC'] as readonly [string, string],
    softPurple: ['#F0F0FF', '#E8E4F8'] as readonly [string, string],
  },

  // Booking status colors
  booking: {
    pending: '#FFE600',
    confirmed: '#4CAF50',
    active: '#4DF0FF',
    completed: '#999999',
    cancelled: '#FF3B30',
  },

  // Badge colors — Neo-Brutalism bold badges
  badge: {
    pink: { bg: '#FFF0F3', border: '#000000', text: '#FF2A5F' },
    purple: { bg: '#F0F0FF', border: '#000000', text: '#635BFF' },
    gray: { bg: '#F0F0F0', border: '#000000', text: '#666666' },
    success: { bg: '#D1FAE5', border: '#000000', text: '#4CAF50' },
    warning: { bg: '#FEF3C7', border: '#000000', text: '#F9A825' },
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

// Standard page padding
export const PAGE_PADDING = 20;

// Border radius scale — Neo-Brutalism (smaller, chunkier)
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 16,
  full: 9999,
};

// Border widths — Neo-Brutalism uses thick borders
export const borderWidth = {
  thin: 2,
  normal: 3,
  thick: 4,
};

// Neo-Brutalism accent backgrounds
export const brutalist = {
  cyan: '#4DF0FF',
  yellow: '#FFE600',
  pink: '#FF2A5F',
  black: '#000000',
  beige: '#F4F0EA',
};

// Typography scale
// Font: Space Grotesk (everything — headings, body, buttons)
export const typography = {
  // Font families
  fonts: {
    heading: 'SpaceGrotesk_700Bold',
    headingMedium: 'SpaceGrotesk_600SemiBold',
    headingItalic: 'SpaceGrotesk_700Bold',
    body: 'SpaceGrotesk_400Regular',
    bodyMedium: 'SpaceGrotesk_500Medium',
    bodySemiBold: 'SpaceGrotesk_600SemiBold',
    bodyBold: 'SpaceGrotesk_700Bold',
  },

  // Size scale
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 24,
    xxl: 32,
    display: 42,
  },

  // Pre-defined styles
  display: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 42,
    fontWeight: '700' as const,
    lineHeight: 46,
    letterSpacing: -1,
  },
  h1: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 38,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 30,
  },
  h3: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 18,
    fontWeight: '600' as const,
    lineHeight: 24,
  },
  body: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodyMedium: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 15,
    fontWeight: '500' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontFamily: 'SpaceGrotesk_500Medium',
    fontSize: 12,
    fontWeight: '500' as const,
    lineHeight: 16,
  },
  label: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    fontWeight: '700' as const,
    lineHeight: 14,
    letterSpacing: 1,
    textTransform: 'uppercase' as const,
  },
  button: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    fontWeight: '700' as const,
    lineHeight: 20,
    textTransform: 'uppercase' as const,
  },
};

// Touch target sizes (Apple HIG minimum 44pt)
export const touchTargets = {
  minimum: 44,
  comfortable: 48,
  large: 56,
};

// Shadow presets — Neo-Brutalism offset solid shadows
export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
  },
  // Button shadows — bold offset
  button: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonPink: {
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
};

// Animation durations
export const animation = {
  fast: 150,
  normal: 250,
  slow: 400,
};

// Theme hook — single Neo-Brutalism theme
export function useTheme() {
  return {
    colors,
    isDark: false,
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
