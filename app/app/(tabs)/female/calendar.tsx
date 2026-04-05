import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { showAlert } from '../../../src/utils/alert';
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
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
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
    } catch (err) {
      console.error('Failed to fetch calendar data:', err);
      setError('Failed to load calendar data. Please try again.');
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
      showAlert('No Dates Selected', 'Please select dates to block');
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

      setBlockMode(false);
      setSelectedForBlock(new Set());
      fetchData();
    } catch (err: any) {
      setError(err.message || 'Failed to update calendar');
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
          accessibilityLabel={`${day}${isBlocked ? ', blocked' : ''}${isSelected ? ', selected' : ''}${hasBooking ? ', has booking' : ''}`}
          accessibilityRole="button"
          accessibilityState={{ disabled: isPast, selected: isSelected }}
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
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchData}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

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
            accessibilityLabel={blockMode ? 'Exit block mode' : 'Enter block mode'}
            accessibilityRole="button"
            accessibilityState={{ selected: blockMode }}
          >
            <Icon
              name={blockMode ? 'check' : 'calendar-x'}
              size={20}
              color={blockMode ? colors.white : colors.primary}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.monthNav}>
          <TouchableOpacity onPress={goToPrevMonth} style={styles.navButton}
            accessibilityLabel="Previous month"
            accessibilityRole="button"
          >
            <Icon name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.monthYear, { color: colors.text }]}>
            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </Text>
          <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}
            accessibilityLabel="Next month"
            accessibilityRole="button"
          >
            <Icon name="chevron-right" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {error && (
        <View style={[styles.errorBanner, { borderColor: colors.black, backgroundColor: colors.errorLight }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.black }]}
            onPress={() => { setLoading(true); fetchData(); }}
            accessibilityLabel="Try again"
            accessibilityRole="button"
          >
            <Text style={[styles.retryButtonText, { color: colors.white }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      {blockMode && (
        <View style={[styles.blockModeBar, { backgroundColor: colors.primaryLight + '20' }]}>
          <Text style={[styles.blockModeText, { color: colors.primary }]}>
            Tap dates to block/unblock. Selected: {selectedForBlock.size}
          </Text>
          <TouchableOpacity
            style={[styles.applyButton, { backgroundColor: colors.primary }]}
            onPress={handleBlockDates}
            accessibilityLabel="Apply date blocks"
            accessibilityRole="button"
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
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  retryButtonText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
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
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
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
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
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
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    flex: 1,
  },
  applyButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  applyButtonText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
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
    fontFamily: typography.fonts.bodySemiBold,
    flex: 1,
    textAlign: 'center',
    fontSize: typography.sizes.sm,
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
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
  },
  todayText: {
    fontFamily: typography.fonts.bodySemiBold,
  },
  selectedText: {
    fontFamily: typography.fonts.bodySemiBold,
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
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  eventsTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.lg,
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
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
  },
  eventDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  eventName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  eventActivity: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: borderRadius.md,
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: '#FF2A5F',
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  retryText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: '#FF2A5F',
  },
});
