import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Heart, Shield, DollarSign, Sparkles, type LucideIcon } from 'lucide-react-native';
import { useAuthStore } from '../src/store/authStore';
import { Button } from '../src/components/Button';
import { colors, spacing, typography } from '../src/constants/theme';

interface SlideItem {
  id: string;
  title: string;
  description: string;
  IconComponent: LucideIcon;
}

const slides: SlideItem[] = [
  {
    id: '1',
    title: 'Find Your Perfect Date',
    description: 'Connect with verified, interesting people for memorable experiences',
    IconComponent: Heart,
  },
  {
    id: '2',
    title: 'Safe & Secure',
    description: 'All users are verified. Your safety is our top priority',
    IconComponent: Shield,
  },
  {
    id: '3',
    title: 'Earn While Dating',
    description: 'Set your own rates and schedule. You\'re in control',
    IconComponent: DollarSign,
  },
  {
    id: '4',
    title: 'Premium Experiences',
    description: 'Book amazing dates at top restaurants, events, and more',
    IconComponent: Sparkles,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setOnboardingSeen } = useAuthStore();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    setOnboardingSeen();
    // Navigate to auth welcome (login) page after onboarding
    router.replace('/(auth)/welcome');
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const currentSlide = slides[currentIndex];
  const SlideIcon = currentSlide.IconComponent;

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
        <View style={styles.iconContainer}>
          <SlideIcon size={56} color={colors.primary} strokeWidth={1.5} />
        </View>
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
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    borderWidth: 2,
    borderColor: colors.border,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontFamily: typography.fonts.body,
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
