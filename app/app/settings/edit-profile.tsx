import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { PhotoUpload } from '../../src/components/PhotoUpload';
import { useAuthStore } from '../../src/store/authStore';
import { useImagePicker } from '../../src/hooks/useImagePicker';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, updateProfile } = useAuthStore();
  const {
    images,
    loading: photoLoading,
    pickFromLibrary,
    takePhoto,
    removeImage,
    setImages,
  } = useImagePicker({ maxImages: 6 });

  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    hourlyRate: user?.hourlyRate?.toString() || '',
  });
  const [loading, setLoading] = useState(false);

  // Initialize images from user profile
  useEffect(() => {
    if (user?.photos && user.photos.length > 0) {
      // Convert photo objects to URLs for the image picker
      setImages(user.photos.map(p => p.url));
    }
  }, []);

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (formData.bio.length > 500) {
      Alert.alert('Error', 'Bio must be 500 characters or less');
      return;
    }

    setLoading(true);
    try {
      // TODO: Photo upload will be handled separately via the API
      // For now, just update text fields
      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : undefined,
      });
      router.back();
    } catch {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const isFemale = user?.role === 'companion';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photo Upload */}
        <PhotoUpload
          photos={images}
          maxPhotos={6}
          loading={photoLoading}
          onPickFromLibrary={pickFromLibrary}
          onTakePhoto={takePhoto}
          onRemove={removeImage}
        />

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
              value={formData.name}
              onChangeText={(v) => updateField('name', v)}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
              value={formData.bio}
              onChangeText={(v) => updateField('bio', v)}
              placeholder="Tell others about yourself..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
            <Text style={[styles.charCount, { color: colors.textSecondary }]}>{formData.bio.length}/500</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Location</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
              value={formData.location}
              onChangeText={(v) => updateField('location', v)}
              placeholder="City, State"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {isFemale && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Hourly Rate ($)</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
                value={formData.hourlyRate}
                onChangeText={(v) => updateField('hourlyRate', v.replace(/[^0-9]/g, ''))}
                placeholder="100"
                placeholderTextColor={colors.textSecondary}
                keyboardType="number-pad"
              />
              <Text style={[styles.hint, { color: colors.textSecondary }]}>
                Platform fee is 15%. You will receive ${formData.hourlyRate ? Math.floor(parseInt(formData.hourlyRate) * 0.85) : 0}/hr
              </Text>
            </View>
          )}
        </View>

        {/* Account Info (Read-only) */}
        <View style={[styles.section, { backgroundColor: colors.white }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Info</Text>
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user?.email}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Age</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user?.age}</Text>
          </View>
          <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Member since</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </Text>
          </View>
        </View>

        <Button
          title="Save Changes"
          onPress={handleSave}
          loading={loading}
          fullWidth
          size="lg"
        />

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  form: {
    marginBottom: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    minHeight: 48,
  },
  bioInput: {
    height: 120,
    paddingTop: spacing.md,
  },
  charCount: {
    fontSize: typography.sizes.xs,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
  hint: {
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  section: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    minHeight: 44,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
});
