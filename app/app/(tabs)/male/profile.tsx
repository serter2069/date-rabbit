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

export default function MaleProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/welcome');
  };

  const stats = {
    totalDates: 8,
    totalSpent: 1850,
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

        <View style={[styles.statsRow, { backgroundColor: colors.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.totalDates}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Dates</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>${stats.totalSpent}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Spent</Text>
          </View>
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
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <Card>
          <MenuItem icon="heart" label="Favorites" onPress={() => router.push('/favorites')} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="credit-card" label="Payment Methods" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="receipt" label="Transaction History" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="bell" label="Notifications" colors={colors} />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
        <Card>
          <MenuItem icon="map-pin" label="Location" value="San Francisco" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="cake" label="Age Range" value="25-35" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="globe" label="Language" value="English" colors={colors} />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
        <Card>
          <MenuItem icon="help-circle" label="Help Center" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="mail" label="Contact Us" colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuItem icon="star" label="Rate the App" colors={colors} />
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

function MenuItem({ icon, label, value, onPress, colors }: { icon: string; label: string; value?: string; onPress?: () => void; colors: any }) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '15' }]}>
        <Icon name={icon} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      {value && <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{value}</Text>}
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
  statsRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
  },
  statValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
  },
  statLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
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
  menuValue: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginRight: spacing.sm,
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
