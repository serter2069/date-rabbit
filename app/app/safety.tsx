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
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last updated: April 2026</Text>

        <Section title="1. Identity Verification for Everyone" colors={colors}>
          All Companions must verify their identity with a government-issued ID and a live selfie before accepting bookings. All Seekers (men booking dates) must complete ID verification via Stripe Identity before making their first booking. This two-way verification ensures both parties know who they're meeting. Verified status is displayed on every profile.
        </Section>

        <Section title="2. Meet in Public First" colors={colors}>
          Always meet your date in a public, well-lit location for the first time. Choose restaurants, cafes, or other busy venues. Avoid meeting at private residences for initial bookings. DateRabbit recommends selecting public venues when submitting booking details. Trust your instincts — if something feels off, it's okay to leave.
        </Section>

        <Section title="3. Share Your Plans" colors={colors}>
          Before every date, share the booking details with a trusted friend or family member: the other person's name, profile, meeting location, and expected return time. DateRabbit's app allows you to share your date summary directly from the booking screen. Check in with your contact after the date ends.
        </Section>

        <Section title="4. Safety Check-Ins During Active Dates" colors={colors}>
          During an active booking, both Seekers and Companions receive periodic safety check-ins through the app. If a check-in is missed or you flag a concern, our support team is notified immediately. The in-app SOS button connects you directly to emergency services and alerts DateRabbit's safety team simultaneously. Use it if you ever feel in danger — no questions asked.
        </Section>

        <Section title="5. No Cash. Platform Payments Only." colors={colors}>
          All payments must go through DateRabbit. Never accept or make cash payments outside the Platform. Accepting off-platform payments puts you at risk of fraud and violates our Terms of Service. If anyone pressures you to pay or accept cash, report it immediately. Companions are paid automatically by Stripe — no cash handling required.
        </Section>

        <Section title="6. Secure Payments via Stripe" colors={colors}>
          DateRabbit uses Stripe to process all payments. We never store your card number or full payment details on our servers. Companion earnings are held securely until the date is confirmed complete, then released to the Companion's Stripe account. Seekers receive a full refund if a Companion cancels or fails to appear.
        </Section>

        <Section title="7. Reporting & Blocking" colors={colors}>
          You can report or block any user at any time, directly from their profile or from within a booking. All reports are reviewed by our safety team within 24 hours. Serious violations — including harassment, threatening behavior, solicitation, or assault — result in immediate account suspension and may be reported to law enforcement. Your identity is never disclosed to the user you report.
        </Section>

        <Section title="8. Zero Tolerance Policies" colors={colors}>
          DateRabbit has zero tolerance for: sexual solicitation or sex work of any kind; physical or sexual assault; harassment, stalking, or threatening behavior; sharing another user's personal information without consent; and discrimination based on race, gender, sexuality, religion, or national origin. Violations result in permanent account bans and may be escalated to law enforcement.
        </Section>

        <Section title="9. Community Standards" colors={colors}>
          All users must treat each other with respect. Companions have the right to decline or cancel any booking at any time without explanation. Seekers must respect Companion boundaries and cancellation decisions. Rudeness, pressure, or intimidation of any kind is prohibited. DateRabbit's community thrives when everyone feels safe and respected.
        </Section>

        <Section title="10. 24/7 Safety Support" colors={colors}>
          {'Our safety and support team is available 24 hours a day, 7 days a week.\n\nIn-app: Use the Help button in any active booking\nEmail: support@daterabbit.app\nEmergency: Always call 911 if you are in immediate danger'}
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
