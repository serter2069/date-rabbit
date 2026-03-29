import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { Icon } from './Icon';
import { colors, spacing, typography, borderRadius, borderWidth } from '../constants/theme';

export interface TourStep {
  icon: string;
  title: string;
  description: string;
  iconColor?: string;
}

interface OnboardingTourProps {
  visible: boolean;
  steps: TourStep[];
  onDone: () => void;
}

export function OnboardingTour({ visible, steps, onDone }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { width: screenWidth } = useWindowDimensions();
  const cardWidth = Math.min(screenWidth - 48, 360);

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      setCurrentStep(0);
      onDone();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSkip = () => {
    setCurrentStep(0);
    onDone();
  };

  if (!step) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={[styles.card, { width: cardWidth }]}>
          {/* Step counter + skip */}
          <View style={styles.topRow}>
            <Text style={styles.stepCounter}>
              {currentStep + 1} / {steps.length}
            </Text>
            {!isLast && (
              <TouchableOpacity
                onPress={handleSkip}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityLabel="Skip tour"
                accessibilityRole="button"
              >
                <Text style={styles.skipText}>Skip</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Icon */}
          <View style={[styles.iconCircle, { backgroundColor: (step.iconColor || colors.primary) + '15' }]}>
            <Icon
              name={step.icon as any}
              size={36}
              color={step.iconColor || colors.primary}
            />
          </View>

          {/* Content */}
          <Text style={styles.title}>{step.title}</Text>
          <Text style={styles.description}>{step.description}</Text>

          {/* Dots */}
          <View style={styles.dots}>
            {steps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.dotActive,
                ]}
              />
            ))}
          </View>

          {/* Button */}
          <TouchableOpacity
            style={styles.button}
            activeOpacity={0.8}
            onPress={handleNext}
            accessibilityLabel={isLast ? 'Get started' : 'Next step'}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>
              {isLast ? "Let's Go!" : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

// Tour step presets per role
export const SEEKER_TOUR_STEPS: TourStep[] = [
  {
    icon: 'search',
    title: 'Browse Companions',
    description: 'Explore verified companions near you. Filter by activity, price, and availability to find your perfect match.',
    iconColor: colors.primary,
  },
  {
    icon: 'shield',
    title: 'Verified Profiles',
    description: 'Look for the verified badge. All companions go through a background check for your safety.',
    iconColor: colors.success,
  },
  {
    icon: 'calendar',
    title: 'Book a Date',
    description: 'Pick a date, choose an activity, and send a booking request. You only pay when the companion confirms.',
    iconColor: colors.accent,
  },
  {
    icon: 'lock',
    title: 'Safe & Secure',
    description: 'All payments are handled securely through the platform. Your personal info stays private.',
    iconColor: colors.info,
  },
];

export const COMPANION_TOUR_STEPS: TourStep[] = [
  {
    icon: 'user',
    title: 'Complete Your Profile',
    description: 'Add great photos and a bio that stands out. A complete profile gets 3x more booking requests.',
    iconColor: colors.primary,
  },
  {
    icon: 'shield',
    title: 'Get Verified',
    description: 'Complete a quick background check to earn the verified badge. Verified companions earn more.',
    iconColor: colors.success,
  },
  {
    icon: 'calendar',
    title: 'Manage Bookings',
    description: 'Accept or decline requests from your dashboard. Set your availability so seekers know when you are free.',
    iconColor: colors.accent,
  },
  {
    icon: 'credit-card',
    title: 'Earn Money',
    description: 'Set your hourly rate and get paid securely after each date. Track your earnings in real time.',
    iconColor: colors.warning,
  },
];

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: borderWidth.normal,
    borderColor: colors.black,
    padding: spacing.lg,
    alignItems: 'center',
    // Neo-brutalism offset shadow
    shadowColor: colors.black,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  stepCounter: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  skipText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderLight,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
    borderColor: colors.black,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.black,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    color: colors.textInverse,
  },
});
