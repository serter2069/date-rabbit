import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, borderRadius, spacing, typography } from '../constants/theme';

const AnimatedView = Animated.createAnimatedComponent(View);

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: ViewStyle;
  variant?: 'default' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  variant = 'default',
  size = 'md',
  disabled = false,
  onFocus,
  onBlur,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusAnimation = useSharedValue(0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 200 });
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 200 });
    onBlur?.(e);
  };

  const animatedBorderStyle = useAnimatedStyle(() => {
    const borderColor = error
      ? colors.error
      : interpolateColor(
          focusAnimation.value,
          [0, 1],
          [colors.border, colors.primary]
        );

    return {
      borderColor,
      borderWidth: error || focusAnimation.value > 0 ? 1.5 : 1,
    };
  });

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: spacing.sm + 2,
          paddingHorizontal: spacing.md,
          fontSize: typography.sizes.sm,
        };
      case 'lg':
        return {
          paddingVertical: spacing.md + 4,
          paddingHorizontal: spacing.lg,
          fontSize: typography.sizes.lg,
        };
      default:
        return {
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.md,
          fontSize: typography.sizes.md,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text style={[styles.label, error && styles.labelError]}>{label}</Text>
      )}

      <AnimatedView
        style={[
          styles.inputContainer,
          variant === 'filled' && styles.inputContainerFilled,
          disabled && styles.inputContainerDisabled,
          animatedBorderStyle,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}

        <TextInput
          {...textInputProps}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={[
            styles.input,
            {
              paddingVertical: sizeStyles.paddingVertical,
              paddingHorizontal: leftIcon ? spacing.sm : sizeStyles.paddingHorizontal,
              fontSize: sizeStyles.fontSize,
            },
            disabled && styles.inputDisabled,
            inputStyle,
          ]}
          placeholderTextColor={colors.textLight}
          selectionColor={colors.primary}
        />

        {rightIcon && (
          <Pressable
            onPress={onRightIconPress}
            style={styles.rightIcon}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </Pressable>
        )}
      </AnimatedView>

      {(error || hint) && (
        <Text style={[styles.hint, error && styles.hintError]}>
          {error || hint}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: spacing.xs + 2,
  },
  labelError: {
    color: colors.error,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  inputContainerFilled: {
    backgroundColor: colors.surface,
    borderColor: colors.surface,
  },
  inputContainerDisabled: {
    backgroundColor: colors.surface,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontFamily: typography.fonts.body,
    color: colors.text,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  inputDisabled: {
    color: colors.textLight,
  },
  leftIcon: {
    paddingLeft: spacing.md,
  },
  rightIcon: {
    paddingRight: spacing.md,
    paddingLeft: spacing.sm,
  },
  hint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  hintError: {
    color: colors.error,
  },
});
