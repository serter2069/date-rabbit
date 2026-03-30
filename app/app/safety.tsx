import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { useTheme, spacing, typography, PAGE_PADDING } from '../src/constants/theme';

export default function SafetyScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Safety</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last updated: March 2026</Text>

        <Section title="1. Identity Verification" colors={colors}>
          All companions are required to verify their identity with a government-issued ID and a live selfie before they can accept bookings. Seekers also complete verification to ensure a safe experience for everyone.
        </Section>

        <Section title="2. Secure Payments" colors={colors}>
          All payments are processed through Stripe. We never store your card details on our servers. Funds are held securely until the date is confirmed complete.
        </Section>

        <Section title="3. Safety Check-Ins" colors={colors}>
          During active dates, both parties receive periodic safety check-ins. If a check-in is missed or a concern is flagged, our support team is notified immediately.
        </Section>

        <Section title="4. Reporting & Blocking" colors={colors}>
          You can report or block any user at any time. Reports are reviewed by our team within 24 hours. Serious violations result in immediate account suspension.
        </Section>

        <Section title="5. Date Details Shared Safely" colors={colors}>
          Date location and time details are only shared with confirmed booking participants. You can share your date details with a trusted contact for added peace of mind.
        </Section>

        <Section title="6. 24/7 Support" colors={colors}>
          Our safety and support team is available around the clock. If you ever feel unsafe, you can reach us instantly through the app.
        </Section>

        <Section title="7. Community Guidelines" colors={colors}>
          All users must follow our community guidelines, which prohibit harassment, discrimination, and inappropriate behavior. Violations lead to warnings, suspensions, or permanent bans.
        </Section>

        <Section title="8. Contact" colors={colors}>
          For safety concerns, contact us at safety@daterabbit.com.
        </Section>
      </ScrollView>
    </View>
  );
}

function Section({ title, children, colors }: { title: string; children: string; colors: any }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  scrollView: { flex: 1 },
  content: { padding: PAGE_PADDING },
  lastUpdated: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.lg,
  },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  sectionBody: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    lineHeight: 24,
  },
});
