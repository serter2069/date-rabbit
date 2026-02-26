import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Icon } from '../../src/components/Icon';
import { UserImage } from '../../src/components/UserImage';
import { useTheme, spacing, typography, borderRadius, colors } from '../../src/constants/theme';
import { useFavoritesStore } from '../../src/store/favoritesStore';
import { usersApi, companionsApi, CompanionDetail } from '../../src/services/api';

const { width } = Dimensions.get('window');

interface ProfileData {
  id: string;
  name: string;
  age?: number;
  location?: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  bio?: string;
  verified: boolean;
  photos: { id: string; url: string; order: number }[];
  interests?: string[];
  languages?: string[];
  availability?: string;
  responseTime?: string;
  reviews: { id: string; name: string; rating: number; text: string; date: string }[];
}

const defaultProfile: ProfileData = {
  id: '0',
  name: 'Profile',
  age: 25,
  location: 'New York',
  rating: 4.5,
  reviewCount: 0,
  hourlyRate: 100,
  bio: 'No bio available',
  verified: false,
  photos: [],
  interests: [],
  languages: ['English'],
  availability: 'Contact for availability',
  responseTime: 'Varies',
  reviews: [],
};

export default function ProfileViewScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  const { favorites, toggleFavorite } = useFavoritesStore();
  const isFavorite = favorites.includes(profile.id);
  const [menuVisible, setMenuVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [reportDescription, setReportDescription] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        let latitude: number | undefined;
        let longitude: number | undefined;
        
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          try {
            const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            latitude = location.coords.latitude;
            longitude = location.coords.longitude;
          } catch {}
        }
        
        const data = await companionsApi.getById(id, latitude, longitude);
        
        setProfile({
          id: data.id,
          name: data.name,
          age: data.age,
          location: data.location,
          rating: data.rating,
          reviewCount: data.reviewCount,
          hourlyRate: data.hourlyRate,
          bio: data.bio,
          verified: data.isVerified,
          photos: data.photos || [],
          interests: data.interests || [],
          languages: data.languages || ['English'],
          availability: 'Contact for availability',
          responseTime: 'Varies',
          reviews: [],
        });
      } catch (err: any) {
        console.error('Failed to fetch profile:', err);
        setError(err.message || 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [id]);

  const reportReasons = [
    { id: 'inappropriate_content', label: 'Inappropriate Content' },
    { id: 'harassment', label: 'Harassment or Bullying' },
    { id: 'fake_profile', label: 'Fake or Misleading Profile' },
    { id: 'spam', label: 'Spam' },
    { id: 'scam', label: 'Scam or Fraud' },
    { id: 'other', label: 'Other' },
  ];

  const handleReportUser = async () => {
    if (!selectedReason) {
      Alert.alert('Select Reason', 'Please select a reason for your report');
      return;
    }

    setIsReporting(true);
    try {
      const result = await usersApi.reportUser(
        profile.id,
        selectedReason,
        reportDescription.trim() || undefined
      );
      setReportModalVisible(false);
      setSelectedReason(null);
      setReportDescription('');
      Alert.alert('Report Submitted', result.message);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit report');
    } finally {
      setIsReporting(false);
    }
  };

  const handleBlockUser = () => {
    setMenuVisible(false);
    Alert.alert(
      'Block User',
      `Are you sure you want to block ${profile.name}? You won't see their profile or receive messages from them.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersApi.blockUser(profile.id);
              Alert.alert('Blocked', `${profile.name} has been blocked.`);
              router.back();
            } catch (err) {
              Alert.alert('Error', 'Failed to block user');
            }
          },
        },
      ]
    );
  };

  const handleBookDate = () => {
    router.push({
      pathname: '/booking/[id]',
      params: { id: profile.id },
    });
  };

  const handleMessage = () => {
    router.push({
      pathname: '/chat/[id]',
      params: { id: profile.id, name: profile.name },
    });
  };

  const nextPhoto = () => {
    if (currentPhotoIndex < profile.photos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1);
    }
  };

  const prevPhoto = () => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: spacing.md }]}>Loading profile...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', padding: spacing.lg }]}>
        <Icon name="alert-circle" size={48} color={colors.error} />
        <Text style={[styles.errorText, { color: colors.error, marginTop: spacing.md, fontSize: typography.sizes.lg }]}>Failed to load profile</Text>
        <Text style={[styles.errorSubtext, { color: colors.textSecondary, marginTop: spacing.sm }]}>{error}</Text>
        <Button title="Go Back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Photo Gallery */}
        <View style={styles.photoContainer}>
          {profile.photos.length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setPhotoModalVisible(true)}
              style={styles.photoWrapper}
            >
              <View style={[styles.photo, { backgroundColor: colors.surface }]}>
                <UserImage name={profile.name} size={120} />
                <Text style={[styles.photoText, { color: colors.text }]}>{profile.name}</Text>
              </View>

              {/* Photo navigation dots */}
              <View style={styles.photoDots}>
                {profile.photos.map((_: any, index: number) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      { backgroundColor: colors.white + '60' },
                      index === currentPhotoIndex && [styles.dotActive, { backgroundColor: colors.white }],
                    ]}
                  />
                ))}
              </View>

              {/* Navigation arrows */}
              {currentPhotoIndex > 0 && (
                <TouchableOpacity style={[styles.photoNav, styles.photoNavLeft]} onPress={prevPhoto}>
                  <Icon name="chevron-left" size={32} color={colors.white} />
                </TouchableOpacity>
              )}
              {currentPhotoIndex < profile.photos.length - 1 && (
                <TouchableOpacity style={[styles.photoNav, styles.photoNavRight]} onPress={nextPhoto}>
                  <Icon name="chevron-right" size={32} color={colors.white} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
          ) : (
            <View style={[styles.photo, { backgroundColor: colors.surface }]}>
              <UserImage name={profile.name} size={120} />
              <Text style={[styles.photoText, { color: colors.text }]}>{profile.name}</Text>
            </View>
          )}

          {/* Back button */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + spacing.sm, backgroundColor: colors.white }]}
            onPress={() => router.back()}
            testID="profile-view-back-btn"
          >
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Favorite button */}
          <TouchableOpacity
            style={[styles.favoriteButton, { top: insets.top + spacing.sm, backgroundColor: colors.white }]}
            onPress={() => toggleFavorite(profile.id)}
            testID="profile-view-favorite-btn"
          >
            <Icon name="heart" size={20} color={isFavorite ? colors.error : colors.textSecondary} />
          </TouchableOpacity>

          {/* More menu button */}
          <TouchableOpacity
            style={[styles.moreButton, { top: insets.top + spacing.sm, backgroundColor: colors.white }]}
            onPress={() => setMenuVisible(true)}
            testID="profile-view-more-btn"
          >
            <Icon name="more-vertical" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.text }]}>{profile.name}, {profile.age}</Text>
              {profile.verified && (
                <View style={[styles.verifiedBadge, { backgroundColor: colors.success + '15' }]}>
                  <Icon name="check-circle" size={14} color={colors.success} />
                  <Text style={[styles.verified, { color: colors.success }]}> Verified</Text>
                </View>
              )}
            </View>
            <View style={styles.locationRow}>
              <Icon name="map-pin" size={16} color={colors.textSecondary} />
              <Text style={[styles.location, { color: colors.textSecondary }]}> {profile.location}</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Icon name="star" size={16} color={colors.accent} />
                <Text style={[styles.statValue, { color: colors.text }]}> {profile.rating}</Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>({profile.reviewCount} reviews)</Text>
              </View>
              <View style={[styles.rateBadge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.rateValue, { color: colors.primary }]}>${profile.hourlyRate}</Text>
                <Text style={[styles.rateLabel, { color: colors.primary }]}>/hour</Text>
              </View>
            </View>
          </View>

          {/* Bio */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
            <Text style={[styles.bio, { color: colors.textSecondary }]}>{profile.bio}</Text>
          </Card>

          {/* Interests */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Interests</Text>
            <View style={styles.tagsContainer}>
              {profile.interests.map((interest: string) => (
                <View key={interest} style={[styles.tag, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.tagText, { color: colors.text }]}>{interest}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Details */}
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Details</Text>
            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <View style={styles.detailLabelRow}>
                <Icon name="globe" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.text }]}> Languages</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{profile.languages.join(', ')}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
              <View style={styles.detailLabelRow}>
                <Icon name="calendar" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.text }]}> Availability</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{profile.availability}</Text>
            </View>
            <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
              <View style={styles.detailLabelRow}>
                <Icon name="zap" size={16} color={colors.textSecondary} />
                <Text style={[styles.detailLabel, { color: colors.text }]}> Response Time</Text>
              </View>
              <Text style={[styles.detailValue, { color: colors.textSecondary }]}>{profile.responseTime}</Text>
            </View>
          </Card>

          {/* Reviews */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Reviews</Text>
              <TouchableOpacity onPress={() => router.push({ pathname: '/reviews/[id]', params: { id: profile.id } })}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            {profile.reviews.slice(0, 3).map((review: any) => (
              <View key={review.id} style={[styles.review, { borderBottomColor: colors.border }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewName, { color: colors.text }]}>{review.name}</Text>
                  <View style={styles.reviewRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Icon
                        key={star}
                        name="star"
                        size={12}
                        color={star <= review.rating ? colors.accent : colors.border}
                      />
                    ))}
                  </View>
                </View>
                <Text style={[styles.reviewText, { color: colors.textSecondary }]}>"{review.text}"</Text>
                <Text style={[styles.reviewDate, { color: colors.textSecondary }]}>{review.date}</Text>
              </View>
            ))}
          </Card>

          {/* Spacer for bottom buttons */}
          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.white, borderTopColor: colors.border, paddingBottom: insets.bottom || spacing.xl }]}>
        <Button
          title="Message"
          onPress={handleMessage}
          variant="outline"
          style={styles.messageButton}
          testID="profile-view-message-btn"
        />
        <Button
          title={`Book Date • $${profile.hourlyRate}/hr`}
          onPress={handleBookDate}
          style={styles.bookButton}
          testID="profile-view-book-btn"
        />
      </View>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity
          style={styles.menuOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuContainer, { backgroundColor: colors.white }]}>
            <TouchableOpacity
              style={[styles.menuItem, { borderBottomColor: colors.border }]}
              onPress={handleBlockUser}
            >
              <Icon name="slash" size={20} color={colors.error} />
              <Text style={[styles.menuItemText, { color: colors.error }]}>Block User</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                setReportModalVisible(true);
              }}
            >
              <Icon name="flag" size={20} color={colors.textSecondary} />
              <Text style={[styles.menuItemText, { color: colors.text }]}>Report User</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Report Modal */}
      <Modal
        visible={reportModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setReportModalVisible(false)}
      >
        <View style={styles.reportModalOverlay}>
          <View style={[styles.reportModalContent, { backgroundColor: colors.white }]}>
            <View style={styles.reportModalHeader}>
              <Text style={[styles.reportModalTitle, { color: colors.text }]}>Report {profile.name}</Text>
              <TouchableOpacity onPress={() => setReportModalVisible(false)}>
                <Icon name="x" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.reportSectionTitle, { color: colors.text }]}>
              Why are you reporting this user?
            </Text>

            <ScrollView style={styles.reportReasonsScroll}>
              {reportReasons.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reportReasonItem,
                    { borderColor: colors.border },
                    selectedReason === reason.id && { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                >
                  <View style={[
                    styles.reportReasonRadio,
                    { borderColor: selectedReason === reason.id ? colors.primary : colors.border },
                  ]}>
                    {selectedReason === reason.id && (
                      <View style={[styles.reportReasonRadioInner, { backgroundColor: colors.primary }]} />
                    )}
                  </View>
                  <Text style={[styles.reportReasonText, { color: colors.text }]}>{reason.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={[styles.reportSectionTitle, { color: colors.text, marginTop: spacing.md }]}>
              Additional details (optional)
            </Text>
            <TextInput
              style={[styles.reportInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
              placeholder="Provide more information..."
              placeholderTextColor={colors.textSecondary}
              value={reportDescription}
              onChangeText={setReportDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.reportSubmitButton,
                { backgroundColor: selectedReason ? colors.error : colors.border },
              ]}
              onPress={handleReportUser}
              disabled={!selectedReason || isReporting}
            >
              <Text style={[styles.reportSubmitText, { color: colors.white }]}>
                {isReporting ? 'Submitting...' : 'Submit Report'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Photo Modal */}
      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={[styles.modalClose, { top: insets.top + spacing.sm }]}
            onPress={() => setPhotoModalVisible(false)}
          >
            <Icon name="x" size={24} color={colors.white} />
          </TouchableOpacity>
          <View style={[styles.modalPhoto, { backgroundColor: colors.surface }]}>
            <UserImage name={profile.name} size={200} />
            <Text style={[styles.modalPhotoText, { color: colors.textSecondary }]}>
              Photo {currentPhotoIndex + 1} of {profile.photos.length}
            </Text>
          </View>
          <View style={styles.modalDots}>
            {profile.photos.map((_: any, index: number) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalDot,
                  { backgroundColor: colors.white + '40' },
                  index === currentPhotoIndex && { backgroundColor: colors.white },
                ]}
                onPress={() => setCurrentPhotoIndex(index)}
              />
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  photoContainer: {
    width: width,
    height: width * 1.1,
    position: 'relative',
  },
  photoWrapper: {
    flex: 1,
  },
  photo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  photoDots: {
    position: 'absolute',
    bottom: spacing.lg,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
  },
  photoNav: {
    position: 'absolute',
    top: '50%',
    marginTop: -25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoNavLeft: {
    left: spacing.sm,
  },
  photoNavRight: {
    right: spacing.sm,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  favoriteButton: {
    position: 'absolute',
    right: spacing.lg + 52,
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  moreButton: {
    position: 'absolute',
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    width: 250,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  menuItemText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
    fontWeight: '500',
  },
  reportModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  reportModalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '80%',
  },
  reportModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  reportModalTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  reportSectionTitle: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  reportReasonsScroll: {
    maxHeight: 200,
  },
  reportReasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    marginBottom: spacing.sm,
    gap: spacing.md,
  },
  reportReasonRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportReasonRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reportReasonText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
  },
  reportInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    minHeight: 80,
  },
  reportSubmitButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  reportSubmitText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  content: {
    padding: spacing.lg,
    marginTop: -spacing.xl,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  verified: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  location: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValue: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  statLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginLeft: spacing.xs,
  },
  rateBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  rateValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  rateLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginLeft: 2,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  seeAll: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  bio: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    lineHeight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  tagText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    minHeight: 48,
  },
  detailLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
  },
  detailValue: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
  },
  review: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  reviewName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  reviewRating: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  reviewDate: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.lg,
    borderTopWidth: 1,
    gap: spacing.md,
  },
  messageButton: {
    flex: 1,
  },
  bookButton: {
    flex: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    right: spacing.lg,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPhoto: {
    width: width - spacing.xl * 2,
    height: width - spacing.xl * 2,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalPhotoText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    marginTop: spacing.md,
  },
  modalDots: {
    flexDirection: 'row',
    marginTop: spacing.xl,
    gap: spacing.sm,
  },
  modalDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  loadingText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
  },
  errorText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  errorSubtext: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
});
