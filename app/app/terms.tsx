import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { useTheme, spacing, typography, borderRadius, PAGE_PADDING } from '../src/constants/theme';

export default function TermsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last updated: February 2026</Text>

        <Section title="1. Acceptance of Terms" colors={colors}>
          By accessing or using DateRabbit ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.
        </Section>

        <Section title="2. Eligibility" colors={colors}>
          You must be at least 18 years old to use DateRabbit. By registering, you confirm that you meet this age requirement and that all information you provide is accurate.
        </Section>

        <Section title="3. Account Registration" colors={colors}>
          You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.
        </Section>

        <Section title="4. Platform Services" colors={colors}>
          DateRabbit connects seekers with companions for social experiences. The Platform facilitates bookings, payments, and communication between users. DateRabbit is not a party to any arrangement between users.
        </Section>

        <Section title="5. Companion Guidelines" colors={colors}>
          Companions set their own hourly rates and availability. Companions must complete identity verification before accepting bookings. All interactions must remain respectful and within legal boundaries.
        </Section>

        <Section title="6. Seeker Guidelines" colors={colors}>
          Seekers must complete identity verification before booking. Cancellation policies apply as described in each booking. Harassment or inappropriate behavior will result in account termination.
        </Section>

        <Section title="7. Payments & Fees" colors={colors}>
          A 15% service fee is applied to all bookings. Payments are processed securely through Stripe. Refunds are handled on a case-by-case basis according to our cancellation policy.
        </Section>

        <Section title="8. Prohibited Conduct" colors={colors}>
          Users may not: solicit illegal activities, harass other users, create fake accounts, circumvent Platform payments, or share another user's personal information without consent.
        </Section>

        <Section title="9. Account Termination" colors={colors}>
          We reserve the right to suspend or terminate accounts that violate these Terms. You may delete your account at any time through the Settings page.
        </Section>

        <Section title="10. Limitation of Liability" colors={colors}>
          DateRabbit is not liable for any interactions between users. We provide the Platform "as is" without warranties of any kind.
        </Section>

        <Section title="11. Contact" colors={colors}>
          For questions about these Terms, contact us at support@daterabbit.com.
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
