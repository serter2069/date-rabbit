import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useAuthStore } from '../../src/store/authStore';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';

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
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
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
              </>
            )}
          </Card>
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
});
