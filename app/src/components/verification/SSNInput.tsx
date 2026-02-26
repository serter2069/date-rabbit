import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { colors, spacing, borderRadius, typography, touchTargets } from '../../constants/theme';

interface SSNInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

function DigitBox({
  digit,
  isFocused,
  isMasked,
  onPress,
}: {
  digit: string;
  isFocused: boolean;
  isMasked: boolean;
  onPress: () => void;
}) {
  const focusAnim = useSharedValue(isFocused ? 1 : 0);

  React.useEffect(() => {
    focusAnim.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused, focusAnim]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      focusAnim.value,
      [0, 1],
      [colors.border, colors.primary]
    ),
    borderWidth: isFocused ? 1.5 : 1,
  }));

  return (
    <Pressable onPress={onPress} style={styles.digitPressable}>
      <AnimatedView style={[styles.digitBox, animatedStyle]}>
        {digit ? (
          isMasked ? (
            <View style={styles.maskedDot} />
          ) : (
            <Text style={styles.digitText}>{digit}</Text>
          )
        ) : isFocused ? (
          <View style={styles.cursor} />
        ) : null}
      </AnimatedView>
    </Pressable>
  );
}

export function SSNInput({ value, onChange, error }: SSNInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const [isMasked, setIsMasked] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const digits = value.padEnd(4, '').slice(0, 4).split('');
  const currentIndex = Math.min(value.length, 3);

  const handlePress = (index: number) => {
    inputRef.current?.focus();
    setFocusedIndex(index);
  };

  const handleFocus = () => {
    setFocusedIndex(value.length < 4 ? value.length : 3);
  };

  const handleBlur = () => {
    setFocusedIndex(null);
    if (value.length > 0) {
      setIsMasked(true);
    }
  };

  const handleChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '').slice(0, 4);
    onChange(cleaned);
    setIsMasked(false);
    if (cleaned.length === 4) {
      inputRef.current?.blur();
      setTimeout(() => setIsMasked(true), 500);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error ? styles.labelError : null]}>
        Last 4 digits of SSN
      </Text>

      <View style={styles.boxesRow}>
        {[0, 1, 2, 3].map((i) => (
          <DigitBox
            key={i}
            digit={digits[i] || ''}
            isFocused={focusedIndex === i}
            isMasked={isMasked && !!digits[i]}
            onPress={() => handlePress(i)}
          />
        ))}
      </View>

      {/* Hidden TextInput to capture keyboard */}
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        keyboardType="numeric"
        maxLength={4}
        style={styles.hiddenInput}
        caretHidden
        contextMenuHidden
        selectTextOnFocus={false}
        {...(Platform.OS === 'web' ? {} : {})}
      />

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Text style={styles.hint}>
        This is used for identity verification only
      </Text>
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
    marginBottom: spacing.sm,
  },
  labelError: {
    color: colors.error,
  },
  boxesRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  digitPressable: {
    minHeight: touchTargets.minimum,
    minWidth: touchTargets.minimum,
    justifyContent: 'center',
    alignItems: 'center',
  },
  digitBox: {
    width: 56,
    height: 64,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitText: {
    fontFamily: typography.fonts.bodyBold,
    fontSize: typography.sizes.xl,
    color: colors.text,
  },
  maskedDot: {
    width: 14,
    height: 14,
    borderRadius: borderRadius.full,
    backgroundColor: colors.text,
  },
  cursor: {
    width: 2,
    height: 28,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    top: -100,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
  hint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
});

export default SSNInput;
