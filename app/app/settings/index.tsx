import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import { showAlert } from '../../src/utils/alert';

function SettingsMenuItem({
  icon,
  label,
  description,
  onPress,
  colors,
  showChevron = true,
}: {
  icon: string;
  label: string;
  description?: string;
  onPress?: () => void;
  colors: any;
  showChevron?: boolean;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityHint={description}
    >
      <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '15' }]}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
        {description && (
          <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>{description}</Text>
        )}
      </View>
      {showChevron && <Icon name="chevron-right" size={20} color={colors.textSecondary} />}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, logout, updateProfile } = useAuthStore();

  const [isPublicProfile, setIsPublicProfile] = useState(user?.isPublicProfile ?? true);
  const [emergencyName, setEmergencyName] = useState(user?.emergencyContactName ?? '');
  const [emergencyEmail, setEmergencyEmail] = useState(user?.emergencyContactEmail ?? '');
  const [isSavingEmergency, setIsSavingEmergency] = useState(false);

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  const togglePublicProfile = async (value: boolean) => {
    // Companion profile completion gate — checked client-side before API call
    if (value && user?.role === 'companion') {
      const missing: string[] = [];
      if (!user.photos || user.photos.length === 0) missing.push('Upload at least one photo');
      if (user.verificationStatus !== 'approved') missing.push('Complete identity verification');
      if (!user.hourlyRate || Number(user.hourlyRate) <= 0) missing.push('Set your hourly rate');
      if (!user.bio || !user.bio.trim()) missing.push('Add a bio');
      if (missing.length > 0) {
        showAlert(
          'Profile incomplete',
          `To publish your profile, please:\n\n• ${missing.join('\n• ')}`,
        );
        return;
      }
    }

    const prev = isPublicProfile;
    setIsPublicProfile(value);
    const result = await updateProfile({ isPublicProfile: value });
    if (!result.success) {
      setIsPublicProfile(prev);
      showAlert('Error', result.error || 'Failed to update profile visibility.');
    }
  };

  const handleSaveEmergencyContact = async () => {
    setIsSavingEmergency(true);
    const result = await updateProfile({
      emergencyContactName: emergencyName.trim() || undefined,
      emergencyContactEmail: emergencyEmail.trim() || undefined,
    });
    setIsSavingEmergency(false);
    if (!result.success) {
      showAlert('Error', result.error || 'Failed to save emergency contact.');
    } else {
      showAlert('Saved', 'Emergency contact updated.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <Card>
            <SettingsMenuItem
              icon="user"
              label="Edit Profile"
              description="Name, bio, photos"
              onPress={() => router.push('/settings/edit-profile')}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <SettingsMenuItem
              icon="credit-card"
              label="Payment Methods"
              description="Manage cards and payment options"
              onPress={() => router.push('/settings/payment-methods')}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <SettingsMenuItem
              icon="bell"
              label="Notifications"
              description="Push notifications and alerts"
              onPress={() => router.push('/settings/notifications')}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <SettingsMenuItem
              icon="shield"
              label="Verification"
              description="Identity verification status"
              onPress={() => router.push('/settings/verification')}
              colors={colors}
            />
            {user?.role === 'seeker' && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <SettingsMenuItem
                  icon="gift"
                  label="Invite Friends"
                  description="Get 50% off Background Check"
                  onPress={() => router.push('/settings/referral')}
                  colors={colors}
                />
              </>
            )}
            {user?.role === 'companion' && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <SettingsMenuItem
                  icon="package"
                  label="My Packages"
                  description="Create date packages with fixed pricing"
                  onPress={() => router.push('/settings/my-packages')}
                  colors={colors}
                />
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
                <View style={styles.toggleRow}>
                  <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '15' }]}>
                    <Icon name="eye" size={18} color={colors.primary} />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Text style={[styles.menuLabel, { color: colors.text }]}>Public Profile</Text>
                    <Text style={[styles.menuDescription, { color: colors.textSecondary }]}>
                      {isPublicProfile ? 'Visible in browse & discover' : 'Hidden from browse & discover'}
                    </Text>
                  </View>
                  <Switch
                    value={isPublicProfile}
                    onValueChange={togglePublicProfile}
                    trackColor={{ false: colors.border, true: colors.primary + '60' }}
                    thumbColor={isPublicProfile ? colors.primary : colors.textSecondary}
                  />
                </View>
              </>
            )}
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Emergency Contact</Text>
          <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
            If you trigger the SOS button during a date, this person will be notified automatically.
          </Text>
          <Card>
            <View style={styles.emergencyField}>
              <Text style={[styles.emergencyLabel, { color: colors.textSecondary }]}>Name</Text>
              <TextInput
                style={[styles.emergencyInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={emergencyName}
                onChangeText={setEmergencyName}
                placeholder="Contact name"
                placeholderTextColor={colors.textSecondary}
                maxLength={100}
                accessibilityLabel="Emergency contact name"
              />
            </View>
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <View style={styles.emergencyField}>
              <Text style={[styles.emergencyLabel, { color: colors.textSecondary }]}>Email</Text>
              <TextInput
                style={[styles.emergencyInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
                value={emergencyEmail}
                onChangeText={setEmergencyEmail}
                placeholder="contact@example.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={200}
                accessibilityLabel="Emergency contact email"
              />
            </View>
          </Card>
          <TouchableOpacity
            style={[styles.emergencySaveBtn, { backgroundColor: colors.primary, opacity: isSavingEmergency ? 0.6 : 1 }]}
            onPress={handleSaveEmergencyContact}
            disabled={isSavingEmergency}
            accessibilityLabel="Save emergency contact"
            accessibilityRole="button"
          >
            {isSavingEmergency ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.emergencySaveBtnText}>Save Emergency Contact</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Legal</Text>
          <Card>
            <SettingsMenuItem
              icon="file-text"
              label="Terms of Service"
              onPress={() => router.push('/terms')}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <SettingsMenuItem
              icon="shield"
              label="Privacy Policy"
              onPress={() => router.push('/privacy')}
              colors={colors}
            />
            <View style={[styles.divider, { backgroundColor: colors.divider }]} />
            <SettingsMenuItem
              icon="alert"
              label="Safety Guidelines"
              onPress={() => router.push('/safety')}
              colors={colors}
            />
          </Card>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Danger Zone</Text>
          <Card>
            <SettingsMenuItem
              icon="trash-2"
              label="Delete Account"
              description="Permanently delete your account and data"
              onPress={() => router.push('/settings/delete-account')}
              colors={colors}
            />
          </Card>
        </View>

        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="ghost"
          fullWidth
          textStyle={{ color: colors.error }}
        />

      </ScrollView>
    </View>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
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
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.md,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  menuDescription: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  divider: {
    height: 1,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 56,
  },
  sectionDescription: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  emergencyField: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    minHeight: 56,
    justifyContent: 'center',
  },
  emergencyLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    marginBottom: 4,
  },
  emergencyInput: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 44,
  },
  emergencySaveBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  emergencySaveBtnText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: '#fff',
  },
});
