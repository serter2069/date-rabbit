import React from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator , ScrollView, useWindowDimensions} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader, ProtoTabBar } from '../NavComponents';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';


// ---------------------------------------------------------------------------
// PageShell
// ---------------------------------------------------------------------------
function PageShell({ children }: { children: React.ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="seeker" />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flex: 1, maxWidth: 960, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
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
      <Text style={s.pageTitle}>Payment</Text>

      {/* Summary */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>Booking Summary</Text>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Companion</Text>
          <Text style={s.summaryValue}>Jessica M.</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Date</Text>
          <Text style={s.summaryValue}>Apr 12, 8 PM</Text>
        </View>
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Duration</Text>
          <Text style={s.summaryValue}>3 hours</Text>
        </View>
      </View>

      {/* Price breakdown */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>Price Breakdown</Text>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Date cost</Text>
          <Text style={s.priceValue}>$450.00</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Platform fee (10%)</Text>
          <Text style={s.priceValue}>$45.00</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Stripe processing (2.9% + $0.30)</Text>
          <Text style={s.priceValue}>$13.36</Text>
        </View>
        <View style={s.divider} />
        <View style={s.priceRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>$508.36</Text>
        </View>
      </View>

      {/* Payment method */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>Payment Method</Text>
        <View style={s.paymentMethodRow}>
          <View style={{ width: 60, height: 40, borderRadius: 6, backgroundColor: colors.text, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={"credit-card" as any} size={20} color={colors.textInverse} />
          </View>
          <View style={s.paymentMethodInfo}>
            <Text style={s.paymentMethodText}>Visa ****4242</Text>
          </View>
          <Pressable>
            <Text style={s.changeLink}>Change</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={[s.primaryBtn, shadows.button]} onPress={() => router.push('/proto/states/booking-request-sent' as any)}>
        <Text style={s.primaryBtnText}>PAY $508.36</Text>
      </Pressable>

      <View style={s.securityNote}>
        <Feather name={"lock" as any} size={14} color={colors.textMuted} />
        <Text style={s.securityText}>Secured by Stripe. Your payment info is encrypted.</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: PROCESSING
// ---------------------------------------------------------------------------
function ProcessingState() {
  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>Payment</Text>

      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>Price Breakdown</Text>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Date cost</Text>
          <Text style={s.priceValue}>$450.00</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Platform fee (10%)</Text>
          <Text style={s.priceValue}>$45.00</Text>
        </View>
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Stripe processing (2.9% + $0.30)</Text>
          <Text style={s.priceValue}>$13.36</Text>
        </View>
        <View style={s.divider} />
        <View style={s.priceRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>$508.36</Text>
        </View>
      </View>

      <View style={[s.card, shadows.sm]}>
        <View style={s.paymentMethodRow}>
          <View style={{ width: 60, height: 40, borderRadius: 6, backgroundColor: colors.text, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }}>
            <Feather name={"credit-card" as any} size={20} color={colors.textInverse} />
          </View>
          <View style={s.paymentMethodInfo}>
            <Text style={s.paymentMethodText}>Visa ****4242</Text>
          </View>
        </View>
      </View>

      <View style={[s.processingBtn]}>
        <ActivityIndicator color={colors.textInverse} size="small" />
        <Text style={s.primaryBtnText}>PROCESSING PAYMENT...</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 3: SUCCESS
// ---------------------------------------------------------------------------
function SuccessState() {
  return (
    <View style={s.page}>
      <View style={s.successCenter}>
        <Feather name={"check-circle" as any} size={64} color={colors.success} />
        <Text style={s.successTitle}>Booking Confirmed!</Text>
        <Text style={s.successSub}>
          Your date with Jessica M. on Apr 12 at 8 PM has been booked.
        </Text>
      </View>

      <Pressable style={[s.primaryBtn, shadows.button]} onPress={() => router.push('/proto/states/seeker-bookings' as any)}>
        <Text style={s.primaryBtnText}>VIEW BOOKING</Text>
      </Pressable>

      <Pressable style={[s.ghostBtn, shadows.sm]} onPress={() => router.push('/proto/states/seeker-home' as any)}>
        <Text style={s.ghostBtnText}>Browse More</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function BookingPaymentStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Payment checkout with price breakdown">
        <PageShell><DefaultState /></PageShell>
      </StateSection>
      <StateSection title="PROCESSING" description="Payment in progress">
        <PageShell><ProcessingState /></PageShell>
      </StateSection>
      <StateSection title="SUCCESS" description="Payment confirmed">
        <PageShell><SuccessState /></PageShell>
      </StateSection>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16 },

  pageTitle: { ...typography.h2, color: colors.text },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 10,
  },

  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: 4 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  summaryLabel: { ...typography.bodySmall, color: colors.textMuted },
  summaryValue: { ...typography.bodyMedium, color: colors.text },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  priceLabel: { ...typography.bodySmall, color: colors.textMuted },
  priceValue: { ...typography.bodySmall, color: colors.text },
  totalLabel: { ...typography.h3, color: colors.text },
  totalValue: { ...typography.h3, color: colors.primary },
  divider: { height: 2, backgroundColor: colors.border, marginVertical: 4 },

  paymentMethodRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paymentMethodInfo: { flex: 1 },
  paymentMethodText: { ...typography.bodyMedium, color: colors.text },
  changeLink: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },

  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  primaryBtnText: { ...typography.button, color: colors.textInverse },

  processingBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.textMuted,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },

  ghostBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  ghostBtnText: { ...typography.button, color: colors.text },

  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  securityText: { ...typography.caption, color: colors.textMuted },

  successCenter: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  successTitle: { ...typography.h2, color: colors.text },
  successSub: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
});
