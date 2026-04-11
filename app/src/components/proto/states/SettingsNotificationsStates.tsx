import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function ToggleRow({
  icon,
  label,
  description,
  value,
  onToggle,
  disabled,
}: {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onToggle: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={s.toggleRow}>
      <Feather name={icon as any} size={20} color={disabled ? colors.textLight : colors.text} />
      <View style={s.toggleInfo}>
        <Text style={[s.toggleLabel, disabled && s.toggleDisabled]}>{label}</Text>
        <Text style={s.toggleDesc}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: colors.borderLight, true: colors.primary }}
        thumbColor={colors.surface}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  const [bookingRequests, setBookingRequests] = useState(true);
  const [bookingConfirmed, setBookingConfirmed] = useState(true);
  const [messages, setMessages] = useState(true);
  const [dateReminders, setDateReminders] = useState(true);
  const [promotions, setPromotions] = useState(false);

  return (
    <View style={s.page}>
      <Text style={s.pageTitle}>Notifications</Text>

      <View style={[s.card, shadows.sm]}>
        <ToggleRow
          icon="bell"
          label="Booking Requests"
          description="Get notified of new requests"
          value={bookingRequests}
          onToggle={setBookingRequests}
        />
        <View style={s.rowDivider} />
        <ToggleRow
          icon="check-circle"
          label="Booking Confirmed"
          description="When companion accepts"
          value={bookingConfirmed}
          onToggle={setBookingConfirmed}
        />
        <View style={s.rowDivider} />
        <ToggleRow
          icon="message-circle"
          label="Messages"
          description="New chat messages"
          value={messages}
          onToggle={setMessages}
        />
        <View style={s.rowDivider} />
        <ToggleRow
          icon="clock"
          label="Date Reminders"
          description="1 hour before your date"
          value={dateReminders}
          onToggle={setDateReminders}
        />
        <View style={s.rowDivider} />
        <ToggleRow
          icon="tag"
          label="Promotions"
          description="Special offers"
          value={promotions}
          onToggle={setPromotions}
        />
        <View style={s.rowDivider} />
        <ToggleRow
          icon="shield"
          label="Safety Alerts"
          description="Emergency and safety"
          value={true}
          onToggle={() => {}}
          disabled
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function SettingsNotificationsStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Notification preferences with toggles">
        <View style={{ minHeight: Platform.OS === 'web' ? '100vh' : 844 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: 16, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' }}><Text style={{ fontSize: 18, fontWeight: '700', color: '#7C3AED' }}>DateRabbit</Text><View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}><Feather name="bell" size={20} color="#6B7280" /></View></View>
          <View style={{ flex: 1 }}>

        <DefaultState />
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

  pageTitle: { ...typography.h2, color: colors.text },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  toggleInfo: { flex: 1, gap: 2 },
  toggleLabel: { ...typography.bodyMedium, color: colors.text },
  toggleDesc: { ...typography.caption, color: colors.textMuted },
  toggleDisabled: { color: colors.textLight },

  rowDivider: { height: 1, backgroundColor: colors.borderLight },
});
