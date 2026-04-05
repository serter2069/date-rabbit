import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../src/components/Icon';
import { useTheme, spacing, typography, PAGE_PADDING } from '../src/constants/theme';

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xl }]}
      >
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last updated: April 2026</Text>

        <Section title="1. Information We Collect" colors={colors}>
          We collect the following categories of data: (a) Account data — name, email address, date of birth, city/location; (b) Profile data — photos, bio, and hourly rate (Companions only); (c) Identity documents — government-issued ID and selfie, processed by Stripe Identity for verification purposes; (d) Payment data — billing details processed by Stripe (we never store card numbers); (e) Usage data — bookings, in-app messages, reviews, and activity logs; (f) Device data — push notification tokens via Expo, IP address, and device type for security and support.
        </Section>

        <Section title="2. How We Use Your Information" colors={colors}>
          We use your data to: provide and operate the Platform; match Seekers with Companions based on location and preferences; process payments and payouts via Stripe; send transactional emails (OTP codes, booking confirmations) via Brevo; deliver push notifications via Expo; enforce safety policies and investigate reports; comply with legal obligations; and improve Platform features through anonymized analytics.
        </Section>

        <Section title="3. Identity Verification & ID Documents" colors={colors}>
          Identity verification is required for all users. Government-issued ID and selfie images are submitted to Stripe Identity, which performs the verification check. DateRabbit does not store raw ID images on our servers after verification is complete. Stripe's handling of your documents is governed by Stripe's Privacy Policy (stripe.com/privacy). Verification status (approved/rejected) is stored by DateRabbit to enforce access controls.
        </Section>

        <Section title="4. Third-Party Service Providers" colors={colors}>
          We share data with trusted service providers solely to operate the Platform: Stripe (payment processing and identity verification), Brevo (transactional email delivery), and Expo (push notification delivery). These providers act as data processors under our instruction. We do not sell your personal data to advertisers or data brokers.

          Limited profile information (name, photos, bio, city, and rating) is visible to other logged-in users of the Platform as part of normal matching functionality.
        </Section>

        <Section title="5. Location Data" colors={colors}>
          Location data (city-level) is collected at registration to show nearby Companions. Precise real-time location is requested only if you choose to enable location features. We do not track your precise location in the background. You can revoke location permissions at any time through your device settings.
        </Section>

        <Section title="6. Messages & Communications" colors={colors}>
          In-app messages between users are stored securely on our servers and encrypted in transit. We may review message content if a safety concern is reported or if required by law. We send transactional emails (OTP codes, booking confirmations, payout notifications) to your registered email. We do not send marketing emails without your explicit consent.
        </Section>

        <Section title="7. Data Retention" colors={colors}>
          We retain your personal data for as long as your account is active. Upon account deletion, personal data is removed from active systems within 30 days. Certain records may be retained for up to 3 years after account deletion to comply with legal and financial obligations (e.g., payment records, dispute logs). Anonymized usage data may be retained indefinitely for analytics purposes.
        </Section>

        <Section title="8. Data Security" colors={colors}>
          We use industry-standard security measures including: TLS encryption for all data in transit; AES-256 encryption for sensitive data at rest; strict access controls limiting employee access to personal data; regular security assessments. Despite these measures, no system is 100% secure. If you discover a security vulnerability, please report it to security@daterabbit.app immediately.
        </Section>

        <Section title="9. Your Privacy Rights" colors={colors}>
          You have the right to: access a copy of your personal data; correct inaccurate information in your profile; request deletion of your account and associated data; export your data in a portable format; opt out of marketing communications; and withdraw consent for optional data processing. To exercise these rights, contact privacy@daterabbit.app or use the account settings in the app.
        </Section>

        <Section title="10. Children's Privacy" colors={colors}>
          DateRabbit is strictly for adults. We do not knowingly collect personal data from anyone under 18 years of age. If we become aware that an underage user has created an account, we will immediately terminate the account and delete all associated data. If you believe a minor has registered, please contact us at privacy@daterabbit.app.
        </Section>

        <Section title="11. Changes to This Policy" colors={colors}>
          We may update this Privacy Policy from time to time. Material changes will be communicated via email or in-app notification at least 14 days before taking effect. Continued use of the Platform after changes constitutes acceptance of the updated policy.
        </Section>

        <Section title="12. Contact" colors={colors}>
          {'For privacy inquiries, data requests, or to report concerns:\nprivacy@daterabbit.app\n\nDateRabbit, Inc. (Delaware)'}
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
