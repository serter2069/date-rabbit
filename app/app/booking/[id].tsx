import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { Icon } from '../../src/components/Icon';
import { UserImage } from '../../src/components/UserImage';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import { useBookingsStore } from '../../src/store/bookingsStore';

const activities = [
  { id: 'dinner', icon: 'utensils', label: 'Dinner', popular: true },
  { id: 'drinks', icon: 'wine', label: 'Drinks' },
  { id: 'coffee', icon: 'coffee', label: 'Coffee' },
  { id: 'movie', icon: 'film', label: 'Movie' },
  { id: 'theater', icon: 'theater', label: 'Theater' },
  { id: 'art', icon: 'palette', label: 'Art Gallery' },
  { id: 'walk', icon: 'footprints', label: 'Walk in Park' },
  { id: 'event', icon: 'party-popper', label: 'Event/Party' },
];

const durations = [
  { hours: 1, label: '1 hour' },
  { hours: 2, label: '2 hours', popular: true },
  { hours: 3, label: '3 hours' },
  { hours: 4, label: '4 hours' },
  { hours: 5, label: '5 hours' },
  { hours: 6, label: 'Half day (6h)' },
];

// Generate available dates (next 14 days)
const generateDates = () => {
  const dates = [];
  const today = new Date();
  for (let i = 1; i <= 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push({
      date,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
    });
  }
  return dates;
};

const timeSlots = [
  '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM',
  '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM',
  '8:00 PM', '9:00 PM',
];

