import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  labels?: string[];
}

function StepDot({
  index,
  currentStep,
  totalSteps,
  label,
}: {
  index: number;
  currentStep: number;
  totalSteps: number;
  label?: string;
}) {
  const scale = useSharedValue(1);
  const isCompleted = index < currentStep;
  const isCurrent = index === currentStep;

  useEffect(() => {
    if (isCurrent) {
      scale.value = withSpring(1.2, { damping: 12, stiffness: 200 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    }
  }, [isCurrent, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotColor = isCompleted
    ? colors.primary
    : isCurrent
    ? colors.accent
    : colors.surface;

  const dotBorderColor = isCompleted
    ? colors.primary
    : isCurrent
    ? colors.accent
    : colors.border;

  return (
    <View style={styles.stepContainer}>
      <Animated.View
        style={[
          styles.dot,
          { backgroundColor: dotColor, borderColor: dotBorderColor },
          animatedStyle,
        ]}
      >
        {isCompleted && (
          <View style={styles.checkMark}>
            <View style={styles.checkLeft} />
            <View style={styles.checkRight} />
          </View>
        )}
        {isCurrent && <View style={styles.currentInner} />}
      </Animated.View>
      {label && (
        <Text
          style={[
            styles.stepLabel,
            isCompleted && styles.stepLabelCompleted,
            isCurrent && styles.stepLabelCurrent,
          ]}
          numberOfLines={1}
        >
          {label}
        </Text>
      )}
    </View>
  );
}

function ConnectorLine({
  index,
  currentStep,
}: {
  index: number;
  currentStep: number;
}) {
  const width = useSharedValue(0);
  const isCompleted = index < currentStep;

  useEffect(() => {
    width.value = withTiming(isCompleted ? 100 : 0, { duration: 300 });
  }, [isCompleted, width]);

  const animatedFill = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.connectorContainer}>
      <View style={styles.connectorTrack} />
      <Animated.View style={[styles.connectorFill, animatedFill]} />
    </View>
  );
}

export function ProgressBar({ currentStep, totalSteps, labels }: ProgressBarProps) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {Array.from({ length: totalSteps }, (_, i) => (
          <React.Fragment key={i}>
            <StepDot
              index={i}
              currentStep={currentStep}
              totalSteps={totalSteps}
              label={labels?.[i]}
            />
            {i < totalSteps - 1 && (
              <ConnectorLine index={i} currentStep={currentStep} />
            )}
          </React.Fragment>
        ))}
      </View>
      <Text style={styles.counter}>
        Step {Math.min(currentStep + 1, totalSteps)} of {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentInner: {
    width: 10,
    height: 10,
    borderRadius: borderRadius.full,
    backgroundColor: colors.white,
  },
  checkMark: {
    width: 12,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkLeft: {
    position: 'absolute',
    width: 4,
    height: 7,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    borderColor: colors.white,
    transform: [{ rotate: '-45deg' }, { translateX: -1 }],
  },
  checkRight: {
    display: 'none',
  },
  connectorContainer: {
    flex: 1,
    height: 2,
    marginHorizontal: spacing.xs,
    position: 'relative',
  },
  connectorTrack: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
  },
  connectorFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  stepLabel: {
    marginTop: spacing.xs,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textLight,
    maxWidth: 60,
    textAlign: 'center',
  },
  stepLabelCompleted: {
    color: colors.primary,
  },
  stepLabelCurrent: {
    color: colors.accent,
    fontFamily: typography.fonts.bodyMedium,
  },
  counter: {
    marginTop: spacing.sm,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

export default ProgressBar;
