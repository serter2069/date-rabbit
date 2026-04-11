import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { colors, typography, spacing, borderRadius } from '../../../constants/theme';
import { StateSection } from '../StateSection';

export function OverviewStates() {
  return (
    <StateSection title="PROJECT_OVERVIEW" description="DateRabbit — Project overview, roles and flows">
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>DateRabbit</Text>
        <Text style={styles.tagline}>Real dates. Real connection.</Text>
        <Text style={styles.subtitle}>Premium companion dating platform. Companions set their price, Seekers book and pay. USA, 21+ only.</Text>

        <Text style={styles.sectionTitle}>Roles</Text>
        <View style={styles.roleCard}>
          <View style={[styles.roleBadge, { backgroundColor: colors.accent }]}> 
            <Text style={styles.roleBadgeText}>SEEKER</Text>
          </View>
          <Text style={styles.roleDesc}>Man looking for a companion date. Pays, books, verified via Stripe Identity.</Text>
        </View>
        <View style={styles.roleCard}>
          <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}> 
            <Text style={styles.roleBadgeText}>COMPANION</Text>
          </View>
          <Text style={styles.roleDesc}>Woman offering paid dates. Sets price, controls schedule, receives same-day Stripe payouts.</Text>
        </View>
        <View style={styles.roleCard}>
          <View style={[styles.roleBadge, { backgroundColor: colors.warning }]}> 
            <Text style={styles.roleBadgeText}>ADMIN</Text>
          </View>
          <Text style={styles.roleDesc}>Platform moderator. Manages users, cities, verifications, disputes.</Text>
        </View>

        <Text style={styles.sectionTitle}>Flows</Text>
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>Seeker Happy Path</Text>
          <Text style={styles.flowSteps}>Landing → Auth → OTP → Role Select → Profile → Verify → Browse → Book → Pay → Date</Text>
        </View>
        <View style={styles.flowCard}>
          <Text style={styles.flowTitle}>Companion Happy Path</Text>
          <Text style={styles.flowSteps}>Landing → Auth → OTP → Role Select → Profile → Photos → Verify → Approved → Stripe Connect → Home</Text>
        </View>

        <Text style={styles.sectionTitle}>Pages (40 total)</Text>
        <Text style={styles.groupTitle}>Landing</Text>
        <Text style={styles.item}>Landing Page (gender splash on first visit)</Text>

        <Text style={styles.groupTitle}>Auth</Text>
        <Text style={styles.item}>Welcome, Email Login, OTP, Role Selection, Profile Setup</Text>

        <Text style={styles.groupTitle}>Seeker Verification</Text>
        <Text style={styles.item}>Intro, Photo ID, Selfie, Consent, Pending, Approved</Text>

        <Text style={styles.groupTitle}>Companion Onboarding</Text>
        <Text style={styles.item}>Setup (min 4 photos), Verify, Pending, Approved</Text>

        <Text style={styles.groupTitle}>Seeker Dashboard</Text>
        <Text style={styles.item}>Browse Companions, My Bookings, Messages, Profile, Favorites</Text>

        <Text style={styles.groupTitle}>Companion Dashboard</Text>
        <Text style={styles.item}>Home, Booking Requests, Calendar, Earnings, Profile, Stripe Connect</Text>

        <Text style={styles.groupTitle}>Booking</Text>
        <Text style={styles.item}>Detail, Payment, Request Sent, Declined</Text>

        <Text style={styles.groupTitle}>Reviews</Text>
        <Text style={styles.item}>View Reviews, Write Review</Text>

        <Text style={styles.groupTitle}>Settings</Text>
        <Text style={styles.item}>Settings, Edit Profile, Notification Preferences</Text>

        <Text style={styles.groupTitle}>Admin</Text>
        <Text style={styles.item}>Cities Management</Text>
      </ScrollView>
    </View>
    </StateSection>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: Platform.OS === 'web' ? ('100vh' as any) : 844, backgroundColor: colors.background },
  content: { padding: spacing.lg, maxWidth: 600 },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  tagline: { ...typography.h3, color: colors.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },
  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.lg },
  groupTitle: { ...typography.bodyMedium, color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.xs },
  item: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.xs, paddingLeft: spacing.md },
  roleCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    marginBottom: 4,
  },
  roleBadgeText: { ...typography.label, color: colors.textInverse },
  roleDesc: { ...typography.bodySmall, color: colors.textSecondary },
  flowCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  flowTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: 4 },
  flowSteps: { ...typography.caption, color: colors.textMuted },
});
