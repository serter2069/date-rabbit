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
import { ProgressBar } from '../../src/components/verification/ProgressBar';
import { SelfieCapture } from '../../src/components/verification/SelfieCapture';
import { useVerificationStore } from '../../src/store/verificationStore';
import { colors, spacing, typography } from '../../src/constants/theme';

const STEPS = ['Intro', 'SSN', 'Photo ID', 'Selfie', 'Consent'];

export default function SeekerSelfieScreen() {
  const insets = useSafeAreaInsets();
  const [imageUri, setImageUri] = useState<string | undefined>();
  const { uploadSelfie, isLoading } = useVerificationStore();

  const handleContinue = async () => {
    if (!imageUri) return;
    const success = await uploadSelfie(imageUri);
    if (success) {
      router.push('/(seeker-verify)/consent');
    } else {
      const storeError = useVerificationStore.getState().error;
      Alert.alert('Error', storeError || 'Failed to upload selfie. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar currentStep={3} totalSteps={5} labels={STEPS} />

        <View style={styles.header}>
          <Text style={styles.title}>Take a Selfie</Text>
          <Text style={styles.subtitle}>
            We'll match it with your ID photo
          </Text>
        </View>

        <SelfieCapture
          imageUri={imageUri}
          onImageCaptured={setImageUri}
        />

        <Button
          title="Continue"
          onPress={handleContinue}
          loading={isLoading}
          disabled={!imageUri || isLoading}
          variant="pink"
          fullWidth
          size="lg"
          testID="seeker-selfie-continue-btn"
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
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
});
