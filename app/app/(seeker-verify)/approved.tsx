import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { useAuthStore } from '../../src/store/authStore';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function SeekerVerifyApprovedScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.5);
  const ringOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);

  useEffect(() => {
    ringScale.value = withSpring(1, { damping: 12, stiffness: 150 });
    ringOpacity.value = withTiming(1, { duration: 400 });

    checkScale.value = withDelay(
      300,
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    checkOpacity.value = withDelay(300, withTiming(1, { duration: 300 }));

    textOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    textTranslateY.value = withDelay(
      600,
      withSpring(0, { damping: 15, stiffness: 200 })
    );
  }, [checkScale, checkOpacity, ringScale, ringOpacity, textOpacity, textTranslateY]);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const handleGetStarted = () => {
    const role = user?.role;
    if (role === 'companion') {
      router.replace('/female');
    } else {
      router.replace('/male');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.ringContainer, ringStyle]}>
          <Animated.View style={[styles.checkContainer, checkStyle]}>
            <Icon name="check" size={48} color={colors.white} strokeWidth={2.5} />
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.title}>You're Verified!</Text>
          <Text style={styles.description}>
            Your identity has been verified. You can now use all features.
          </Text>

          <View style={styles.featuresRow}>
            <View style={styles.featureItem}>
              <Icon name="star" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Browse dates</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="message-circle" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Message</Text>
            </View>
            <View style={styles.featureItem}>
              <Icon name="calendar" size={20} color={colors.primary} />
              <Text style={styles.featureText}>Book dates</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      <View style={[styles.footer, { paddingHorizontal: spacing.lg + 4 }]}>
        <Button
          title="Get Started"
          onPress={handleGetStarted}
          variant="pink"
          fullWidth
          size="lg"
          testID="seeker-approved-get-started-btn"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  ringContainer: {
    width: 120,
    height: 120,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 8,
  },
  checkContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  featuresRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  featureItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
});
