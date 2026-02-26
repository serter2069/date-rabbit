import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function RoleSelectScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const handleSelectRole = (role: 'companion' | 'seeker') => {
    router.push({
      pathname: '/(auth)/register',
      params: { role },
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.lg }]}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        testID="role-select-back-btn"
      >
        <Icon name="arrow-left" size={20} color={colors.primary} />
        <Text style={[styles.backText, { color: colors.primary }]}> Back</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Join as...</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Choose how you want to use DateRabbit
        </Text>

        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}
          onPress={() => handleSelectRole('companion')}
          testID="role-select-companion-btn"
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.accent + '20' }]}>
            <Icon name="user" size={32} color={colors.accent} />
          </View>
          <View style={styles.roleInfo}>
            <Text style={[styles.roleTitle, { color: colors.text }]}>Date Companion</Text>
            <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
              Get paid for going on dates. Set your own rates and schedule.
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.accent }]}>
            <Text style={[styles.badgeText, { color: colors.white }]}>Earn $$$</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.roleCard, { backgroundColor: colors.surface, borderColor: colors.secondary }]}
          onPress={() => handleSelectRole('seeker')}
          testID="role-select-seeker-btn"
        >
          <View style={[styles.iconContainer, { backgroundColor: colors.secondary + '20' }]}>
            <Icon name="search" size={32} color={colors.secondary} />
          </View>
          <View style={styles.roleInfo}>
            <Text style={[styles.roleTitle, { color: colors.text }]}>Date Seeker</Text>
            <Text style={[styles.roleDescription, { color: colors.textSecondary }]}>
              Book dates with verified companions. Premium experiences guaranteed.
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.badgeText, { color: colors.white }]}>Book dates</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.note, { color: colors.textSecondary }]}>
        All users must verify their identity to ensure safety
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    minHeight: 44,
  },
  backText: {
    fontSize: typography.sizes.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.sizes.md,
    marginBottom: spacing.xl,
  },
  roleCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    minHeight: 140,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  roleInfo: {
    marginBottom: spacing.md,
  },
  roleTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  roleDescription: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    minHeight: 32,
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  note: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
  },
});
