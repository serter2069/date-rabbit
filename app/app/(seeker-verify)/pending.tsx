import React, { useEffect, useRef } from 'react';
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
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { useVerificationStore } from '../../src/store/verificationStore';
import { colors, spacing, typography, borderRadius, PAGE_PADDING } from '../../src/constants/theme';

const IS_DEV = __DEV__;

export default function SeekerVerifyPendingScreen() {
  const insets = useSafeAreaInsets();
  const { fetchStatus, status } = useVerificationStore();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const rotation = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
  }, [rotation, pulse]);

  useEffect(() => {
    if (!IS_DEV) return;

    pollingRef.current = setInterval(async () => {
      await fetchStatus();
      const currentStatus = useVerificationStore.getState().status;
      if (currentStatus === 'approved') {
        if (pollingRef.current) clearInterval(pollingRef.current);
        router.replace('/(seeker-verify)/approved');
      }
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [fetchStatus]);

  useEffect(() => {
    if (status === 'approved') {
      if (pollingRef.current) clearInterval(pollingRef.current);
      router.replace('/(seeker-verify)/approved');
    }
  }, [status]);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconOuterRing, pulseStyle]}>
          <Animated.View style={[styles.iconInnerRing, rotateStyle]}>
            <View style={styles.iconCenter}>
              <Icon name="clock" size={40} color={colors.primary} />
            </View>
          </Animated.View>
        </Animated.View>

        <Text style={styles.title}>Verification Under Review</Text>
        <Text style={styles.description}>
          We'll notify you when your verification is complete. This usually takes a few minutes.
        </Text>

        {IS_DEV && (
          <View style={styles.devBadge}>
            <Icon name="info" size={14} color={colors.accent} />
            <Text style={styles.devText}>DEV: Auto-refreshing every 2 seconds</Text>
          </View>
        )}

        <View style={styles.statusSteps}>
          <View style={styles.statusStep}>
            <View style={[styles.statusDot, styles.statusDotDone]} />
            <Text style={styles.statusLabel}>Submitted</Text>
          </View>
          <View style={styles.statusConnector} />
          <View style={styles.statusStep}>
            <View style={[styles.statusDot, styles.statusDotActive]} />
            <Text style={[styles.statusLabel, styles.statusLabelActive]}>Under Review</Text>
          </View>
          <View style={styles.statusConnector} />
          <View style={styles.statusStep}>
            <View style={styles.statusDot} />
            <Text style={styles.statusLabel}>Approved</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingHorizontal: PAGE_PADDING }]}>
        <Button
          title="Continue to App"
          onPress={() => {}}
          variant="outline"
          fullWidth
          size="lg"
          disabled
          testID="seeker-pending-continue-btn"
        />
        <Text style={styles.waitNote}>
          Available once your verification is approved
        </Text>
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
  iconOuterRing: {
    width: 140,
    height: 140,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    borderWidth: 3,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  iconInnerRing: {
    width: 110,
    height: 110,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCenter: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
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
  devBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.black,
    borderRadius: borderRadius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  devText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.black,
  },
  statusSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  statusStep: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  statusDot: {
    width: 16,
    height: 16,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  statusDotDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusDotActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  statusConnector: {
    width: 48,
    height: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  statusLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  statusLabelActive: {
    fontFamily: typography.fonts.bodyMedium,
    color: colors.accent,
  },
  footer: {
    paddingBottom: spacing.xl,
  },
  waitNote: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
