import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet , ScrollView, useWindowDimensions} from 'react-native';
import { Feather } from '@expo/vector-icons';
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
