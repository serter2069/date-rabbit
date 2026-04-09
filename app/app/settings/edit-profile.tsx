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
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { PhotoUpload } from '../../src/components/PhotoUpload';
import { useAuthStore } from '../../src/store/authStore';
import { useImagePicker } from '../../src/hooks/useImagePicker';
import { usersApi, citiesApi } from '../../src/services/api';
import type { City } from '../../src/services/api';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import { showAlert } from '../../src/utils/alert';

// Web-only: native <select> for city (RN Modal doesn't work well on web)
const WebCitySelect = Platform.OS === 'web'
  ? ({ value, cities, onChange, hasError, colors: c }: {
      value: string;
      cities: City[];
      onChange: (val: string) => void;
      hasError: boolean;
      colors: any;
    }) => {
      const selectStyle = {
        width: '100%' as const,
        height: 48,
        border: `1px solid ${hasError ? '#FF3B30' : c.border}`,
        borderRadius: 12,
        backgroundColor: c.white,
        paddingLeft: 16,
        paddingRight: 16,
        fontSize: 16,
        color: value ? c.text : c.textSecondary,
        appearance: 'none' as const,
        WebkitAppearance: 'none' as const,
        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23999%27 stroke-width=%272%27%3e%3cpolyline points=%276 9 12 15 18 9%27/%3e%3c/svg%3e")',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 12px center',
        backgroundSize: '20px',
        cursor: 'pointer' as const,
        outline: 'none',
      };
      return (
        // @ts-ignore - web-only DOM element
        <select
          value={value}
          onChange={(e: any) => onChange(e.target.value)}
          style={selectStyle}
        >
          <option value="">Select city</option>
          {cities.map((city: City) => (
            <option key={city.id} value={city.name}>{city.name}</option>
          ))}
        </select>
      );
    }
  : null;

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
  const [cityPickerVisible, setCityPickerVisible] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [citiesError, setCitiesError] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [profileVideoUrl, setProfileVideoUrl] = useState<string | null>(user?.profileVideoUrl || null);

  // Fetch cities for dropdown
  useEffect(() => {
    let cancelled = false;
    const fetchCities = async () => {
      setCitiesLoading(true);
      setCitiesError(false);
      try {
        const data = await citiesApi.getActive();
        if (!cancelled) setCities(data);
      } catch {
        if (!cancelled) setCitiesError(true);
      } finally {
        if (!cancelled) setCitiesLoading(false);
      }
    };
    fetchCities();
    return () => { cancelled = true; };
  }, []);

  // Initialize images from user profile
  useEffect(() => {
    if (user?.photos && user.photos.length > 0) {
      // Convert photo objects to URLs for the image picker
      setImages(user.photos.map(p => p.url));
    }
  }, []);

  const handleVideoUpload = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permission Required', 'Please allow access to your media library to upload a video.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: false,
      quality: 1,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setVideoLoading(true);
    try {
      const { url } = await usersApi.uploadProfileVideo(asset.uri);
      setProfileVideoUrl(url);
      showAlert('Success', 'Profile video uploaded successfully.');
    } catch {
      showAlert('Error', 'Failed to upload video. Make sure it is MP4 or MOV and under 50MB.');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      showAlert('Error', 'Name is required');
      return;
    }

    if (formData.bio.length > 500) {
      showAlert('Error', 'Bio must be 500 characters or less');
      return;
    }

    if (formData.hourlyRate) {
      const rate = parseInt(formData.hourlyRate, 10);
      if (isNaN(rate) || rate <= 0) {
        showAlert('Invalid Rate', 'Hourly rate must be greater than 0');
        return;
      }
      if (rate >= 10000) {
        showAlert('Invalid Rate', 'Hourly rate must be less than $10,000');
        return;
      }
    }

    setLoading(true);
    try {
      // Upload new photos (local URIs) and keep existing MinIO URLs as-is
      const uploadedPhotos: { id: string; url: string; order: number; isPrimary: boolean }[] = [];
      for (let i = 0; i < images.length; i++) {
        const uri = images[i];
        if (uri.startsWith('http')) {
          // Already a MinIO URL — preserve it without re-uploading
          uploadedPhotos.push({ id: String(i), url: uri, order: i, isPrimary: i === 0 });
        } else {
          // Local URI — upload to MinIO
          const result = await usersApi.uploadProfilePhoto(uri);
          uploadedPhotos.push({ id: String(i), url: result.url, order: i, isPrimary: i === 0 });
        }
      }

      await updateProfile({
        name: formData.name,
        bio: formData.bio,
        location: formData.location,
        hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate, 10) : undefined,
        photos: uploadedPhotos as any,
      });
      router.back();
    } catch {
      showAlert('Error', 'Failed to save changes');
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
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
            <Text style={[styles.label, { color: colors.text }]}>City</Text>
            {Platform.OS === 'web' && WebCitySelect ? (
              <WebCitySelect
                value={formData.location}
                cities={cities}
                onChange={(val) => updateField('location', val)}
                hasError={false}
                colors={colors}
              />
            ) : (
              <TouchableOpacity
                style={[styles.input, { backgroundColor: colors.white, borderColor: colors.border, flexDirection: 'row', alignItems: 'center' }]}
                onPress={() => setCityPickerVisible(true)}
                activeOpacity={0.7}
                accessibilityLabel={formData.location ? `City: ${formData.location}` : 'Select city'}
                accessibilityRole="button"
              >
                <Icon name="map-pin" size={20} color={colors.textSecondary} />
                <Text
                  style={[
                    { flex: 1, fontSize: typography.sizes.md, marginLeft: spacing.sm },
                    formData.location ? { color: colors.text } : { color: colors.textSecondary },
                  ]}
                  numberOfLines={1}
                >
                  {formData.location || 'Select city'}
                </Text>
                <Icon name="arrow-down" size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
            {citiesError && (
              <Text style={[styles.hint, { color: '#FF3B30' }]}>Failed to load cities</Text>
            )}
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

        {/* Profile Video — companions only, mobile only */}
        {isFemale && Platform.OS !== 'web' && (
          <View style={[styles.section, { backgroundColor: colors.white }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Profile Video</Text>
            <Text style={[styles.hint, { color: colors.textSecondary, marginBottom: spacing.md }]}>
              Upload a short intro video (MP4 or MOV, max 50MB) to help seekers get to know you.
            </Text>
            {profileVideoUrl ? (
              <View style={styles.videoStatus}>
                <Icon name="check-circle" size={20} color="#4CAF50" />
                <Text style={[styles.videoStatusText, { color: colors.text }]}>Video uploaded</Text>
              </View>
            ) : (
              <View style={styles.videoStatus}>
                <Icon name="video" size={20} color={colors.textSecondary} />
                <Text style={[styles.videoStatusText, { color: colors.textSecondary }]}>No video uploaded</Text>
              </View>
            )}
            <TouchableOpacity
              style={[styles.videoButton, { borderColor: colors.primary, opacity: videoLoading ? 0.6 : 1 }]}
              onPress={handleVideoUpload}
              disabled={videoLoading}
              accessibilityLabel="Upload profile video"
              accessibilityRole="button"
            >
              {videoLoading ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Icon name="upload" size={18} color={colors.primary} />
              )}
              <Text style={[styles.videoButtonText, { color: colors.primary }]}>
                {videoLoading ? 'Uploading...' : profileVideoUrl ? 'Replace Video' : 'Upload Video'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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

      {/* City Picker Modal (native only -- web uses <select>) */}
      {Platform.OS !== 'web' && (
        <Modal
          visible={cityPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCityPickerVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setCityPickerVisible(false)}
            accessibilityLabel="Close city picker"
            accessibilityRole="button"
          >
            <View style={[styles.modalContent, { backgroundColor: colors.white, borderColor: colors.border }]}>
              <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select City</Text>
                <TouchableOpacity
                  onPress={() => setCityPickerVisible(false)}
                  accessibilityLabel="Close"
                  accessibilityRole="button"
                >
                  <Icon name="x" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              {citiesLoading ? (
                <View style={styles.cityPickerLoading}>
                  <Text style={[styles.cityPickerLoadingText, { color: colors.textSecondary }]}>Loading cities...</Text>
                </View>
              ) : citiesError ? (
                <View style={styles.cityPickerLoading}>
                  <Text style={{ color: '#FF3B30', fontSize: typography.sizes.sm }}>Failed to load cities. Please try again.</Text>
                </View>
              ) : (
                <FlatList
                  data={cities}
                  keyExtractor={(item) => item.id}
                  style={styles.cityList}
                  showsVerticalScrollIndicator={false}
                  ListEmptyComponent={
                    <View style={styles.cityPickerLoading}>
                      <Text style={[styles.cityPickerLoadingText, { color: colors.textSecondary }]}>No cities available</Text>
                    </View>
                  }
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.cityItem,
                        { borderBottomColor: colors.border },
                        formData.location === item.name && styles.cityItemSelected,
                      ]}
                      onPress={() => {
                        updateField('location', item.name);
                        setCityPickerVisible(false);
                      }}
                      accessibilityLabel={`City ${item.name}`}
                      accessibilityRole="button"
                      accessibilityState={{ selected: formData.location === item.name }}
                    >
                      <Text
                        style={[
                          styles.cityItemText,
                          { color: colors.text },
                          formData.location === item.name && styles.cityItemTextSelected,
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      )}
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
    fontFamily: typography.fonts.heading,
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
    fontFamily: typography.fonts.bodySemiBold,
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
    fontFamily: typography.fonts.heading,
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
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  videoStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  videoStatusText: {
    fontSize: typography.sizes.sm,
    marginLeft: spacing.xs,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
    minHeight: 48,
  },
  videoButtonText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  // City picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    maxHeight: 420,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  cityList: {
    maxHeight: 360,
  },
  cityItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
  },
  cityItemSelected: {
    backgroundColor: '#FF69B4',
  },
  cityItemText: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    textAlign: 'center',
  },
  cityItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cityPickerLoading: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  cityPickerLoadingText: {
    fontSize: typography.sizes.md,
  },
});
