import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../../src/components/Card';
import { EmptyState } from '../../../src/components/EmptyState';
import { Icon } from '../../../src/components/Icon';
import { useTheme, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { calendarApi, bookingsApi, Booking } from '../../../src/services/api';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [blockedDates, setBlockedDates] = useState<Set<string>>(new Set());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [blockMode, setBlockMode] = useState(false);
  const [selectedForBlock, setSelectedForBlock] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;

      const [blockedData, bookingsData] = await Promise.all([
        calendarApi.getBlockedDates(year, month),
        bookingsApi.getRequests('accepted'),
      ]);

      const blockedSet = new Set<string>();
      if (Array.isArray(blockedData.dates)) {
        blockedData.dates.forEach((d: string | { date: string }) => {
          const dateStr = typeof d === 'string' ? d : d.date;
          blockedSet.add(dateStr);
        });
      }
      setBlockedDates(blockedSet);
      setBookings(bookingsData.bookings);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDateStr = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getDaysInMonth = () => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  };

  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    setSelectedDate(null);
    setSelectedForBlock(new Set());
  };

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    setSelectedDate(null);
    setSelectedForBlock(new Set());
  };

  const handleDayPress = (day: number) => {
    const dateStr = formatDateStr(day);
    const today = new Date();
    const selectedDateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (selectedDateObj < today && selectedDateObj.toDateString() !== today.toDateString()) {
      return; // Can't select past dates
    }

    if (blockMode) {
      const newSelected = new Set(selectedForBlock);
      if (newSelected.has(dateStr)) {
        newSelected.delete(dateStr);
      } else {
        newSelected.add(dateStr);
      }
      setSelectedForBlock(newSelected);
    } else {
      setSelectedDate(day);
    }
  };

  const handleBlockDates = async () => {
    if (selectedForBlock.size === 0) {
      Alert.alert('No Dates Selected', 'Please select dates to block');
      return;
    }

    const datesToBlock = Array.from(selectedForBlock).filter(d => !blockedDates.has(d));
    const datesToUnblock = Array.from(selectedForBlock).filter(d => blockedDates.has(d));

    try {
      if (datesToBlock.length > 0) {
        await calendarApi.blockDates(datesToBlock);
      }
      if (datesToUnblock.length > 0) {
        await calendarApi.unblockDates(datesToUnblock);
      }

      Alert.alert('Success', 'Calendar updated successfully');
      setBlockMode(false);
      setSelectedForBlock(new Set());
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update calendar');
    }
  };

  const getBookingsForDay = (day: number) => {
    const dateStr = formatDateStr(day);
    return bookings.filter(b => b.date.split('T')[0] === dateStr);
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const calendarDays = [];
    const today = new Date();

    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = formatDateStr(day);
      const dateObj = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isToday = dateObj.toDateString() === today.toDateString();
      const isPast = dateObj < today && !isToday;
      const isSelected = day === selectedDate && !blockMode;
      const isBlocked = blockedDates.has(dateStr);
      const isSelectedForBlock = selectedForBlock.has(dateStr);
      const dayBookings = getBookingsForDay(day);
      const hasBooking = dayBookings.length > 0;

      calendarDays.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isToday && [styles.todayCell, { backgroundColor: colors.primaryLight + '30' }],
            isSelected && [styles.selectedCell, { backgroundColor: colors.primary }],
            isBlocked && !isSelectedForBlock && [styles.blockedCell, { backgroundColor: colors.error + '20' }],
            isSelectedForBlock && [styles.selectedForBlockCell, { backgroundColor: isBlocked ? colors.success + '30' : colors.error + '30' }],
            isPast && styles.pastCell,
          ]}
          onPress={() => handleDayPress(day)}
          disabled={isPast}
        >
          <Text style={[
            styles.dayText,
            { color: colors.text },
            isToday && [styles.todayText, { color: colors.primary }],
            isSelected && [styles.selectedText, { color: colors.white }],
            isBlocked && { color: colors.error },
            isPast && { color: colors.textSecondary, opacity: 0.5 },
          ]}>
            {day}
          </Text>
          {hasBooking && <View style={[styles.eventDot, { backgroundColor: colors.primary }]} />}
          {isBlocked && !blockMode && (
            <View style={[styles.blockedIndicator, { backgroundColor: colors.error }]} />
          )}
        </TouchableOpacity>
      );
    }

    return calendarDays;
  };

  const selectedDayBookings = selectedDate ? getBookingsForDay(selectedDate) : [];

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>Calendar</Text>
          <TouchableOpacity
            style={[
              styles.blockModeButton,
              blockMode && { backgroundColor: colors.primary },
            ]}
            onPress={() => {
              setBlockMode(!blockMode);
              setSelectedForBlock(new Set());
              setSelectedDate(null);
            }}
          >
            <Icon
              name={blockMode ? 'check' : 'calendar-x'}
              size={20}
              color={blockMode ? colors.white : colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}>
            <Icon name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.monthYear, { color: colors.text }]}>
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
            <Icon name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {blockMode && (
        <View style={[styles.blockModeBar, { backgroundColor: colors.primaryLight + '20' }]}>
          <Text style={[styles.blockModeText, { color: colors.primary }]}>
            Tap dates to block/unblock. Selected: {selectedForBlock.size}
          </Text>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleBlockDates}
          >
            <Text style={[styles.applyButtonText, { color: colors.white }]}>Apply</Text>
          </TouchableOpacity>
        </View>
      )}

      <Card style={styles.calendarCard}>
        <View style={styles.daysHeader}>
          {days.map(day => (
            <Text key={day} style={[styles.dayHeader, { color: colors.textSecondary }]}>{day}</Text>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {renderCalendarDays()}
        </View>
      </Card>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Booking</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.error }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Blocked</Text>
        </View>
      </View>

      <ScrollView style={styles.eventsContainer}>
        {!blockMode && selectedDate && (
          <>
            <Text style={[styles.eventsTitle, { color: colors.text }]}>
              {formatDateStr(selectedDate)}
            </Text>

            {selectedDayBookings.length > 0 ? (
              selectedDayBookings.map((booking) => (
                <Card key={booking.id} style={styles.eventCard}>
                  <View style={[styles.eventTime, { backgroundColor: colors.primaryLight + '30' }]}>
                    <Text style={[styles.eventTimeText, { color: colors.primary }]}>
                      {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={styles.eventDetails}>
                    <Text style={[styles.eventName, { color: colors.text }]}>{booking.seeker.name}</Text>
                    <Text style={[styles.eventActivity, { color: colors.textSecondary }]}>{booking.activity}</Text>
                  </View>
                </Card>
              ))
            ) : (
              <EmptyState
                icon="calendar"
                title="No bookings"
                description={blockedDates.has(formatDateStr(selectedDate)) ? 'This date is blocked' : 'No bookings for this date'}
              />
            )}
          </>
        )}

        {!blockMode && !selectedDate && (
          <EmptyState
            icon="calendar"
            title="Select a date"
            description="Tap on a date to see bookings"
          />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  blockModeButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  navButton: {
    padding: spacing.xs,
  },
  monthYear: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  blockModeBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
  },
  blockModeText: {
    fontSize: typography.sizes.sm,
    flex: 1,
  },
  applyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  applyButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  calendarCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  todayCell: {
    borderRadius: borderRadius.full,
  },
  selectedCell: {
    borderRadius: borderRadius.full,
  },
  blockedCell: {
    borderRadius: borderRadius.full,
  },
  selectedForBlockCell: {
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pastCell: {
    opacity: 0.5,
  },
  dayText: {
    fontSize: typography.sizes.md,
  },
  todayText: {
    fontWeight: '600',
  },
  selectedText: {
    fontWeight: '600',
  },
  eventDot: {
    position: 'absolute',
    bottom: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  blockedIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 14,
    height: 2,
    borderRadius: 1,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: typography.sizes.xs,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  eventsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  eventCard: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  eventTime: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
    justifyContent: 'center',
  },
  eventTimeText: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  eventName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  eventActivity: {
    fontSize: typography.sizes.sm,
  },
});
