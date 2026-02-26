import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../src/store/authStore';
import { Card } from '../../../src/components/Card';
import { UserImage } from '../../../src/components/UserImage';
import { Button } from '../../../src/components/Button';
import { Icon } from '../../../src/components/Icon';
import { useTheme, spacing, typography, borderRadius } from '../../../src/constants/theme';

export default function FemaleProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Profile</Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <UserImage
            uri={user?.photos?.[0]?.url}
            name={user?.name}
            size={80}
            showVerified={user?.isVerified}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{user?.name}, {user?.age}</Text>
            <Text style={[styles.profileLocation, { color: colors.textSecondary }]}>{user?.location}</Text>
            <View style={styles.ratingRow}>
              <Icon name="star" size={14} color={colors.accent} />
              <Text style={[styles.ratingValue, { color: colors.text }]}> {user?.rating}</Text>
              <Text style={[styles.reviewCount, { color: colors.textSecondary }]}>({user?.reviewCount} reviews)</Text>
            </View>
          </View>
        </View>

        <View style={[styles.rateBox, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>Your Rate</Text>
          <Text style={[styles.rateValue, { color: colors.primary }]}>${user?.hourlyRate}/hr</Text>
        </View>

        <Button
          title="Edit Profile"
          onPress={() => router.push('/settings/edit-profile')}
          variant="outline"
          fullWidth
          testID="profile-edit-btn"
        />
      </Card>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.photosRow}>
            {[1, 2, 3].map((i) => (
              <TouchableOpacity key={i} style={[styles.photoPlaceholder, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Icon name="plus" size={32} color={colors.textSecondary} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Settings</Text>
        <Card>
          <MenuItem icon="bell" label="Notifications" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="lock" label="Privacy" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="credit-card" label="Payment Settings" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="calendar" label="Availability" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="help-circle" label="Help & Support" colors={colors} />
        </Card>
      </View>

      <View style={styles.section}>
        <Card>
          <MenuItem icon="file-text" label="Terms of Service" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="shield" label="Privacy Policy" colors={colors} />
        </Card>
      </View>

      <Button
        title="Sign Out"
        onPress={handleLogout}
        variant="ghost"
        fullWidth
        textStyle={{ color: colors.error }}
        testID="profile-signout-btn"
      />

      <Text style={[styles.version, { color: colors.textSecondary }]}>DateRabbit v1.0.0</Text>
    </ScrollView>
  );
}

function MenuItem({ icon, label, colors }: { icon: string; label: string; colors: any }) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '15' }]}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      <Icon name="chevron-right" size={20} color={colors.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
  },
  profileCard: {
    marginBottom: spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  profileName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.lg,
  },
  profileLocation: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  ratingValue: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
  },
  reviewCount: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginLeft: spacing.xs,
  },
  rateBox: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rateLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  rateValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.md,
  },
  photosRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  photoPlaceholder: {
    width: 100,
    height: 130,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  menuLabel: {
    fontFamily: typography.fonts.body,
    flex: 1,
    fontSize: typography.sizes.md,
  },
  divider: {
    height: 1,
  },
  version: {
    fontFamily: typography.fonts.body,
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
});
