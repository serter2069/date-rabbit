import React from 'react';
import { Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Pressable, Platform, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, borderRadius, spacing, typography, touchTargets, shadows, borderWidth } from '../constants/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'pink' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  label?: string; // Small label above title
  testID?: string;
  haptic?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  icon,
  label,
  testID,
  haptic = true,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (haptic && !disabled && !loading && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const getButtonStyles = (): ViewStyle[] => {
    const baseStyles: ViewStyle[] = [
      styles.base,
      styles[`size_${size}` as keyof typeof styles] as ViewStyle,
      fullWidth && styles.fullWidth,
      disabled && styles.disabled,
    ].filter(Boolean) as ViewStyle[];

    // Variant-specific styles (except for gradient variants)
    if (variant === 'secondary') {
      baseStyles.push(styles.secondary);
    } else if (variant === 'outline') {
      baseStyles.push(styles.outline);
    } else if (variant === 'ghost') {
      baseStyles.push(styles.ghost);
    }

    // Add shadow for primary/pink buttons
    if ((variant === 'primary' || variant === 'pink') && !disabled) {
      baseStyles.push(variant === 'pink' ? shadows.buttonPink : shadows.button);
    }

    if (style) baseStyles.push(style);
    return baseStyles;
  };

  const textStyles = [
    styles.text,
    styles[`text_${variant}` as keyof typeof styles],
    styles[`textSize_${size}` as keyof typeof styles],
    disabled && styles.textDisabled,
    textStyle,
  ];

  const labelStyles = [
    styles.label,
    variant === 'primary' && styles.labelLight,
    variant === 'pink' && styles.labelLight,
    variant === 'secondary' && styles.labelDark,
  ];

  const renderContent = () => (
    <>
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'outline' || variant === 'ghost' || variant === 'secondary'
              ? colors.text
              : colors.white
          }
        />
      ) : (
        <View style={styles.contentContainer}>
          {label && <Text style={labelStyles}>{label}</Text>}
          <View style={styles.titleRow}>
            {icon}
            <Text style={textStyles}>{title}</Text>
          </View>
        </View>
      )}
    </>
  );

  // Gradient button wrapper for primary and pink variants
  const renderGradientButton = (gradientColors: readonly [string, string, ...string[]]) => {
    if (Platform.OS === 'web') {
      return (
        <TouchableOpacity
          testID={testID}
          onPress={handlePress}
          disabled={disabled || loading}
          activeOpacity={0.85}
          style={[styles.gradientWrapper, fullWidth && styles.fullWidth]}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[getButtonStyles(), styles.gradient]}
          >
            {renderContent()}
          </LinearGradient>
        </TouchableOpacity>
      );
    }

    return (
      <AnimatedPressable
        testID={testID}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[styles.gradientWrapper, fullWidth && styles.fullWidth, animatedStyle]}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[getButtonStyles(), styles.gradient]}
        >
          {renderContent()}
        </LinearGradient>
      </AnimatedPressable>
    );
  };

  // Primary button with dark gradient
  if (variant === 'primary') {
    return renderGradientButton(colors.gradient.dark as readonly [string, string, ...string[]]);
  }

  // Pink button with pink gradient
  if (variant === 'pink') {
    return renderGradientButton(colors.gradient.primary as readonly [string, string, ...string[]]);
  }

  // On web, use plain TouchableOpacity
  if (Platform.OS === 'web') {
    return (
      <TouchableOpacity
        testID={testID}
        style={getButtonStyles()}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {renderContent()}
      </TouchableOpacity>
    );
  }

  // On native, use animated pressable with haptics
  return (
    <AnimatedPressable
      testID={testID}
      style={[getButtonStyles(), animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
    >
      {renderContent()}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
    minHeight: touchTargets.minimum,
  },

  gradientWrapper: {
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.normal,
    borderColor: colors.black,
    overflow: 'hidden',
  },

  gradient: {
    overflow: 'hidden',
  },

  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },

  // Variant styles
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.black,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: borderWidth.normal,
    borderColor: colors.black,
  },
  ghost: {
    backgroundColor: 'transparent',
  },

  // Size styles
  size_sm: {
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md + 4,
    minHeight: touchTargets.minimum,
    borderRadius: borderRadius.md,
  },
  size_md: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    minHeight: touchTargets.comfortable,
    borderRadius: borderRadius.lg,
  },
  size_lg: {
    paddingVertical: spacing.lg - 4,
    paddingHorizontal: spacing.xl + 8,
    minHeight: touchTargets.large,
    borderRadius: borderRadius.lg,
  },

  fullWidth: {
    width: '100%',
  },

  disabled: {
    opacity: 0.5,
  },

  // Text styles
  text: {
    fontFamily: typography.fonts.bodyBold,
    fontWeight: '700',
    fontSize: typography.sizes.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  text_primary: {
    color: colors.white,
  },
  text_pink: {
    color: colors.white,
  },
  text_secondary: {
    color: colors.text,
  },
  text_outline: {
    color: colors.text,
  },
  text_ghost: {
    color: colors.textMuted,
  },

  textSize_sm: {
    fontSize: typography.sizes.sm,
  },
  textSize_md: {
    fontSize: typography.sizes.md,
  },
  textSize_lg: {
    fontSize: typography.sizes.lg,
  },

  textDisabled: {
    color: colors.textLight,
  },

  // Label styles (small text above title)
  label: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    fontWeight: '400',
    marginBottom: 2,
  },
  labelLight: {
    color: colors.textMuted,
  },
  labelDark: {
    color: colors.textLight,
  },
});
