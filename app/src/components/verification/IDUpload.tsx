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

interface IDUploadProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
  error?: string;
}

export function IDUpload({ imageUri, onImageSelected, error }: IDUploadProps) {
  const requestPermission = async (type: 'camera' | 'library') => {
    if (Platform.OS !== 'web') {
      if (type === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Camera Permission Required',
            'Please allow camera access in settings to take a photo of your ID.',
            [{ text: 'OK' }]
          );
          return false;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Gallery Permission Required',
            'Please allow photo library access to select your ID.',
            [{ text: 'OK' }]
          );
          return false;
        }
      }
    }
    return true;
  };

  const handleCamera = async () => {
    const granted = await requestPermission('camera');
    if (!granted) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    const granted = await requestPermission('library');
    if (!granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 2],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, error ? styles.labelError : null]}>
        Government-Issued Photo ID
      </Text>

      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
          <TouchableOpacity
            style={styles.retakeOverlay}
            onPress={handleCamera}
            activeOpacity={0.8}
          >
            <View style={styles.retakeBadge}>
              <Icon name="camera" size={16} color={colors.white} />
              <Text style={styles.retakeText}>Retake</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.uploadArea, error ? styles.uploadAreaError : null]}
          onPress={handleGallery}
          activeOpacity={0.7}
        >
          <View style={styles.uploadIconContainer}>
            <Icon name="upload" size={32} color={colors.primary} />
          </View>
          <Text style={styles.uploadTitle}>Upload your ID</Text>
          <Text style={styles.uploadSubtitle}>
            Passport, Driver's License, or Government ID
          </Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCamera}
          activeOpacity={0.8}
        >
          <Icon name="camera" size={18} color={colors.primary} />
          <Text style={styles.actionButtonText}>Take Photo</Text>
        </TouchableOpacity>

        <View style={styles.buttonDivider} />

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleGallery}
          activeOpacity={0.8}
        >
          <Icon name="image" size={18} color={colors.primary} />
          <Text style={styles.actionButtonText}>Choose from Gallery</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <View style={styles.tipContainer}>
          <Icon name="info" size={14} color={colors.textMuted} />
          <Text style={styles.tipText}>
            Make sure all text is clearly visible and the image is not blurry
          </Text>
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
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  uploadAreaError: {
    borderColor: colors.error,
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(108,99,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  uploadTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  uploadSubtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
  previewContainer: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    position: 'relative',
    ...shadows.sm,
  },
  preview: {
    width: '100%',
    height: 200,
    backgroundColor: colors.surface,
  },
  retakeOverlay: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
  },
  retakeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full,
  },
  retakeText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.white,
  },
  buttonsRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    minHeight: touchTargets.minimum,
    backgroundColor: colors.background,
  },
  actionButtonText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
  buttonDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
  },
  tipText: {
    flex: 1,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    lineHeight: 18,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    color: colors.error,
  },
});

export default IDUpload;
