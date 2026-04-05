import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
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
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last updated: April 2026</Text>

        <Section title="1. Acceptance of Terms" colors={colors}>
          By accessing or using DateRabbit ("the Platform," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms in their entirety, you must not access or use the Platform. These Terms constitute a legally binding agreement between you and DateRabbit, Inc., a Delaware corporation.
        </Section>

        <Section title="2. Eligibility" colors={colors}>
          You must be at least 18 years of age to use DateRabbit. Seekers (users who book Companions) must be at least 21 years of age and complete government-issued ID verification before their first booking. The Platform is available only to residents of the United States. By registering, you represent and warrant that you meet all eligibility requirements and that all information you provide is accurate, current, and complete.
        </Section>

        <Section title="3. Platform Description" colors={colors}>
          DateRabbit is a paid companion platform that connects Seekers with Companions for in-person social and dating experiences in the United States. Seekers are users who pay to book time with Companions. Companions are users who set their own rates and availability and earn income through the Platform. DateRabbit facilitates bookings, handles payments via Stripe, and provides safety tools — but is not a party to any arrangement, agreement, or interaction between users.
        </Section>

        <Section title="4. User Roles" colors={colors}>
          Seekers: Browse Companion profiles, book sessions, and pay through the Platform. Seekers must complete ID verification (Stripe Identity) before their first booking. Cancellation policies apply per each booking as disclosed at checkout.

          Companions: Set hourly rates, availability, and session preferences. Companions must complete identity verification (government ID + selfie) before accepting bookings. Companions are independent contractors, not employees of DateRabbit.
        </Section>

        <Section title="5. Payments & Platform Fee" colors={colors}>
          All payments are processed securely via Stripe. DateRabbit charges a 15% platform service fee on each booking, deducted from the Companion's earnings. Seekers are charged the full booking amount at the time of booking. Companions receive payouts within 2 business days of a completed date, subject to Stripe's payout schedule. No cash exchanges between users are permitted. Circumventing the Platform's payment system is grounds for immediate account termination.
        </Section>

        <Section title="6. Prohibited Conduct" colors={colors}>
          Users are strictly prohibited from: (a) soliciting, facilitating, or engaging in any form of sexual services or sex work; (b) exchanging money outside the Platform; (c) harassing, threatening, or discriminating against other users; (d) creating fake accounts or misrepresenting identity; (e) sharing another user's personal information without consent; (f) using the Platform for any illegal activity; (g) attempting to circumvent safety or verification systems; or (h) violating any applicable federal, state, or local law. Violations will result in immediate account suspension and may be reported to law enforcement.
        </Section>

        <Section title="7. Identity Verification" colors={colors}>
          DateRabbit uses Stripe Identity for identity verification. By submitting verification documents, you consent to Stripe's processing of your personal data per Stripe's Privacy Policy. DateRabbit does not store raw ID images after verification is complete. Falsifying identity documents or providing false information during verification is a violation of these Terms and may constitute a federal crime.
        </Section>

        <Section title="8. Safety & Reporting" colors={colors}>
          DateRabbit provides in-app safety tools including safety check-ins and an SOS feature during active bookings. Users are encouraged to meet in public places and share date details with trusted contacts. Any user who experiences or witnesses unsafe behavior must report it immediately via the in-app report function. DateRabbit reviews all reports within 24 hours. Serious safety violations result in immediate account suspension.
        </Section>

        <Section title="9. Account Termination" colors={colors}>
          DateRabbit reserves the right to suspend, restrict, or permanently terminate any account at our sole discretion, with or without notice, for violation of these Terms or for any conduct we deem harmful to the Platform or its users. You may delete your account at any time through Settings. Upon deletion, your data is removed within 30 days in accordance with our Privacy Policy.
        </Section>

        <Section title="10. Disclaimers & Limitation of Liability" colors={colors}>
          The Platform is provided "as is" without warranties of any kind, express or implied. DateRabbit is not responsible for the conduct, actions, or safety of any user. To the maximum extent permitted by law, DateRabbit's liability to you for any claim arising out of these Terms or your use of the Platform shall not exceed the greater of $100 or the amount you paid to DateRabbit in the past 12 months. DateRabbit is not liable for indirect, incidental, punitive, or consequential damages.
        </Section>

        <Section title="11. Dispute Resolution & Governing Law" colors={colors}>
          These Terms are governed by and construed in accordance with the laws of the State of Delaware, without regard to conflict of law principles. Any disputes arising out of or relating to these Terms or the Platform shall first be submitted to DateRabbit's in-app dispute resolution system. Unresolved disputes shall be settled by binding individual arbitration in Wilmington, Delaware, under the rules of the American Arbitration Association. You waive the right to participate in class action lawsuits.
        </Section>

        <Section title="12. Changes to Terms" colors={colors}>
          We may update these Terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated Terms. Material changes will be communicated via email or in-app notification at least 14 days before taking effect.
        </Section>

        <Section title="13. Contact" colors={colors}>
          {'DateRabbit, Inc. (Delaware)\nFor questions about these Terms: legal@daterabbit.app\nFor general support: support@daterabbit.app'}
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