const profilesData: Record<string, any> = {
  '1': { id: '1', name: 'Sarah', hourlyRate: 100 },
  '2': { id: '2', name: 'Emma', hourlyRate: 85 },
};

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const profile = profilesData[id || ''] || { id: '0', name: 'Companion', hourlyRate: 100 };

  const { createBooking } = useBookingsStore();

  const availableDates = generateDates();

  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(2);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const serviceFee = 0.15; // 15% platform fee
  const subtotal = profile.hourlyRate * selectedDuration;
  const fee = Math.round(subtotal * serviceFee);
  const total = subtotal + fee;

  const isValid = selectedActivity && selectedDate && selectedTime && location.length > 0;

  const handleSubmit = async () => {
    if (!isValid) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const activityLabel = activities.find((a) => a.id === selectedActivity)?.label || '';

    const result = await createBooking({
      companionId: profile.id,
      activity: activityLabel,
      date: selectedDate!.toISOString(),
      duration: selectedDuration,
      location,
      message,
    });

    if (!result.success) {
      Alert.alert('Error', result.error || 'Failed to send request');
      return;
    }

    setIsSubmitting(false);

    Alert.alert(
      'Request Sent!',
      `Your date request has been sent to ${profile.name}. You'll be notified when they respond.`,
      [
        {
          text: 'View My Bookings',
          onPress: () => router.replace('/(tabs)/male/bookings'),
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()} testID="booking-back-btn">
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Book a Date</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Companion Info */}
        <Card style={styles.companionCard}>
          <View style={styles.companionInfo}>
            <UserImage name={profile.name} size={56} />
            <View style={styles.companionDetails}>
              <Text style={[styles.companionName, { color: colors.text }]}>{profile.name}</Text>
              <Text style={[styles.companionRate, { color: colors.primary }]}>${profile.hourlyRate}/hour</Text>
            </View>
          </View>
        </Card>

        {/* Activity Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What would you like to do? *</Text>
          <View style={styles.activitiesGrid}>
            {activities.map((activity) => (
              <TouchableOpacity
                key={activity.id}
                style={[
                  styles.activityCard,
                  { backgroundColor: colors.white, borderColor: colors.border },
                  selectedActivity === activity.id && { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
                ]}
                onPress={() => setSelectedActivity(activity.id)}
              >
                <Icon
                  name={activity.icon}
                  size={28}
                  color={selectedActivity === activity.id ? colors.primary : colors.textSecondary}
                />
                <Text style={[
                  styles.activityLabel,
                  { color: colors.text },
                  selectedActivity === activity.id && { color: colors.primary },
                ]}>
                  {activity.label}
                </Text>
                {activity.popular && (
                  <View style={[styles.popularBadge, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.popularText, { color: colors.white }]}>Popular</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Duration Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>How long? *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.durationScroll}
          >
            {durations.map((duration) => (
              <TouchableOpacity
                key={duration.hours}
                style={[
                  styles.durationCard,
                  { backgroundColor: colors.white, borderColor: colors.border },
                  selectedDuration === duration.hours && { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
                ]}
                onPress={() => setSelectedDuration(duration.hours)}
              >
                <Text style={[
                  styles.durationLabel,
                  { color: colors.text },
                  selectedDuration === duration.hours && { color: colors.primary },
                ]}>
                  {duration.label}
                </Text>
                <Text style={[
                  styles.durationPrice,
                  { color: colors.textSecondary },
                  selectedDuration === duration.hours && { color: colors.primary },
                ]}>
                  ${profile.hourlyRate * duration.hours}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>When? *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.datesScroll}
          >
            {availableDates.map((d, index) => {
              const isSelected = selectedDate?.toDateString() === d.date.toDateString();
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCard,
                    { backgroundColor: colors.white, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primary },
                  ]}
                  onPress={() => setSelectedDate(d.date)}
                >
                  <Text style={[
                    styles.dateDay,
                    { color: colors.textSecondary },
                    isSelected && { color: colors.white },
                  ]}>
                    {d.day}
                  </Text>
                  <Text style={[
                    styles.dateDayNum,
                    { color: colors.text },
                    isSelected && { color: colors.white },
                  ]}>
                    {d.dayNum}
                  </Text>
                  <Text style={[
                    styles.dateMonth,
                    { color: colors.textSecondary },
                    isSelected && { color: colors.white },
                  ]}>
                    {d.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>What time? *</Text>
          <View style={styles.timeSlotsGrid}>
            {timeSlots.map((time) => {
              const isSelected = selectedTime === time;
              return (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeSlot,
                    { backgroundColor: colors.white, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primary },
                  ]}
                  onPress={() => setSelectedTime(time)}
                >
                  <Text style={[
                    styles.timeSlotText,
                    { color: colors.text },
                    isSelected && { color: colors.white },
                  ]}>
                    {time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Location Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Where? *</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
            placeholder="Restaurant name, address, or area..."
            value={location}
            onChangeText={setLocation}
            placeholderTextColor={colors.textSecondary}
            testID="booking-location-input"
          />
        </View>

        {/* Message Input */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Add a message (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
            placeholder="Tell them a bit about what you have in mind..."
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={colors.textSecondary}
            testID="booking-message-input"
          />
        </View>

        {/* Price Summary */}
        <Card style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Price Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>
              ${profile.hourlyRate} × {selectedDuration} hours
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${subtotal}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Service fee (15%)</Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>${fee}</Text>
          </View>
          <View style={[styles.summaryRow, styles.summaryTotal, { borderTopColor: colors.border }]}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: colors.primary }]}>${total}</Text>
          </View>
        </Card>

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Submit Button */}
      <View style={[styles.bottomBar, { backgroundColor: colors.white, borderTopColor: colors.border, paddingBottom: insets.bottom || spacing.xl }]}>
        <View style={styles.bottomInfo}>
          <Text style={[styles.bottomTotal, { color: colors.text }]}>${total}</Text>
          <Text style={[styles.bottomLabel, { color: colors.textSecondary }]}>Total</Text>
        </View>
        <Button
          title={isSubmitting ? 'Sending...' : 'Send Request'}
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!isValid || isSubmitting}
          style={styles.submitButton}
          testID="booking-submit-btn"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  companionCard: {
    marginBottom: spacing.lg,
  },
  companionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  companionDetails: {
    marginLeft: spacing.md,
  },
  companionName: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  companionRate: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  activityCard: {
    width: '48%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  activityLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    marginTop: spacing.xs,
  },
  popularBadge: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  popularText: {
    fontSize: 10,
    fontWeight: '600',
  },
  durationScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  durationCard: {
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 100,
    minHeight: 60,
    justifyContent: 'center',
  },
  durationLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  durationPrice: {
    fontSize: typography.sizes.md,
    fontWeight: '700',
  },
  datesScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  dateCard: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    marginRight: spacing.sm,
    alignItems: 'center',
    minWidth: 70,
    minHeight: 80,
    justifyContent: 'center',
  },
  dateDay: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  dateDayNum: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    marginVertical: spacing.xs,
  },
  dateMonth: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  timeSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  timeSlot: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    minHeight: 44,
    justifyContent: 'center',
  },
  timeSlotText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  input: {
    borderWidth: 2,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    minHeight: 48,
  },
  textArea: {
    height: 100,
    paddingTop: spacing.md,
    textAlignVertical: 'top',
  },
  summaryCard: {},
  summaryTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.sizes.md,
  },
  summaryValue: {
    fontSize: typography.sizes.md,
  },
  summaryTotal: {
    borderTopWidth: 1,
    paddingTop: spacing.md,
    marginTop: spacing.sm,
  },
  totalLabel: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderTopWidth: 1,
  },
  bottomInfo: {
    alignItems: 'flex-start',
  },
  bottomTotal: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  bottomLabel: {
    fontSize: typography.sizes.sm,
  },
  submitButton: {
    flex: 1,
    marginLeft: spacing.lg,
  },
});
