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
        <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>Last updated: February 2026</Text>

        <Section title="1. Information We Collect" colors={colors}>
          We collect information you provide during registration (name, email, date of birth, location), profile data (photos, bio, hourly rate for companions), and usage data (bookings, messages, reviews).
        </Section>

        <Section title="2. How We Use Your Information" colors={colors}>
          Your information is used to: provide and improve our services, facilitate bookings between users, process payments, send important notifications, and ensure platform safety.
        </Section>

        <Section title="3. Identity Verification" colors={colors}>
          For safety, we require identity verification (government ID and selfie). Verification data is processed securely and used solely for identity confirmation. We do not store raw ID images after verification is complete.
        </Section>

        <Section title="4. Information Sharing" colors={colors}>
          We share limited profile information with other users (name, photos, bio, rating). Payment information is processed by Stripe and never stored on our servers. We do not sell your personal data to third parties.
        </Section>

        <Section title="5. Location Data" colors={colors}>
          Location data is used to show nearby companions and calculate distances. You can control location permissions through your device settings. We do not track your location in the background.
        </Section>

        <Section title="6. Messages & Communications" colors={colors}>
          Messages between users are stored securely on our servers. We may review messages if a safety concern is reported. We send transactional emails (booking confirmations, OTP codes) to your registered email.
        </Section>

        <Section title="7. Data Retention" colors={colors}>
          Account data is retained while your account is active. Upon account deletion, personal data is removed within 30 days. Anonymized usage data may be retained for analytics.
        </Section>

        <Section title="8. Data Security" colors={colors}>
          We use industry-standard security measures including encryption in transit (TLS), secure password hashing, and access controls. Despite our efforts, no system is 100% secure.
        </Section>

        <Section title="9. Your Rights" colors={colors}>
          You have the right to: access your personal data, correct inaccurate data, delete your account and data, export your data, and opt out of marketing communications.
        </Section>

        <Section title="10. Cookies & Analytics" colors={colors}>
          We use essential cookies for authentication and session management. We may use analytics tools to understand usage patterns. You can control cookies through your browser settings.
        </Section>

        <Section title="11. Children's Privacy" colors={colors}>
          DateRabbit is not intended for users under 18. We do not knowingly collect data from minors. If we discover an underage account, it will be immediately terminated.
        </Section>

        <Section title="12. Contact" colors={colors}>
          For privacy inquiries, contact us at privacy@daterabbit.com.
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
