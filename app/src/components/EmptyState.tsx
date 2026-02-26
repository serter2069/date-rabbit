import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { Icon, IconName } from './Icon';
import { Button } from './Button';
import { useTheme } from '../constants/theme';

interface EmptyStateProps {
  icon: IconName;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  style,
}: EmptyStateProps) {
  const { colors, spacing, typography } = useTheme();

  // Animation values
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    // Subtle floating animation
    translateY.value = withRepeat(
      withSequence(
        withTiming(-8, { duration: 1500 }),
        withTiming(0, { duration: 1500 })
      ),
      -1,
      true
    );

    // Subtle pulse
    scale.value = withRepeat(
      withSequence(
        withDelay(500, withTiming(1.05, { duration: 1000 })),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl * 2,
      paddingHorizontal: spacing.lg,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.secondary,
      borderWidth: 3,
      borderColor: colors.black,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontFamily: typography.fonts.heading,
      fontSize: typography.sizes.lg,
      fontWeight: '700',
      color: colors.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
      textTransform: 'uppercase',
    },
    description: {
      fontFamily: typography.fonts.body,
      fontSize: typography.sizes.sm,
      color: colors.textSecondary,
      textAlign: 'center',
      maxWidth: 280,
      lineHeight: 22,
    },
    button: {
      marginTop: spacing.lg,
    },
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
        <Icon name={icon} size={48} color={colors.primary} />
      </Animated.View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="outline"
          size="sm"
          style={styles.button}
        />
      )}
    </View>
  );
}
