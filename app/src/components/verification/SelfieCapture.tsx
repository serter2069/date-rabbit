import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Icon } from '../Icon';
import { colors, spacing, borderRadius, typography, touchTargets, shadows } from '../../constants/theme';

interface SelfieCaptureProps {
  imageUri?: string;
  onImageCaptured: (uri: string) => void;
  error?: string;
}

export function SelfieCapture({ imageUri, onImageCaptured, error }: SelfieCaptureProps) {
  const handleCapture = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Camera Permission Required',
          'Please allow camera access in settings to take a selfie.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
      cameraType: ImagePicker.CameraType.front,
    });

    if (!result.canceled && result.assets[0]) {
      onImageCaptured(result.assets[0].uri);
    }
  };

  const handleRetake = () => {
    handleCapture();
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error ? styles.labelError : null]}>
        Selfie Photo
      </Text>

      {imageUri ? (
        <View style={styles.previewWrapper}>
          <View style={styles.previewOvalContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
          </View>
          <TouchableOpacity
            style={styles.retakeButton}
            onPress={handleRetake}
            activeOpacity={0.8}
          >
            <Icon name="refresh" size={18} color={colors.primary} />
            <Text style={styles.retakeButtonText}>Retake Selfie</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.captureArea, error ? styles.captureAreaError : null]}
          onPress={handleCapture}
          activeOpacity={0.8}
        >
          {/* Oval face guide overlay */}
          <View style={styles.ovalGuide}>
            <Icon name="user" size={48} color={colors.border} />
          </View>

          <View style={styles.captureButtonContainer}>
            <View style={styles.captureButton}>
              <Icon name="camera" size={28} color={colors.white} />
            </View>
          </View>

          <Text style={styles.captureHint}>Tap to take selfie</Text>
        </TouchableOpacity>
      )}

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.tipsContainer}>
          <View style={styles.tipRow}>
            <Icon name="sparkles" size={14} color={colors.accent} />
            <Text style={styles.tipText}>Good lighting — face clearly visible</Text>
          </View>
          <View style={styles.tipRow}>
            <Icon name="check-circle" size={14} color={colors.accent} />
            <Text style={styles.tipText}>Look straight at the camera</Text>
          </View>
          <View style={styles.tipRow}>
            <Icon name="check-circle" size={14} color={colors.accent} />
            <Text style={styles.tipText}>Remove sunglasses or hat</Text>
          </View>
        </View>
      )}
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
  captureArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: borderRadius.xl,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  captureAreaError: {
    borderColor: colors.error,
  },
  ovalGuide: {
    width: 120,
    height: 150,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  captureButtonContainer: {
    alignItems: 'center',
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.buttonAccent,
  },
  captureHint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  previewWrapper: {
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  previewOvalContainer: {
    width: 160,
    height: 200,
    borderRadius: 80,
    overflow: 'hidden',
    ...shadows.md,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: touchTargets.minimum,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  retakeButtonText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  tipsContainer: {
    gap: spacing.xs,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tipText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.error,
  },
});

export default SelfieCapture;
