import React from 'react';
import { View, Text, Pressable, StyleSheet, Image, ScrollView, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader } from '../NavComponents';
import { colors, typography, borderRadius, borderWidth, shadows, spacing } from '../../../constants/theme';


// ---------------------------------------------------------------------------
// PageShell
// ---------------------------------------------------------------------------
function PageShell({ children }: { children: React.ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="seeker" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={{ flex: 1, maxWidth: 520, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  return (
    <View style={s.page}>
      <View style={s.heroCenter}>
        <View style={[s.iconWrap, shadows.md]}>
          <Feather name={"send" as any} size={48} color={colors.primary} />
        </View>
        <Text style={s.heroTitle}>Request Sent!</Text>
        <Text style={s.heroSub}>Jessica will respond within 1 hour</Text>
      </View>

      {/* Booking details card */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.companionRow}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-request/64/64' }} style={s.companionAvatar} />
          <View style={s.companionInfo}>
            <Text style={s.companionName}>Jessica Martinez</Text>
            <View style={s.ratingRow}>
              <Feather name="star" size={12} color={colors.warning} />
              <Text style={s.ratingText}>4.9 (47 reviews)</Text>
            </View>
          </View>
          <View style={s.priceTag}>
            <Text style={s.priceText}>$150/hr</Text>
          </View>
        </View>

        <View style={s.divider} />

        {[
          { icon: 'calendar', label: 'Date', value: 'Saturday, Apr 12' },
          { icon: 'clock', label: 'Time', value: '8:00 PM - 3 hours' },
          { icon: 'map-pin', label: 'Location', value: 'Le Bernardin, NYC' },
        ].map((detail, i) => (
          <View key={i} style={s.detailRow}>
            <View style={s.detailIcon}>
              <Feather name={detail.icon as any} size={14} color={colors.primary} />
            </View>
            <Text style={s.detailLabel}>{detail.label}</Text>
            <Text style={s.detailValue}>{detail.value}</Text>
          </View>
        ))}

        <View style={s.divider} />

        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>$450.00</Text>
        </View>
        <Text style={s.totalBreakdown}>3hrs x $150 + $45 platform fee</Text>
      </View>

      {/* Info banner */}
      <View style={s.infoBanner}>
        <Feather name="info" size={14} color={colors.info} />
        <Text style={s.infoText}>
          Your payment is held in escrow. You'll only be charged if Jessica accepts.
        </Text>
      </View>

      {/* Next steps */}
      <View style={s.nextSteps}>
        <Text style={s.nextStepsTitle}>WHAT HAPPENS NEXT</Text>
        {[
          { icon: 'bell', text: 'Push notification when she responds' },
          { icon: 'message-circle', text: 'Chat opens after acceptance' },
          { icon: 'calendar', text: 'Date details confirmed via email' },
        ].map((step, i) => (
          <View key={i} style={s.nextStep}>
            <Feather name={step.icon as any} size={14} color={colors.primary} />
            <Text style={s.nextStepText}>{step.text}</Text>
          </View>
        ))}
      </View>

      <Pressable style={[s.ghostBtn, shadows.button]} onPress={() => router.push('/proto/states/seeker-bookings' as any)}>
        <Feather name="calendar" size={16} color={colors.text} />
        <Text style={s.ghostBtnText}>VIEW MY BOOKINGS</Text>
      </Pressable>

      <Pressable onPress={() => router.push('/proto/states/seeker-home' as any)}>
        <Text style={s.linkText}>Continue Browsing</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function BookingRequestSentStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Request sent confirmation with booking details and next steps">
        <PageShell><DefaultState /></PageShell>
      </StateSection>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16, alignItems: 'stretch', paddingVertical: 24 },

  heroCenter: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  iconWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.badge.pink.bg,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: { ...typography.h1, color: colors.text },
  heroSub: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },

  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 8,
  },
  companionRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  companionAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  companionInfo: { flex: 1, gap: 2 },
  companionName: { ...typography.h3, color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { ...typography.caption, color: colors.textMuted },
  priceTag: {
    backgroundColor: colors.backgroundWarm,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  priceText: { ...typography.bodyMedium, color: colors.text, fontWeight: '700' },

  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: 4,
  },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  detailIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.badge.pink.bg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  detailLabel: { ...typography.caption, color: colors.textMuted, width: 60 },
  detailValue: { ...typography.bodySmall, color: colors.text, flex: 1 },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: { ...typography.bodyMedium, color: colors.text },
  totalValue: { ...typography.h3, color: colors.primary },
  totalBreakdown: { ...typography.caption, color: colors.textMuted, textAlign: 'right' },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.infoLight,
    borderWidth: borderWidth.thin,
    borderColor: colors.info,
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  infoText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1, lineHeight: 20 },

  nextSteps: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: 14,
    gap: 8,
  },
  nextStepsTitle: { ...typography.label, color: colors.textMuted, marginBottom: 4 },
  nextStep: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nextStepText: { ...typography.bodySmall, color: colors.textSecondary },

  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  ghostBtnText: { ...typography.button, color: colors.text },

  linkText: { ...typography.bodyMedium, color: colors.primary, textAlign: 'center', paddingVertical: 8 },
});
