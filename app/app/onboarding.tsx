import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { Button } from '../src/components/Button';
import { colors, spacing, typography } from '../src/constants/theme';
import type { OnboardingSlide } from '../src/types';

const slides: OnboardingSlide[] = [
  {
    id: '1',
    title: 'Find Your Perfect Date',
    description: 'Connect with verified, interesting people for memorable experiences',
    icon: '💝',
  },
  {
    id: '2',
    title: 'Safe & Secure',
    description: 'All users are verified. Your safety is our top priority',
    icon: '🛡️',
  },
  {
    id: '3',
    title: 'Earn While Dating',
    description: 'Set your own rates and schedule. You\'re in control',
    icon: '💰',
  },
  {
    id: '4',
    title: 'Premium Experiences',
    description: 'Book amazing dates at top restaurants, events, and more',
    icon: '✨',
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setOnboardingSeen, user } = useAuthStore();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    setOnboardingSeen();
    // User is already authenticated at this point, go to main app based on role
    // In Expo Router, /male is equivalent to /male/index when index.tsx exists
    const isCompanion = user?.role === 'companion';
    router.replace(isCompanion ? '/female' : '/male');
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const currentSlide = slides[currentIndex];

  return (
    <View style={styles.container}>
      <View style={styles.skipContainer}>
        <Button
          title="Skip"
          onPress={handleSkip}
          variant="ghost"
          size="sm"
          testID="onboarding-skip"
        />
      </View>

      <View style={styles.slideContainer}>
        <Text style={styles.icon}>{currentSlide.icon}</Text>
        <Text style={styles.title}>{currentSlide.title}</Text>
        <Text style={styles.description}>{currentSlide.description}</Text>
      </View>

      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setCurrentIndex(index)}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={currentIndex === slides.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
          fullWidth
          size="lg"
          testID="onboarding-next"
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
  skipContainer: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 20 : 60,
    right: spacing.md,
    zIndex: 10,
  },
  slideContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
  },
  icon: {
    fontSize: 80,
    marginBottom: spacing.xl,
    ...Platform.select({
      web: {
        lineHeight: 100,
      },
    }),
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    opacity: 0.3,
  },
  dotActive: {
    width: 24,
    opacity: 1,
  },
  buttonContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
});
