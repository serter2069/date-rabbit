export const colors = {
  bg: '#F4F0EA',
  pink: '#FF2A5F',
  cyan: '#4DF0FF',
  yellow: '#FFE600',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#8A8A8A',
  grayLight: '#D4D0CA',
} as const;

export const fonts = {
  family: 'SpaceGrotesk',
  weights: {
    medium: '500' as const,
    extrabold: '800' as const,
    black: '900' as const,
  },
};

export const borders = {
  thin: '3px solid #000',
  thick: '4px solid #000',
};

export const shadows = {
  small: '4px 4px 0px #000',
  large: '8px 8px 0px #000',
};

export const radii = {
  sm: 8,
  md: 16,
  lg: 40,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;
