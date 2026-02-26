import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { ProgressBar, VideoRecorder } from '../../src/components/verification';
import { useVerificationStore } from '../../src/store/verificationStore';
import { colors, spacing, typography, borderRadius } from '../../src/constants/theme';

const TIPS = [
  { icon: 'sparkles', text: 'Smile and be natural — clients want to know the real you' },
  { icon: 'check-circle', text: 'Share your interests and what makes you a great companion' },
  { icon: 'check-circle', text: 'Good lighting and a quiet background work best' },
];

export default function CompVideoScreen() {
  const insets = useSafeAreaInsets();
  const { uploadVideo, isLoading } = useVerificationStore();

  const [videoUri, setVideoUri] = useState<string | undefined>();
  const [videoError, setVideoError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!videoUri) {
      setVideoError('Please record your introduction video');
      return;
    }

    setSubmitting(true);
    const ok = await uploadVideo(videoUri);
    setSubmitting(false);

    if (!ok) {
      Alert.alert('Error', 'Failed to upload video. Please try again.');
      return;
    }

    router.push('/(comp-onboard)/refs');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <ProgressBar currentStep={4} totalSteps={7} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Record Your Introduction</Text>
        <Text style={styles.subtitle}>
          Help clients get to know you (30–60 seconds)
        </Text>
      </View>

      {/* Recorder */}
      <VideoRecorder
        videoUri={videoUri}
        onVideoRecorded={(uri) => {
          setVideoUri(uri);
          setVideoError(undefined);
        }}
        error={videoError}
        maxDuration={60}
      />

      {/* Tips */}
      <View style={styles.tipsSection}>
        <Text style={styles.tipsSectionTitle}>Tips for a great video</Text>
        {TIPS.map((tip, index) => (
          <View key={index} style={styles.tipRow}>
            <Icon name={tip.icon as any} size={16} color={colors.accent} />
            <Text style={styles.tipText}>{tip.text}</Text>
          </View>
        ))}
      </View>

      <Button
        title="Continue"
        onPress={handleContinue}
        loading={submitting || isLoading}
        disabled={!videoUri}
        variant="pink"
        fullWidth
        size="lg"
        testID="comp-video-continue-btn"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg + 4,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    lineHeight: 24,
  },
  tipsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  tipsSectionTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  tipText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    flex: 1,
    lineHeight: 20,
  },
});
