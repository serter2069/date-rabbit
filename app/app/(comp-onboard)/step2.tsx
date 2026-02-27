import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showAlert } from '../../src/utils/alert';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { ProgressBar } from '../../src/components/verification';
import { colors, spacing, typography, borderRadius, PAGE_PADDING } from '../../src/constants/theme';

const MIN_PHOTOS = 3;
const MAX_PHOTOS = 6;
const MAX_BIO_LENGTH = 500;

export default function CompStep2Screen() {
  const insets = useSafeAreaInsets();
  const [photos, setPhotos] = useState<string[]>([]);
  const [bio, setBio] = useState('');
  const [errors, setErrors] = useState<{ photos?: string; bio?: string }>({});

  const pickPhoto = async () => {
    if (photos.length >= MAX_PHOTOS) return;

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Permission needed', 'Please allow access to your photo library to upload profile photos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.85,
    });

    if (!result.canceled && result.assets[0]?.uri) {
      setPhotos((prev) => [...prev, result.assets[0].uri]);
      setErrors((e) => ({ ...e, photos: undefined }));
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (photos.length < MIN_PHOTOS) {
      newErrors.photos = `Upload at least ${MIN_PHOTOS} photos`;
    }
    if (bio.trim().length < 20) {
      newErrors.bio = 'Please write at least 20 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validate()) return;
    router.push('/(comp-onboard)/verify');
  };

  const renderPhotoSlot = (index: number) => {
    const uri = photos[index];
    const isFirst = index === 0;

    if (uri) {
      return (
        <View key={index} style={styles.photoSlot}>
          <Image source={{ uri }} style={styles.photoImage} />
          {isFirst && (
            <View style={styles.mainBadge}>
              <Text style={styles.mainBadgeText}>Main</Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removePhoto(index)}
            hitSlop={{ top: 8, right: 8, bottom: 8, left: 8 }}
          >
            <Icon name="x" size={12} color={colors.white} />
          </TouchableOpacity>
        </View>
      );
    }

    if (index === photos.length) {
      return (
        <TouchableOpacity key={index} style={styles.photoSlotEmpty} onPress={pickPhoto} activeOpacity={0.7}>
          <Icon name="plus" size={24} color={colors.accent} />
          {isFirst && <Text style={styles.addFirstLabel}>Add photo</Text>}
        </TouchableOpacity>
      );
    }

    return (
      <View key={index} style={[styles.photoSlotEmpty, styles.photoSlotDisabled]}>
        <Icon name="image" size={20} color={colors.border} />
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ProgressBar currentStep={1} totalSteps={7} />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="user" size={32} color={colors.primary} />
          </View>
          <Text style={styles.title}>Build Your Profile</Text>
          <Text style={styles.subtitle}>
            Add photos and a bio to help clients get to know you
          </Text>
        </View>

        {/* Photos section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>1</Text>
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>Profile Photos</Text>
              <Text style={styles.sectionHint}>{MIN_PHOTOS}–{MAX_PHOTOS} photos required</Text>
            </View>
          </View>

          <View style={styles.photosGrid}>
            {Array.from({ length: MAX_PHOTOS }, (_, i) => renderPhotoSlot(i))}
          </View>

          {errors.photos && (
            <Text style={styles.errorText}>{errors.photos}</Text>
          )}

          <Text style={styles.photoTip}>
            First photo will be your main profile picture. Use clear, well-lit photos.
          </Text>
        </View>

        {/* Bio section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>2</Text>
            </View>
            <View style={styles.sectionHeaderText}>
              <Text style={styles.sectionTitle}>About You</Text>
              <Text style={styles.sectionHint}>Tell clients about yourself</Text>
            </View>
          </View>

          <TextInput
            style={[styles.bioInput, errors.bio ? styles.bioInputError : undefined]}
            value={bio}
            onChangeText={(text) => {
              if (text.length <= MAX_BIO_LENGTH) {
                setBio(text);
                setErrors((e) => ({ ...e, bio: undefined }));
              }
            }}
            placeholder="Share your personality, interests, and what makes a great date experience with you..."
            placeholderTextColor={colors.textLight}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={MAX_BIO_LENGTH}
            testID="comp-step2-bio-input"
          />

          <View style={styles.bioFooter}>
            {errors.bio ? (
              <Text style={styles.errorText}>{errors.bio}</Text>
            ) : (
              <View />
            )}
            <Text style={[styles.charCount, bio.length >= MAX_BIO_LENGTH - 50 && styles.charCountWarning]}>
              {bio.length}/{MAX_BIO_LENGTH}
            </Text>
          </View>
        </View>

        <Button
          title="Continue"
          onPress={handleContinue}
          variant="pink"
          fullWidth
          size="lg"
          testID="comp-step2-continue-btn"
        />
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    paddingHorizontal: PAGE_PADDING,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.secondary,
    borderWidth: 3,
    borderColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionBadge: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  sectionBadgeText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.white,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.lg,
    color: colors.text,
  },
  sectionHint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  photoSlot: {
    width: '30.5%',
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  photoSlotEmpty: {
    width: '30.5%',
    aspectRatio: 3 / 4,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.accent,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  photoSlotDisabled: {
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  addFirstLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    color: colors.accent,
  },
  mainBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  mainBadgeText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
    color: colors.white,
  },
  removeBtn: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(45, 42, 50, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoTip: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  bioInput: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    color: colors.text,
    backgroundColor: colors.background,
    lineHeight: 24,
  },
  bioInputError: {
    borderColor: colors.error,
  },
  bioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.error,
  },
  charCount: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
    marginLeft: 'auto',
  },
  charCountWarning: {
    color: colors.warning,
  },
});
