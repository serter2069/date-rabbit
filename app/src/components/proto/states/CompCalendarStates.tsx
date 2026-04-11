import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StateSection } from '../StateSection';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const BOOKED_DAYS = [10, 12, 15];
const TODAY = 9;

function generateCalendar(): (number | null)[] {
  // April 2026 starts on Wednesday (index 3)
  const startDay = 3;
  const totalDays = 30;
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= totalDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

// ===========================================================================
// STATE 1: DEFAULT — Availability Calendar
// ===========================================================================
function DefaultState() {
  const [selectedDay, setSelectedDay] = useState<number | null>(10);
  const cells = generateCalendar();

  const getDayStyle = (day: number) => {
    if (BOOKED_DAYS.includes(day)) return s.dayBooked;
    if (day === TODAY) return s.dayToday;
    return s.dayAvailable;
  };

  const getDayTextStyle = (day: number) => {
    if (BOOKED_DAYS.includes(day)) return s.dayTextBooked;
    return s.dayText;
  };

  return (
    <View style={s.page}>
      {/* Month header */}
      <View style={s.monthHeader}>
        <Pressable style={s.arrowBtn}>
          <Feather name={"chevron-left" as any} size={20} color={colors.text} />
        </Pressable>
        <Text style={s.monthTitle}>April 2026</Text>
        <Pressable style={s.arrowBtn}>
          <Feather name={"chevron-right" as any} size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Day names */}
      <View style={s.dayNamesRow}>
        {DAYS_OF_WEEK.map(d => (
          <View key={d} style={s.dayNameCell}>
            <Text style={s.dayNameText}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={s.grid}>
        {cells.map((day, i) => (
          <Pressable
            key={i}
            style={[
              s.dayCell,
              day ? getDayStyle(day) : s.dayEmpty,
              day === selectedDay && s.daySelected,
            ]}
            onPress={() => day && setSelectedDay(day)}
          >
            {day && <Text style={[getDayTextStyle(day), day === selectedDay && s.dayTextSelected]}>{day}</Text>}
          </Pressable>
        ))}
      </View>

      {/* Selected date detail */}
      {selectedDay === 10 && (
        <View style={[s.card, shadows.md]}>
          <Text style={s.cardTitle}>Thursday, April 10</Text>
          <View style={s.badgeRow}>
            <View style={s.bookedBadge}>
              <Text style={s.bookedBadgeText}>Booked</Text>
            </View>
          </View>
          <Text style={s.detailText}>James W.</Text>
          <Text style={s.detailSub}>8:00 PM -- 3h -- $450</Text>
        </View>
      )}

      {/* Block / Mark available buttons */}
      <View style={s.actionsRow}>
        <Pressable style={[s.btnOutline, shadows.sm]}>
          <Feather name={"lock" as any} size={14} color={colors.text} />
          <Text style={s.btnOutlineText}>BLOCK THIS DAY</Text>
        </Pressable>
        <Pressable style={[s.btnOutline, shadows.sm]}>
          <Feather name={"unlock" as any} size={14} color={colors.success} />
          <Text style={[s.btnOutlineText, { color: colors.success }]}>MARK AVAILABLE</Text>
        </Pressable>
      </View>

      {/* Working hours */}
      <View style={[s.card, shadows.sm]}>
        <View style={s.hoursRow}>
          <Feather name={"clock" as any} size={16} color={colors.textMuted} />
          <Text style={s.hoursLabel}>Working hours</Text>
          <Text style={s.hoursValue}>8:00 PM - 11:00 PM</Text>
        </View>
      </View>
    </View>
  );
}

// ===========================================================================
// STATE 2: EDIT_HOURS — Availability edit overlay
// ===========================================================================
function EditHoursState() {
  const [selectedDays, setSelectedDays] = useState<string[]>(['Fri', 'Sat']);
  const [startTime] = useState('7:00 PM');
  const [endTime] = useState('12:00 AM');

  const toggleDay = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  return (
    <View style={s.page}>
      <View style={[s.modal, shadows.lg]}>
        <Text style={s.modalTitle}>Set Available Hours</Text>

        {/* Time pickers */}
        <View style={s.timeRow}>
          <View style={s.timePickerWrap}>
            <Text style={s.timeLabel}>Start time</Text>
            <Pressable style={[s.timePicker, shadows.sm]}>
              <Feather name={"clock" as any} size={16} color={colors.textMuted} />
              <Text style={s.timeValue}>{startTime}</Text>
            </Pressable>
          </View>
          <View style={s.timePickerWrap}>
            <Text style={s.timeLabel}>End time</Text>
            <Pressable style={[s.timePicker, shadows.sm]}>
              <Feather name={"clock" as any} size={16} color={colors.textMuted} />
              <Text style={s.timeValue}>{endTime}</Text>
            </Pressable>
          </View>
        </View>

        {/* Days of week */}
        <Text style={s.daysLabel}>Days of the week</Text>
        <View style={s.daysRow}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <Pressable
              key={day}
              style={[s.dayChip, selectedDays.includes(day) && s.dayChipActive]}
              onPress={() => toggleDay(day)}
            >
              <Text style={[s.dayChipText, selectedDays.includes(day) && s.dayChipTextActive]}>
                {day}
              </Text>
            </Pressable>
          ))}
        </View>

        <Pressable style={[s.btnPrimary, shadows.button]}>
          <Text style={s.btnPrimaryText}>SAVE</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function CompCalendarStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="Availability calendar with date selection">
        <DefaultState />
      </StateSection>
      <StateSection title="EDIT_HOURS" description="Availability edit modal">
        <EditHoursState />
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 12, width: '100%' },

  // Month header
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthTitle: { ...typography.h2, color: colors.text },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Day names
  dayNamesRow: { flexDirection: 'row' },
  dayNameCell: { flex: 1, alignItems: 'center', paddingVertical: 6 },
  dayNameText: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.divider,
  },
  dayEmpty: { backgroundColor: 'transparent', borderColor: 'transparent' },
  dayAvailable: { backgroundColor: colors.surface },
  dayBooked: { backgroundColor: colors.badge.pink.bg },
  dayToday: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.accent },
  daySelected: { borderWidth: 2, borderColor: colors.primary },
  dayText: { ...typography.bodySmall, color: colors.text },
  dayTextBooked: { ...typography.bodySmall, color: colors.primary, fontWeight: '700' },
  dayTextSelected: { fontWeight: '700' },

  // Card
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 16,
  },
  cardTitle: { ...typography.h3, color: colors.text, marginBottom: 6 },

  // Detail
  badgeRow: { flexDirection: 'row', marginBottom: 6 },
  bookedBadge: {
    backgroundColor: colors.badge.pink.bg,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.xs,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  bookedBadgeText: { ...typography.caption, color: colors.primary, fontWeight: '700' },
  detailText: { ...typography.bodyMedium, color: colors.text },
  detailSub: { ...typography.bodySmall, color: colors.textMuted, marginTop: 2 },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 8 },
  btnOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 10,
  },
  btnOutlineText: { ...typography.button, color: colors.text, fontSize: 12 },

  // Hours
  hoursRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  hoursLabel: { ...typography.bodyMedium, color: colors.text, flex: 1 },
  hoursValue: { ...typography.bodyMedium, color: colors.textSecondary },

  // Modal
  modal: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
    gap: 16,
  },
  modalTitle: { ...typography.h2, color: colors.text },

  // Time pickers
  timeRow: { flexDirection: 'row', gap: 12 },
  timePickerWrap: { flex: 1 },
  timeLabel: { ...typography.caption, color: colors.textMuted, marginBottom: 4, fontWeight: '700' },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeValue: { ...typography.bodyMedium, color: colors.text },

  // Days chips
  daysLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '700' },
  daysRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dayChipActive: { backgroundColor: colors.primary },
  dayChipText: { ...typography.caption, color: colors.text, fontWeight: '700' },
  dayChipTextActive: { color: colors.textInverse },

  // Primary button
  btnPrimary: {
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnPrimaryText: { ...typography.button, color: colors.textInverse },
});
