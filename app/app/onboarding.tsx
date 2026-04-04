import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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

const COMPANION_SLIDES: SlideItem[] = [
  {
    id: '1',
    title: 'Your attention is worth money',
    description: 'Set your availability and let seekers come to you',
    IconComponent: Heart,
  },
  {
    id: '2',
    title: 'Set your price',
    description: 'You decide your rates — hourly, by date, or by event',
    IconComponent: DollarSign,
  },
  {
    id: '3',
    title: 'Get paid via Stripe',
    description: 'Secure, automatic payouts after every confirmed date',
    IconComponent: Sparkles,
  },
  {
    id: '4',
    title: 'Meet verified seekers',
    description: 'Only verified, identity-checked men can book you',
    IconComponent: Shield,
  },
];

const SEEKER_SLIDES: SlideItem[] = [
  {
    id: '1',
    title: 'Find a companion',
    description: 'Browse verified girls available in your city right now',
    IconComponent: Heart,
  },
  {
    id: '2',
    title: 'Verified companions',
    description: 'Every profile is identity-checked — no fakes, no surprises',
    IconComponent: Shield,
  },
  {
    id: '3',
    title: 'Book easily',
    description: 'Pick a girl, choose a time, and confirm in seconds',
    IconComponent: Sparkles,
  },
  {
    id: '4',
    title: 'Safe & secure',
    description: 'Stripe handles payments. Your data stays private.',
    IconComponent: DollarSign,
  },
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { setOnboardingSeen } = useAuthStore();
  const { roleHint } = useLocalSearchParams<{ roleHint?: string }>();

  // Normalize roleHint — useLocalSearchParams can return string | string[]
  const hint = Array.isArray(roleHint) ? roleHint[0] : roleHint;
  const activeSlides = hint === 'companion' ? COMPANION_SLIDES : SEEKER_SLIDES;
  const role = hint === 'companion' ? 'companion' : 'seeker';

  const handleNext = () => {
    if (currentIndex < activeSlides.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = () => {
    setOnboardingSeen();
    router.replace(`/(auth)/login?role=${role}` as any);
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  const currentSlide = activeSlides[currentIndex];
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
        {activeSlides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setCurrentIndex(index)}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
            accessibilityLabel={`Go to slide ${index + 1}`}
            accessibilityRole="button"
            accessibilityState={{ selected: index === currentIndex }}
          />
        ))}
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title={currentIndex === activeSlides.length - 1 ? "Get Started" : "Next"}
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
