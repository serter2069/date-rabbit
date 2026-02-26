import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface PhotoUploadProps {
  photos: string[];
  maxPhotos?: number;
  loading?: boolean;
  onPickFromLibrary: () => void;
  onTakePhoto: () => void;
  onRemove: (uri: string) => void;
}

export function PhotoUpload({
  photos,
  maxPhotos = 6,
  loading = false,
  onPickFromLibrary,
  onTakePhoto,
  onRemove,
}: PhotoUploadProps) {
  const showAddOptions = () => {
    Alert.alert(
      'Add Photo',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: onTakePhoto },
        { text: 'Choose from Library', onPress: onPickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleRemove = (uri: string) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => onRemove(uri) },
      ]
    );
  };

  const emptySlots = Math.max(0, maxPhotos - photos.length);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Photos</Text>
        <Text style={styles.counter}>{photos.length}/{maxPhotos}</Text>
      </View>
      <Text style={styles.hint}>Add up to {maxPhotos} photos. First photo will be your main profile picture.</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.photosContainer}
      >
        {photos.map((uri, index) => (
          <View key={uri} style={styles.photoWrapper}>
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoPlaceholderText}>📷</Text>
              <Text style={styles.photoIndex}>{index + 1}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemove(uri)}
            >
              <Text style={styles.removeButtonText}>✕</Text>
            </TouchableOpacity>
            {index === 0 && (
              <View style={styles.mainBadge}>
                <Text style={styles.mainBadgeText}>Main</Text>
              </View>
            )}
          </View>
        ))}

        {emptySlots > 0 && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={showAddOptions}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Text style={styles.addIcon}>+</Text>
                <Text style={styles.addText}>Add Photo</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const PHOTO_SIZE = 100;

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
  },
  counter: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
  },
  hint: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  photosContainer: {
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  photoWrapper: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE * 1.25,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  photoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 32,
  },
  photoIndex: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  mainBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  mainBadgeText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: '600',
  },
  addButton: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE * 1.25,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  addIcon: {
    fontSize: 32,
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  addText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
});
