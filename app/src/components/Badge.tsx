import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, borderRadius, spacing, typography } from '../constants/theme';

type BadgeVariant = 'pink' | 'purple' | 'gray' | 'success' | 'warning' | 'gradient';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
  text: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  text,
  variant = 'pink',
  size = 'md',
  icon,
  style,
  textStyle,
}: BadgeProps) {
  const getBadgeColors = () => {
    if (variant === 'gradient') {
      return null; // Handled by LinearGradient
    }
    return colors.badge[variant];
  };

  const getSizeStyles = (): { container: ViewStyle; text: TextStyle } => {
    switch (size) {
      case 'sm':
        return {
          container: {
            paddingVertical: spacing.xs,
            paddingHorizontal: spacing.sm + 2,
          },
          text: {
            fontSize: typography.sizes.xs,
          },
        };
      case 'lg':
        return {
          container: {
            paddingVertical: spacing.sm + 2,
            paddingHorizontal: spacing.md + 4,
          },
          text: {
            fontSize: typography.sizes.md,
          },
        };
      default:
        return {
          container: {
            paddingVertical: spacing.sm,
            paddingHorizontal: spacing.md,
          },
          text: {
            fontSize: typography.sizes.sm,
          },
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const badgeColors = getBadgeColors();

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={colors.gradient.softPink as readonly [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.badge,
          sizeStyles.container,
          styles.gradientBadge,
          style,
        ]}
      >
        {icon && <View style={styles.icon}>{icon}</View>}
        <Text
          style={[
            styles.text,
            sizeStyles.text,
            { color: colors.secondary },
            textStyle,
          ]}
        >
          {text}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.badge,
        sizeStyles.container,
        {
          backgroundColor: badgeColors?.bg,
          borderColor: badgeColors?.border,
        },
        style,
      ]}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text
        style={[
          styles.text,
          sizeStyles.text,
          { color: badgeColors?.text },
          textStyle,
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  gradientBadge: {
    borderWidth: 0,
  },
  icon: {
    marginRight: spacing.xs + 2,
  },
  text: {
    fontFamily: typography.fonts.bodyMedium,
    fontWeight: '500',
  },
});
