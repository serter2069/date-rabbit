import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function VerifiedBadge({ label }: { label: string }) {
  return (
    <View style={s.verifiedBadge}>
      <Feather name={"check-circle" as any} size={12} color={colors.success} />
      <Text style={s.verifiedText}>{label}</Text>
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={s.infoRow}>
      <Feather name={icon as any} size={16} color={colors.textMuted} />
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT (SEEKER VIEW)
// ---------------------------------------------------------------------------
function DefaultSeekerState() {
  return (
    <View style={s.page}>
      {/* Companion header */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.companionHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-booking-detail/80/80' }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.companionInfo}>
            <Text style={s.companionName}>Jessica Martinez</Text>
            <View style={s.ratingRow}>
              <Feather name={"star" as any} size={14} color={colors.primary} />
              <Text style={s.ratingText}>4.9</Text>
            </View>
            <VerifiedBadge label="Verified" />
          </View>
        </View>
      </View>

      {/* Booking info */}
      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>Booking Details</Text>
        <InfoRow icon="calendar" label="Date" value="Tomorrow, Saturday Apr 12" />
        <InfoRow icon="clock" label="Time" value="8:00 PM" />
        <InfoRow icon="clock" label="Duration" value="3 hours" />
        <InfoRow icon="map-pin" label="Location" value="Le Bernardin, NYC" />

        <View style={s.divider} />

        {/* Price breakdown */}
        <View style={s.priceRow}>
          <Text style={s.priceLabel}>Date cost ($150/hr x 3h)</Text>
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
        <View style={[s.priceRow, s.totalRow]}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>$508.36</Text>
        </View>
      </View>

      {/* Status */}
      <View style={[s.statusBadge, { backgroundColor: colors.successLight }]}>
        <Feather name={"check-circle" as any} size={14} color={colors.success} />
        <Text style={[s.statusText, { color: colors.success }]}>Confirmed</Text>
      </View>

      {/* Actions */}
      <Pressable style={[s.primaryBtn, shadows.button]} onPress={() => router.push('/proto/states/booking-payment' as any)}>
        <Feather name={"credit-card" as any} size={16} color={colors.textInverse} />
        <Text style={s.primaryBtnText}>PROCEED TO PAYMENT</Text>
      </Pressable>
      <Pressable style={[s.ghostBtn, shadows.sm]} onPress={() => router.push('/proto/states/seeker-messages' as any)}>
        <Feather name={"message-circle" as any} size={16} color={colors.text} />
        <Text style={s.ghostBtnText}>MESSAGE COMPANION</Text>
      </Pressable>
      <Pressable style={s.cancelBtn} onPress={() => router.push('/proto/states/seeker-bookings' as any)}>
        <Feather name={"x" as any} size={14} color={colors.error} />
        <Text style={s.cancelBtnText}>Cancel Booking</Text>
      </Pressable>

      <Text style={s.note}>Cancellation policy: Full refund if cancelled 24h+ before</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: PENDING (SEEKER VIEW)
// ---------------------------------------------------------------------------
function PendingSeekerState() {
  return (
    <View style={s.page}>
      <View style={[s.card, shadows.sm]}>
        <View style={s.companionHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-booking-detail/80/80' }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.companionInfo}>
            <Text style={s.companionName}>Jessica Martinez</Text>
            <View style={s.ratingRow}>
              <Feather name={"star" as any} size={14} color={colors.primary} />
              <Text style={s.ratingText}>4.9</Text>
            </View>
            <VerifiedBadge label="Verified" />
          </View>
        </View>
      </View>

      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>Booking Details</Text>
        <InfoRow icon="calendar" label="Date" value="Tomorrow, Saturday Apr 12" />
        <InfoRow icon="clock" label="Time" value="8:00 PM" />
        <InfoRow icon="clock" label="Duration" value="3 hours" />
        <InfoRow icon="map-pin" label="Location" value="Le Bernardin, NYC" />
        <View style={s.divider} />
        <View style={[s.priceRow, s.totalRow]}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>$508.36</Text>
        </View>
      </View>

      <View style={[s.statusBadge, { backgroundColor: colors.warningLight }]}>
        <Feather name={"clock" as any} size={14} color={colors.warning} />
        <Text style={[s.statusText, { color: colors.warning }]}>Pending</Text>
      </View>

      <View style={s.timerBanner}>
        <Feather name={"clock" as any} size={16} color={colors.warning} />
        <Text style={s.timerText}>Companion has 2h to respond</Text>
      </View>

      <Pressable style={s.cancelBtn}>
        <Feather name={"x" as any} size={14} color={colors.error} />
        <Text style={s.cancelBtnText}>Cancel Request</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 3: COMPANION VIEW
// ---------------------------------------------------------------------------
function CompanionViewState() {
  return (
    <View style={s.page}>
      <View style={[s.card, shadows.sm]}>
        <View style={s.companionHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/james-seeker-detail/80/80' }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.companionInfo}>
            <Text style={s.companionName}>James Wilson</Text>
            <VerifiedBadge label="Verified Seeker" />
            <Pressable>
              <Text style={s.linkText}>View Seeker Profile</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={[s.card, shadows.sm]}>
        <Text style={s.sectionTitle}>Booking Details</Text>
        <InfoRow icon="calendar" label="Date" value="Tomorrow, Saturday Apr 12" />
        <InfoRow icon="clock" label="Time" value="8:00 PM" />
        <InfoRow icon="clock" label="Duration" value="3 hours" />
        <InfoRow icon="map-pin" label="Location" value="Le Bernardin, NYC" />
        <View style={s.divider} />
        <View style={[s.priceRow, s.totalRow]}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>$508.36</Text>
        </View>
      </View>

      <View style={s.actionRow}>
        <Pressable style={[s.acceptBtn, shadows.button]}>
          <Feather name={"check-circle" as any} size={16} color={colors.textInverse} />
          <Text style={s.acceptBtnText}>ACCEPT</Text>
        </Pressable>
        <Pressable style={[s.declineBtn, shadows.sm]}>
          <Feather name={"x" as any} size={16} color={colors.textInverse} />
          <Text style={s.declineBtnText}>DECLINE</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 4: COMPLETED
// ---------------------------------------------------------------------------
function CompletedState() {
  return (
    <View style={s.page}>
      <View style={s.completedHeader}>
        <Feather name={"check-circle" as any} size={48} color={colors.success} />
        <Text style={s.completedTitle}>Booking Completed</Text>
      </View>

      <View style={[s.card, shadows.sm]}>
        <View style={s.companionHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-booking-detail/80/80' }} style={{ width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.companionInfo}>
            <Text style={s.companionName}>Jessica Martinez</Text>
            <View style={[s.statusBadgeInline, { backgroundColor: colors.successLight }]}>
              <Text style={[s.statusText, { color: colors.success }]}>Completed</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={s.completedNote}>This date has been completed.</Text>

      <Pressable style={[s.primaryBtn, shadows.button]} onPress={() => router.push('/proto/states/reviews-write' as any)}>
        <Feather name={"star" as any} size={16} color={colors.textInverse} />
        <Text style={s.primaryBtnText}>LEAVE A REVIEW</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function BookingDetailStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT (SEEKER VIEW)" description="Booking detail modal — confirmed">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultSeekerState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="PENDING (SEEKER VIEW)" description="Awaiting companion response">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <PendingSeekerState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="COMPANION VIEW" description="Companion sees accept/decline">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <CompanionViewState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
</StateSection>
      <StateSection title="COMPLETED" description="Date completed, leave review">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <CompletedState />
                </View>
          <View style={{ flexDirection: 'row', height: 56, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E7EB', alignItems: 'center' }}>{[{i:'home',l:'Home'},{i:'calendar',l:'Bookings'},{i:'message-circle',l:'Messages'},{i:'user',l:'Profile'}].map(t=>(<View key={t.l} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Feather name={t.i} size={20} color="#6B7280" /><Text style={{ fontSize: 10, color: '#6B7280' }}>{t.l}</Text></View>))}</View>
        </View>
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

  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 12,
  },

  companionHeader: { flexDirection: 'row', gap: 16, alignItems: 'center' },
  companionInfo: { flex: 1, gap: 4 },
  companionName: { ...typography.h3, color: colors.text },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { ...typography.bodyMedium, color: colors.text },

  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  verifiedText: { ...typography.caption, color: colors.success, fontWeight: '700' },

  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: 4 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  infoLabel: { ...typography.bodySmall, color: colors.textMuted, width: 70 },
  infoValue: { ...typography.bodyMedium, color: colors.text, flex: 1 },

  divider: { height: 2, backgroundColor: colors.borderLight, marginVertical: 4 },

  priceRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2 },
  priceLabel: { ...typography.bodySmall, color: colors.textMuted },
  priceValue: { ...typography.bodySmall, color: colors.text },
  totalRow: { borderTopWidth: 2, borderTopColor: colors.border, paddingTop: 8, marginTop: 4 },
  totalLabel: { ...typography.h3, color: colors.text },
  totalValue: { ...typography.h3, color: colors.primary },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusText: { ...typography.caption, fontWeight: '700' },

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

  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    alignSelf: 'center',
  },
  cancelBtnText: { ...typography.bodySmall, color: colors.error },

  note: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },

  timerBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  timerText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },

  linkText: { ...typography.bodySmall, color: colors.primary, fontWeight: '600' },

  actionRow: { flexDirection: 'row', gap: 12 },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.success,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  acceptBtnText: { ...typography.button, color: colors.textInverse },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  declineBtnText: { ...typography.button, color: colors.textInverse },

  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  ghostBtnText: { ...typography.button, color: colors.text },

  completedHeader: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  completedTitle: { ...typography.h2, color: colors.text },
  completedNote: { ...typography.bodySmall, color: colors.textMuted, textAlign: 'center' },
});
