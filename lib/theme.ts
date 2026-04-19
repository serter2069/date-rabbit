// lib/theme.ts — DateRabbit design system
// Target: product
// Generated: 2026-04-18 by /brand
// Domain: Dating marketplace with paid offline dates + ID verification
// Personality: Warm. Premium. Trustworthy.
// Harmony: Analogous (338° rose + 18° coral) — cohesive warmth throughout
// Differentiation: NOT Tinder red (0°), NOT Bumble yellow (55°), NOT Seeking gold (45°)

export const colors = {
  // Brand (6) — [Domain: Dating] [Harmony: Analogous] [Hue: 338° rose]
  primary: '#C52660',       // hsl(338, 68%, 46%) — Deep rose, warm passion + premium. White contrast: 5.47:1 ✓
  accent: '#E95C20',        // hsl(18, 82%, 52%) — Warm coral, CTAs/highlights. Analogous +40° from primary. White: 3.37:1 (UI-only)
  background: '#FBF9FA',    // hsl(340, 20%, 98%) — Near-white with rose tint
  surface: '#FFFFFF',       // Pure white for cards/modals
  text: '#201317',          // hsl(340, 25%, 10%) — Near-black with rose tint. 16:1 on background ✓
  textSecondary: '#81656E', // hsl(340, 12%, 45%) — Muted rose-gray. 4.72:1 on background ✓
  // Semantic (3) — universal, not brand-specific
  error: '#DC2626',         // Red 600
  success: '#059669',       // Emerald 600
  warning: '#D97706',       // Amber 600
} as const

// Tailwind mapping — for className usage
export const tw = {
  primary: 'bg-[#C52660]',
  primaryText: 'text-[#C52660]',
  primaryBorder: 'border-[#C52660]',
  accent: 'bg-[#E95C20]',
  accentText: 'text-[#E95C20]',
  background: 'bg-[#FBF9FA]',
  surface: 'bg-white',
  text: 'text-[#201317]',
  textSecondary: 'text-[#81656E]',
  error: 'text-[#DC2626]',
  errorBg: 'bg-[#DC2626]',
  success: 'text-[#059669]',
  successBg: 'bg-[#059669]',
  warning: 'text-[#D97706]',
  warningBg: 'bg-[#D97706]',
} as const

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const

// FONT FAMILY — Plus Jakarta Sans (warm, humanist, lifestyle) from /brand whitelist
// Loaded via expo-font in _layout.tsx
export const fonts = {
  display: 'PlusJakartaSans-Bold',
  body: 'PlusJakartaSans-Regular',
  bodyMedium: 'PlusJakartaSans-Medium',
  bodySemibold: 'PlusJakartaSans-SemiBold',
  weightsDisplay: [700, 800],
  weightsBody: [400, 500, 600, 700],
} as const

export const typography = {
  // Strict scale: 12/14/16/18/24/32/40. Line-height snaps to 4px grid.
  caption: 'text-xs leading-4',                         // 12/16
  bodySmall: 'text-sm leading-5',                       // 14/20
  body: 'text-base leading-6',                          // 16/24 — MIN for readable body
  subtitle: 'text-lg leading-7 font-semibold',          // 18/28
  heading: 'text-2xl leading-8 font-bold',              // 24/32
  title: 'text-3xl leading-10 font-bold',               // 30/40
  display: 'text-4xl leading-[48px] font-extrabold',    // 40/48 — hero
} as const

export const radius = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
} as const
