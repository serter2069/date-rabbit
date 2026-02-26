import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Card } from '../Card';
import { Icon } from '../Icon';
import { colors, spacing, borderRadius, typography, touchTargets } from '../../constants/theme';

interface ConsentFormProps {
  agreed: boolean;
  onToggle: (agreed: boolean) => void;
}

const CONSENT_TEXT = `Background Check Authorization

By checking this box, you authorize DateRabbit and its designated third-party background check providers to conduct a background investigation on you. This may include, but is not limited to, identity verification, criminal history, sex offender registry checks, and other public records.

Data Usage and Privacy

The personal information you provide, including your name, date of birth, government-issued ID, and Social Security Number (last 4 digits), will be used solely for the purpose of identity verification and background screening. This information is encrypted, securely stored, and will not be shared with other users of the platform.

Your personal data is processed in accordance with our Privacy Policy and applicable data protection laws. You may request deletion of your data at any time by contacting support@daterabbit.com.

Terms and Conditions

You confirm that:
• All information you have provided is accurate and truthful
• You are at least 18 years of age
• You consent to receiving the results of the background check as described above
• You understand that a failed background check may result in denial of access to the platform

Safety Commitment

DateRabbit is committed to creating a safe environment for all users. Background verification helps us maintain community standards and protect every member of our platform.

By proceeding, you acknowledge that you have read, understood, and agree to all of the above terms.`;

export function ConsentForm({ agreed, onToggle }: ConsentFormProps) {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isAtBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    if (isAtBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const canAgree = hasScrolledToBottom;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Consent & Authorization</Text>

      <Card variant="outlined" padding="sm" shadow="none" style={styles.card}>
        <ScrollView
          ref={scrollRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator
          onScroll={handleScroll}
          scrollEventThrottle={100}
        >
          <Text style={styles.consentText}>{CONSENT_TEXT}</Text>
          <View style={styles.scrollEndMarker} />
        </ScrollView>

        {!hasScrolledToBottom && (
          <View style={styles.scrollHintContainer}>
            <Icon name="arrow-down" size={16} color={colors.textMuted} />
            <Text style={styles.scrollHintText}>Scroll to read all terms</Text>
          </View>
        )}
      </Card>

      <TouchableOpacity
        style={[
          styles.checkboxRow,
          !canAgree && styles.checkboxRowDisabled,
        ]}
        onPress={() => canAgree && onToggle(!agreed)}
        activeOpacity={canAgree ? 0.7 : 1}
        disabled={!canAgree}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: agreed, disabled: !canAgree }}
      >
        <View
          style={[
            styles.checkbox,
            agreed && styles.checkboxChecked,
            !canAgree && styles.checkboxLocked,
          ]}
        >
          {agreed && <Icon name="check" size={14} color={colors.white} strokeWidth={3} />}
          {!canAgree && !agreed && (
            <Icon name="lock" size={12} color={colors.textLight} />
          )}
        </View>
        <View style={styles.checkboxLabelContainer}>
          <Text
            style={[
              styles.checkboxLabel,
              !canAgree && styles.checkboxLabelDisabled,
            ]}
          >
            I agree to the above terms and authorize the background check
          </Text>
          {!canAgree && (
            <Text style={styles.scrollToContinue}>
              Scroll to the bottom to enable
            </Text>
          )}
        </View>
      </TouchableOpacity>
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
  card: {
    marginBottom: spacing.sm,
    padding: 0,
  },
  scrollView: {
    maxHeight: 220,
    padding: spacing.md,
  },
  consentText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  scrollEndMarker: {
    height: spacing.md,
  },
  scrollHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  scrollHintText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    minHeight: touchTargets.minimum,
    paddingVertical: spacing.sm,
  },
  checkboxRowDisabled: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.xs + 2,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLocked: {
    backgroundColor: colors.surface,
  },
  checkboxLabelContainer: {
    flex: 1,
    gap: 2,
  },
  checkboxLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 20,
  },
  checkboxLabelDisabled: {
    color: colors.textMuted,
  },
  scrollToContinue: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.accent,
  },
});

export default ConsentForm;
