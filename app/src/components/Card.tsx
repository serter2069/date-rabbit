import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, shadows } from '../constants/theme';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'gradient';
type CardShadow = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: keyof typeof spacing;
  variant?: CardVariant;
  shadow?: CardShadow;
  onPress?: () => void;
  testID?: string;
}

export function Card({
  children,
  style,
  padding = 'md',
  variant = 'default',
  shadow = 'sm',
  onPress,
  testID,
}: CardProps) {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'elevated':
        return colors.surfaceElevated;
      case 'outlined':
        return colors.background;
      case 'gradient':
        return 'transparent';
      default:
        return colors.surface;
    }
  };

  const getShadowStyle = (): ViewStyle => {
    if (variant === 'outlined' || shadow === 'none') return {};
    return shadows[shadow] as ViewStyle;
  };

  const cardStyles: ViewStyle[] = [
    styles.card,
    { padding: spacing[padding], backgroundColor: getBackgroundColor() },
    getShadowStyle(),
    variant === 'outlined' && styles.outlined,
    style as ViewStyle,
  ].filter(Boolean) as ViewStyle[];

  const content = variant === 'gradient' ? (
    <LinearGradient
      colors={colors.gradient.softPink as readonly [string, string, ...string[]]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { padding: spacing[padding] }, getShadowStyle(), style]}
    >
      {children}
    </LinearGradient>
  ) : (
    <View style={cardStyles} testID={testID}>
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        testID={testID}
        style={({ pressed }) => [
          styles.pressable,
          pressed && styles.pressed,
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  outlined: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  pressable: {
    borderRadius: borderRadius.lg,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
});
