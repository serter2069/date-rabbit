import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StateSection } from '../StateSection';
import { ProtoHeader } from '../NavComponents';
import { colors, typography, spacing, borderRadius, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// PageShell
// ---------------------------------------------------------------------------
function PageShell({ children }: { children: React.ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="seeker" title="Active Date" />
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
function ActionButton({ label, icon, color, textColor, onPress }: { label: string; icon: string; color: string; textColor?: string; onPress?: () => void }) {
  return (
    <Pressable style={[s.actionBtn, { backgroundColor: color }]} onPress={onPress}>
      <Feather name={icon as any} size={18} color={textColor || colors.text} />
      <Text style={[s.actionText, textColor ? { color: textColor } : {}]}>{label}</Text>
    </Pressable>
  );
}

function ModalOverlay({ children }: { children: React.ReactNode }) {
  return (
    <View style={s.modalOverlay}>
      <View style={s.modalCard}>
        {children}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT — Active date with countdown timer + action grid
// ---------------------------------------------------------------------------
function DefaultState() {
  return (
    <View style={s.page}>
      {/* Header info */}
      <View style={s.header}>
        <Text style={s.headerName}>James & Jessica</Text>
        <Text style={s.headerActivity}>Dinner · Le Bernardin, NYC</Text>
      </View>

      {/* Timer */}
      <View style={[s.timerCard, shadows.md]}>
        <Text style={s.timerText}>02:14:33</Text>
        <Text style={s.timerLabel}>TIME REMAINING</Text>
      </View>

      {/* Action grid */}
      <View style={s.grid}>
        <ActionButton label="Extend Time" icon="plus-circle" color={colors.accent} />
        <ActionButton label="End Early" icon="x-circle" color={colors.primaryLight} />
        <ActionButton label="Date Plan" icon="map" color={colors.surface} />
        <ActionButton label="Photos" icon="camera" color={colors.surface} />
        <ActionButton label="Report Issue" icon="flag" color={colors.surface} />
        <ActionButton label="SOS" icon="alert-triangle" color={colors.error} textColor={colors.textInverse} />
      </View>

      {/* Chat FAB */}
      <View style={s.chatFab}>
        <Feather name="message-circle" size={24} color={colors.text} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: LOW TIME — Timer under 30 min, warning state
// ---------------------------------------------------------------------------
function LowTimeState() {
  return (
    <View style={s.page}>
      <View style={s.header}>
        <Text style={s.headerName}>James & Jessica</Text>
        <Text style={s.headerActivity}>Dinner · Le Bernardin, NYC</Text>
      </View>

      {/* Timer — LOW */}
      <View style={[s.timerCardLow, shadows.md]}>
        <Text style={s.timerTextLow}>00:12:07</Text>
        <Text style={s.timerLabel}>TIME REMAINING</Text>
      </View>

      {/* Extend prompt */}
      <View style={[s.extendPrompt, shadows.sm]}>
        <Feather name="clock" size={16} color={colors.warning} />
        <Text style={s.extendPromptText}>Running low on time? Extend your date!</Text>
        <Pressable style={s.extendBtn}>
          <Text style={s.extendBtnText}>+1 HOUR</Text>
        </Pressable>
      </View>

      <View style={s.grid}>
        <ActionButton label="Extend Time" icon="plus-circle" color={colors.accent} />
        <ActionButton label="End Early" icon="x-circle" color={colors.primaryLight} />
        <ActionButton label="Date Plan" icon="map" color={colors.surface} />
        <ActionButton label="Photos" icon="camera" color={colors.surface} />
        <ActionButton label="Report Issue" icon="flag" color={colors.surface} />
        <ActionButton label="SOS" icon="alert-triangle" color={colors.error} textColor={colors.textInverse} />
      </View>

      <View style={s.chatFab}>
        <Feather name="message-circle" size={24} color={colors.text} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 3: SAFETY CHECK-IN MODAL — Prompted every 30 min
// ---------------------------------------------------------------------------
function SafetyCheckinState() {
  return (
    <View style={s.page}>
      <View style={s.header}>
        <Text style={s.headerName}>James & Jessica</Text>
        <Text style={s.headerActivity}>Dinner · Le Bernardin, NYC</Text>
      </View>

      <View style={[s.timerCard, shadows.md]}>
        <Text style={s.timerText}>01:22:15</Text>
        <Text style={s.timerLabel}>TIME REMAINING</Text>
      </View>

      <View style={s.grid}>
        <ActionButton label="Extend Time" icon="plus-circle" color={colors.accent} />
        <ActionButton label="End Early" icon="x-circle" color={colors.primaryLight} />
        <ActionButton label="Date Plan" icon="map" color={colors.surface} />
        <ActionButton label="Photos" icon="camera" color={colors.surface} />
        <ActionButton label="Report Issue" icon="flag" color={colors.surface} />
        <ActionButton label="SOS" icon="alert-triangle" color={colors.error} textColor={colors.textInverse} />
      </View>

      {/* Safety check-in modal overlay */}
      <ModalOverlay>
        <Text style={s.modalTitle}>Safety Check-in</Text>
        <Text style={s.modalBody}>Are you OK? Tap to confirm you're safe.</Text>
        <Pressable style={[s.modalOkBtn, shadows.sm]}>
          <Feather name="check-circle" size={16} color={colors.text} />
          <Text style={s.modalOkText}>I'M OK</Text>
        </Pressable>
        <Pressable style={s.modalHelpBtn}>
          <Feather name="alert-triangle" size={14} color={colors.textInverse} />
          <Text style={s.modalHelpText}>I NEED HELP</Text>
        </Pressable>
      </ModalOverlay>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 4: EXTEND REQUEST — Companion sees pending extend request
// ---------------------------------------------------------------------------
function ExtendRequestState() {
  return (
    <View style={s.page}>
      <View style={s.header}>
        <Text style={s.headerName}>James & Jessica</Text>
        <Text style={s.headerActivity}>Dinner · Le Bernardin, NYC</Text>
      </View>

      <View style={[s.timerCard, shadows.md]}>
        <Text style={s.timerText}>00:47:52</Text>
        <Text style={s.timerLabel}>TIME REMAINING</Text>
      </View>

      {/* Extend request banner */}
      <View style={[s.extendBanner, shadows.sm]}>
        <View style={s.extendBannerHeader}>
          <Feather name="plus-circle" size={20} color={colors.accent} />
          <Text style={s.extendBannerTitle}>Extend Request</Text>
        </View>
        <Text style={s.extendBannerBody}>James wants to extend the date by 1 hour.</Text>
        <View style={s.extendBannerActions}>
          <Pressable style={[s.acceptBtn, shadows.sm]}>
            <Feather name="check" size={16} color={colors.textInverse} />
            <Text style={s.acceptBtnText}>ACCEPT</Text>
          </Pressable>
          <Pressable style={[s.declineBtn, shadows.sm]}>
            <Feather name="x" size={16} color={colors.textInverse} />
            <Text style={s.declineBtnText}>DECLINE</Text>
          </Pressable>
        </View>
      </View>

      <View style={s.grid}>
        <ActionButton label="End Early" icon="x-circle" color={colors.primaryLight} />
        <ActionButton label="Date Plan" icon="map" color={colors.surface} />
        <ActionButton label="Photos" icon="camera" color={colors.surface} />
        <ActionButton label="Report Issue" icon="flag" color={colors.surface} />
        <ActionButton label="SOS" icon="alert-triangle" color={colors.error} textColor={colors.textInverse} />
      </View>

      <View style={s.chatFab}>
        <Feather name="message-circle" size={24} color={colors.text} />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function DateActiveStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Active date with countdown timer, action grid, chat FAB">
        <PageShell><DefaultState /></PageShell>
      </StateSection>
      <StateSection title="LOW TIME" description="Timer under 30 min — warning state with extend prompt">
        <PageShell><LowTimeState /></PageShell>
      </StateSection>
      <StateSection title="SAFETY CHECK-IN" description="Modal prompted every 30 min — confirm safety or get help">
        <PageShell><SafetyCheckinState /></PageShell>
      </StateSection>
      <StateSection title="EXTEND REQUEST" description="Companion sees pending extend request from seeker">
        <PageShell><ExtendRequestState /></PageShell>
      </StateSection>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16, paddingBottom: 80 },

  header: { marginBottom: 8 },
  headerName: { ...typography.h2, color: colors.text },
  headerActivity: { ...typography.bodySmall, color: colors.textMuted, marginTop: 4 },

  // Timer
  timerCard: {
    backgroundColor: colors.text,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 32,
    alignItems: 'center',
    marginBottom: 8,
  },
  timerCardLow: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 32,
    alignItems: 'center',
    marginBottom: 8,
  },
  timerText: {
    ...typography.display,
    color: colors.accent,
    fontSize: 56,
    letterSpacing: 4,
  },
  timerTextLow: {
    ...typography.display,
    color: colors.textInverse,
    fontSize: 56,
    letterSpacing: 4,
  },
  timerLabel: {
    ...typography.label,
    color: colors.textInverse,
    marginTop: 8,
  },

  // Action grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionBtn: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 18,
    borderWidth: 2,
    borderColor: colors.border,
    ...shadows.sm,
  },
  actionText: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text,
  },

  // Extend prompt (low time)
  extendPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
    flexWrap: 'wrap',
  },
  extendPromptText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  extendBtn: {
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  extendBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
  },

  // Extend banner (companion view)
  extendBanner: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 12,
  },
  extendBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  extendBannerTitle: {
    ...typography.h3,
    color: colors.text,
  },
  extendBannerBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  extendBannerActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
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
    paddingVertical: 12,
  },
  acceptBtnText: {
    ...typography.button,
    color: colors.textInverse,
    fontSize: 14,
  },
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
    paddingVertical: 12,
  },
  declineBtnText: {
    ...typography.button,
    color: colors.textInverse,
    fontSize: 14,
  },

  // Modal
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: colors.background,
    borderWidth: 3,
    borderColor: colors.border,
    padding: 32,
    width: '100%',
    maxWidth: 400,
    ...shadows.lg as any,
  },
  modalTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: 12,
  },
  modalBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  modalOkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 16,
    marginBottom: 12,
  },
  modalOkText: {
    ...typography.button,
    color: colors.text,
  },
  modalHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.border,
    paddingVertical: 14,
  },
  modalHelpText: {
    ...typography.button,
    color: colors.textInverse,
    fontSize: 14,
  },

  // Chat FAB
  chatFab: {
    position: 'absolute',
    bottom: 24,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
});
