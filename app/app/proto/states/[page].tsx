import React, { Suspense, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { pageRegistry } from '../../../src/constants/pageRegistry';
import { colors, typography, borderRadius, borderWidth as bw } from '../../../src/constants/theme';
import { OverviewStates } from '../../../src/components/proto/states/OverviewStates';
import { BrandStates } from '../../../src/components/proto/states/BrandStates';
import { LandingStates } from '../../../src/components/proto/states/LandingStates';
import { AuthWelcomeStates } from '../../../src/components/proto/states/AuthWelcomeStates';
import { AuthLoginStates } from '../../../src/components/proto/states/AuthLoginStates';
import { AuthOtpStates } from '../../../src/components/proto/states/AuthOtpStates';
import { AuthRoleSelectStates } from '../../../src/components/proto/states/AuthRoleSelectStates';
import { AuthProfileSetupStates } from '../../../src/components/proto/states/AuthProfileSetupStates';
import { VerifyIntroStates } from '../../../src/components/proto/states/VerifyIntroStates';
import { VerifyPhotoIdStates } from '../../../src/components/proto/states/VerifyPhotoIdStates';
import { VerifySelfieStates } from '../../../src/components/proto/states/VerifySelfieStates';
import { VerifyConsentStates } from '../../../src/components/proto/states/VerifyConsentStates';
import { VerifyPendingStates } from '../../../src/components/proto/states/VerifyPendingStates';
import { VerifyApprovedStates } from '../../../src/components/proto/states/VerifyApprovedStates';
import { CompOnboardStep2States } from '../../../src/components/proto/states/CompOnboardStep2States';
import { CompOnboardVerifyStates } from '../../../src/components/proto/states/CompOnboardVerifyStates';
import { CompOnboardPendingStates } from '../../../src/components/proto/states/CompOnboardPendingStates';
import { CompOnboardApprovedStates } from '../../../src/components/proto/states/CompOnboardApprovedStates';
import { SeekerHomeStates } from '../../../src/components/proto/states/SeekerHomeStates';
import { SeekerBookingsStates } from '../../../src/components/proto/states/SeekerBookingsStates';
import { SeekerMessagesStates } from '../../../src/components/proto/states/SeekerMessagesStates';
import { SeekerProfileStates } from '../../../src/components/proto/states/SeekerProfileStates';
import { SeekerFavoritesStates } from '../../../src/components/proto/states/SeekerFavoritesStates';
import { CompHomeStates } from '../../../src/components/proto/states/CompHomeStates';
import { CompRequestsStates } from '../../../src/components/proto/states/CompRequestsStates';
import { CompCalendarStates } from '../../../src/components/proto/states/CompCalendarStates';
import { CompEarningsStates } from '../../../src/components/proto/states/CompEarningsStates';
import { CompProfileStates } from '../../../src/components/proto/states/CompProfileStates';
import { CompStripeConnectStates } from '../../../src/components/proto/states/CompStripeConnectStates';
import { BookingDetailStates } from '../../../src/components/proto/states/BookingDetailStates';
import { BookingPaymentStates } from '../../../src/components/proto/states/BookingPaymentStates';
import { BookingRequestSentStates } from '../../../src/components/proto/states/BookingRequestSentStates';
import { BookingDeclinedStates } from '../../../src/components/proto/states/BookingDeclinedStates';
import { ReviewsViewStates } from '../../../src/components/proto/states/ReviewsViewStates';
import { ReviewsWriteStates } from '../../../src/components/proto/states/ReviewsWriteStates';
import { SettingsStates } from '../../../src/components/proto/states/SettingsStates';
import { SettingsEditProfileStates } from '../../../src/components/proto/states/SettingsEditProfileStates';
import { SettingsNotificationsStates } from '../../../src/components/proto/states/SettingsNotificationsStates';
import { AdminCitiesStates } from '../../../src/components/proto/states/AdminCitiesStates';
import { ComponentsStates } from '../../../src/components/proto/states/ComponentsStates';

// Dynamic component import map — populated as pages are prototyped
const STATE_COMPONENTS: Record<string, React.ComponentType<any>> = {
  'overview': OverviewStates,
  'brand': BrandStates,
  'components': ComponentsStates,
  'landing': LandingStates,
  'auth-welcome': AuthWelcomeStates,
  'auth-login': AuthLoginStates,
  'auth-otp': AuthOtpStates,
  'auth-role-select': AuthRoleSelectStates,
  'auth-profile-setup': AuthProfileSetupStates,
  'verify-intro': VerifyIntroStates,
  'verify-photo-id': VerifyPhotoIdStates,
  'verify-selfie': VerifySelfieStates,
  'verify-consent': VerifyConsentStates,
  'verify-pending': VerifyPendingStates,
  'verify-approved': VerifyApprovedStates,
  'comp-onboard-step2': CompOnboardStep2States,
  'comp-onboard-verify': CompOnboardVerifyStates,
  'comp-onboard-pending': CompOnboardPendingStates,
  'comp-onboard-approved': CompOnboardApprovedStates,
  'seeker-home': SeekerHomeStates,
  'seeker-bookings': SeekerBookingsStates,
  'seeker-messages': SeekerMessagesStates,
  'seeker-profile': SeekerProfileStates,
  'seeker-favorites': SeekerFavoritesStates,
  'comp-home': CompHomeStates,
  'comp-requests': CompRequestsStates,
  'comp-calendar': CompCalendarStates,
  'comp-earnings': CompEarningsStates,
  'comp-profile': CompProfileStates,
  'comp-stripe-connect': CompStripeConnectStates,
  'booking-detail': BookingDetailStates,
  'booking-payment': BookingPaymentStates,
  'booking-request-sent': BookingRequestSentStates,
  'booking-declined': BookingDeclinedStates,
  'reviews-view': ReviewsViewStates,
  'reviews-write': ReviewsWriteStates,
  'settings': SettingsStates,
  'settings-edit-profile': SettingsEditProfileStates,
  'settings-notifications': SettingsNotificationsStates,
  'admin-cities': AdminCitiesStates,
};

function loadStatesComponent(pageId: string) {
  return STATE_COMPONENTS[pageId] || null;
}

export default function StateShowcase() {
  const { page } = useLocalSearchParams<{ page: string }>();

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'GET_STATES') return;
      const elements = document.querySelectorAll('[data-state-name]');
      const states = Array.from(elements).map(el => ({
        name: el.getAttribute('data-state-name'),
        y: (el as HTMLElement).getBoundingClientRect().top + window.scrollY
      }));
      (e.source as Window)?.postMessage({ type: 'STATES_LIST', states }, '*');
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
  const entry = pageRegistry.find(p => p.id === page);

  if (!entry) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Page &quot;{page}&quot; not found in registry.</Text>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Back to Index</Text>
        </Pressable>
      </View>
    );
  }

  const Component = loadStatesComponent(page!);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.push('/proto' as any)} style={styles.backLink}>
          <ArrowLeft size={16} color={colors.text} />
          <Text style={styles.backLinkText}>Proto Index</Text>
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{entry.title}</Text>
          <Text style={styles.headerRoute}>{entry.route}</Text>
        </View>
      </View>

      {entry.notes && entry.notes.length > 0 && (
        <View style={styles.notesBar}>
          <Text style={styles.notesLabel}>NOTES:</Text>
          {entry.notes.map((note, i) => (
            <Text key={i} style={styles.noteText}>
              [{note.date}] {note.state ? `(${note.state}) ` : ''}{note.text}
            </Text>
          ))}
        </View>
      )}

      <ScrollView style={styles.content}>
        {Component ? (
          <Suspense fallback={<ActivityIndicator color={colors.primary} />}>
            <Component />
          </Suspense>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderTitle}>{entry.title}</Text>
            <Text style={styles.placeholderText}>
              States prototype not yet created.
            </Text>
            <Text style={styles.placeholderHint}>
              Run: /proto daterabbit {entry.id}
            </Text>
            <View style={styles.statesPreview}>
              <Text style={styles.statesLabel}>Expected states ({entry.stateCount}):</Text>
              <Text style={styles.statesNote}>Will be listed once prototype is created.</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backLinkText: { ...typography.caption, fontWeight: '700', color: colors.text },
  headerInfo: { flex: 1 },
  headerTitle: { ...typography.h3, color: colors.text },
  headerRoute: { ...typography.caption, color: colors.textMuted, fontFamily: 'monospace' },
  notesBar: {
    backgroundColor: colors.badge.warning.bg,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    padding: 12,
  },
  notesLabel: { ...typography.label, color: colors.textMuted, marginBottom: 4 },
  noteText: { ...typography.caption, color: colors.textSecondary, marginBottom: 2 },
  content: { flex: 1 },
  placeholder: {
    margin: 24,
    padding: 24,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  placeholderTitle: { ...typography.h2, color: colors.text, marginBottom: 8 },
  placeholderText: { ...typography.bodySmall, color: colors.textMuted, marginBottom: 8 },
  placeholderHint: {
    ...typography.caption,
    color: colors.accent,
    fontFamily: 'monospace',
    backgroundColor: colors.badge.pink.bg,
    padding: 8,
    borderRadius: borderRadius.xs,
    marginBottom: 16,
  },
  statesPreview: { width: '100%', marginTop: 16 },
  statesLabel: { ...typography.caption, fontWeight: '700', color: colors.textSecondary, marginBottom: 4 },
  statesNote: { ...typography.caption, color: colors.textLight },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { ...typography.body, color: colors.error, marginBottom: 16 },
  backBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  backBtnText: { ...typography.button, color: colors.textInverse },
});
