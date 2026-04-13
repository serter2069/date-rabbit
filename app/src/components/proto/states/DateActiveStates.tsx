import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, useWindowDimensions, Image } from 'react-native';
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
function ActionButton({ label, icon, color, textColor }: { label: string; icon: string; color: string; textColor?: string }) {
  return (
    <View style={[s.actionBtn, { backgroundColor: color }]}>
      <Feather name={icon as any} size={18} color={textColor || colors.text} />
      <Text style={[s.actionText, textColor ? { color: textColor } : {}]}>{label}</Text>
    </View>
  );
}

function ChatFAB() {
  return (
    <View style={s.chatFab}>
      <Feather name="message-circle" size={24} color={colors.text} />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT — Active date with countdown timer + action grid
// ---------------------------------------------------------------------------
function DefaultState() {
  return (
    <View style={s.page}>
      {/* Companion header */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.companionHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-active/80/80' }} style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.companionInfo}>
            <Text style={s.companionName}>Jessica Martinez</Text>
            <Text style={s.companionSub}>Dinner & Drinks · Le Bernardin, NYC</Text>
          </View>
          <View style={[s.liveBadge, shadows.sm]}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
        </View>
      </View>

      {/* Timer */}
      <View style={[s.timerCard, shadows.md]}>
        <Text style={s.timerText}>01:47:23</Text>
        <Text style={s.timerLabel}>TIME REMAINING</Text>
        <View style={s.timerBar}>
          <View style={[s.timerBarFill, { width: '58%' }]} />
        </View>
        <Text style={s.timerSubtext}>1h 47m of 3h remaining</Text>
      </View>

      {/* Action grid */}
      <View style={s.grid}>
        <ActionButton label="Extend Time" icon="clock" color={colors.accent} />
        <ActionButton label="End Early" icon="x-circle" color={colors.primaryLight} />
        <ActionButton label="Date Plan" icon="map" color={colors.surface} />
        <ActionButton label="Photos" icon="camera" color={colors.surface} />
        <ActionButton label="Report Issue" icon="flag" color={colors.surface} />
        <ActionButton label="SOS" icon="alert-triangle" color={colors.error} textColor={colors.textInverse} />
      </View>

      {/* Safety info */}
      <View style={[s.safetyBanner, shadows.sm]}>
        <Feather name="shield" size={16} color={colors.success} />
        <Text style={s.safetyText}>Safety check-in in 23 min</Text>
      </View>

      <ChatFAB />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: SAFETY CHECK-IN MODAL
// ---------------------------------------------------------------------------
function SafetyCheckinState() {
  return (
    <View style={s.page}>
      {/* Companion header */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.companionHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-active/80/80' }} style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.companionInfo}>
            <Text style={s.companionName}>Jessica Martinez</Text>
            <Text style={s.companionSub}>Dinner & Drinks · Le Bernardin, NYC</Text>
          </View>
          <View style={[s.liveBadge, shadows.sm]}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
        </View>
      </View>

      {/* Timer */}
      <View style={[s.timerCard, shadows.md]}>
        <Text style={s.timerText}>01:23:45</Text>
        <Text style={s.timerLabel}>TIME REMAINING</Text>
      </View>

      {/* Safety check-in modal overlay */}
      <View style={s.modalOverlay}>
        <View style={[s.modalCard, shadows.lg]}>
          <View style={s.modalIconCircle}>
            <Feather name="shield" size={32} color={colors.primary} />
          </View>
          <Text style={s.modalTitle}>Safety Check-in</Text>
          <Text style={s.modalBody}>Are you OK? Tap to confirm you're safe.</Text>

          <Pressable style={[s.modalOkBtn, shadows.button]}>
            <Feather name="check-circle" size={18} color={colors.text} />
            <Text style={s.modalOkText}>I'M OK</Text>
          </Pressable>

          <Pressable style={[s.modalHelpBtn, shadows.sm]}>
            <Feather name="alert-triangle" size={16} color={colors.textInverse} />
            <Text style={s.modalHelpText}>I NEED HELP</Text>
          </Pressable>
        </View>
      </View>

      <ChatFAB />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 3: EXTEND REQUEST PENDING
// ---------------------------------------------------------------------------
function ExtendRequestState() {
  return (
    <View style={s.page}>
      {/* Companion header */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.companionHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-active/80/80' }} style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.companionInfo}>
            <Text style={s.companionName}>Jessica Martinez</Text>
            <Text style={s.companionSub}>Dinner & Drinks · Le Bernardin, NYC</Text>
          </View>
          <View style={[s.liveBadge, shadows.sm]}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
        </View>
      </View>

      {/* Timer */}
      <View style={[s.timerCard, shadows.md]}>
        <Text style={s.timerText}>00:47:12</Text>
        <Text style={s.timerLabel}>TIME REMAINING</Text>
        <View style={s.timerBar}>
          <View style={[s.timerBarFill, { width: '26%' }]} />
        </View>
      </View>

      {/* Extend request pending banner */}
      <View style={[s.extendBanner, shadows.md]}>
        <View style={s.extendBannerHeader}>
          <Feather name="clock" size={20} color={colors.accent} />
          <Text style={s.extendBannerTitle}>Extension Requested</Text>
        </View>
        <Text style={s.extendBannerBody}>
          You requested +1 hour. Waiting for companion to respond...
        </Text>
        <View style={s.extendLoadingRow}>
          <View style={s.extendSpinner} />
          <Text style={s.extendLoadingText}>Awaiting response</Text>
        </View>
      </View>

      {/* Action grid (reduced) */}
      <View style={s.grid}>
        <ActionButton label="Date Plan" icon="map" color={colors.surface} />
        <ActionButton label="Photos" icon="camera" color={colors.surface} />
        <ActionButton label="End Early" icon="x-circle" color={colors.primaryLight} />
        <ActionButton label="SOS" icon="alert-triangle" color={colors.error} textColor={colors.textInverse} />
      </View>

      <ChatFAB />
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 4: LOW TIME WARNING
// ---------------------------------------------------------------------------
function LowTimeState() {
  return (
    <View style={s.page}>
      {/* Companion header */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.companionHeader}>
          <Image source={{ uri: 'https://picsum.photos/seed/jessica-active/80/80' }} style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: colors.border }} />
          <View style={s.companionInfo}>
            <Text style={s.companionName}>Jessica Martinez</Text>
            <Text style={s.companionSub}>Dinner & Drinks · Le Bernardin, NYC</Text>
          </View>
          <View style={[s.liveBadge, shadows.sm]}>
            <View style={s.liveDot} />
            <Text style={s.liveText}>LIVE</Text>
          </View>
        </View>
      </View>

      {/* Timer — LOW TIME */}
      <View style={[s.timerCardLow, shadows.md]}>
        <Text style={s.timerTextLow}>00:12:47</Text>
        <Text style={s.timerLabelWhite}>TIME REMAINING</Text>
        <View style={s.timerBar}>
          <View style={[s.timerBarFillLow, { width: '7%' }]} />
        </View>
        <Text style={s.timerSubtextWhite}>Less than 15 min remaining</Text>
      </View>

      {/* Low time warning */}
      <View style={[s.warningBanner, shadows.sm]}>
        <Feather name="alert-circle" size={18} color={colors.warning} />
        <Text style={s.warningText}>Your date is ending soon!</Text>
      </View>

      {/* Action grid */}
      <View style={s.grid}>
        <ActionButton label="Extend Time" icon="clock" color={colors.accent} />
        <ActionButton label="End Early" icon="x-circle" color={colors.primaryLight} />
        <ActionButton label="Photos" icon="camera" color={colors.surface} />
        <ActionButton label="SOS" icon="alert-triangle" color={colors.error} textColor={colors.textInverse} />
      </View>

      <ChatFAB />
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
      <StateSection title="SAFETY CHECK-IN" description="Modal prompt every 30 min — confirm safety or trigger SOS">
        <PageShell><SafetyCheckinState /></PageShell>
      </StateSection>
      <StateSection title="EXTEND REQUEST PENDING" description="Seeker sent extend request, awaiting companion response">
        <PageShell><ExtendRequestState /></PageShell>
      </StateSection>
      <StateSection title="LOW TIME WARNING" description="Timer turns red when < 15 min remaining">
        <PageShell><LowTimeState /></PageShell>
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

  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
    gap: 12,
  },

  companionHeader: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  companionInfo: { flex: 1, gap: 2 },
  companionName: { ...typography.h3, color: colors.text },
  companionSub: { ...typography.bodySmall, color: colors.textMuted },

  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.success },
  liveText: { ...typography.caption, color: colors.success, fontWeight: '700', letterSpacing: 1 },

  timerCard: {
    backgroundColor: colors.black,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  timerCardLow: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 24,
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    ...typography.display,
    fontSize: 56,
    color: colors.accent,
    letterSpacing: 4,
  },
  timerTextLow: {
    ...typography.display,
    fontSize: 56,
    color: colors.textInverse,
    letterSpacing: 4,
  },
  timerLabel: {
    ...typography.label,
    color: colors.textLight,
    marginTop: 4,
  },
  timerLabelWhite: {
    ...typography.label,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  timerBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 4,
    marginTop: 12,
    overflow: 'hidden',
  },
  timerBarFill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: 4,
  },
  timerBarFillLow: {
    height: '100%',
    backgroundColor: colors.textInverse,
    borderRadius: 4,
  },
  timerSubtext: {
    ...typography.caption,
    color: colors.textLight,
    marginTop: 4,
  },
  timerSubtextWhite: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },

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
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 16,
  },
  actionText: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: colors.text,
  },

  safetyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.successLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  safetyText: { ...typography.bodySmall, color: colors.success, flex: 1 },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  warningText: { ...typography.bodySmall, color: colors.warning, fontWeight: '700', flex: 1 },

  extendBanner: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.accent,
    borderRadius: borderRadius.lg,
    padding: 20,
    gap: 12,
  },
  extendBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  extendBannerTitle: { ...typography.h3, color: colors.text },
  extendBannerBody: { ...typography.bodySmall, color: colors.textMuted },
  extendLoadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  extendSpinner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.accent,
    borderTopColor: 'transparent',
  },
  extendLoadingText: { ...typography.caption, color: colors.accent },

  modalOverlay: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 24,
    borderRadius: borderRadius.lg,
  },
  modalCard: {
    backgroundColor: colors.background,
    borderWidth: 3,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 32,
    alignItems: 'center',
    gap: 16,
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryLight,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: { ...typography.h2, color: colors.text },
  modalBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  modalOkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 16,
    width: '100%',
  },
  modalOkText: { ...typography.button, color: colors.text },
  modalHelpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.error,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
    width: '100%',
  },
  modalHelpText: { ...typography.button, color: colors.textInverse, fontSize: 14 },

  chatFab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
});
