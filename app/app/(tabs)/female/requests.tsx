import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Platform, Modal, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { showAlert, showConfirm } from '../../../src/utils/alert';
import { Card } from '../../../src/components/Card';
import { UserImage } from '../../../src/components/UserImage';
import { Button } from '../../../src/components/Button';
import { Icon } from '../../../src/components/Icon';
import { EmptyState } from '../../../src/components/EmptyState';
import { useTheme, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { useBookingsStore } from '../../../src/store/bookingsStore';
import { Booking } from '../../../src/services/api';
import * as Haptics from 'expo-haptics';

type TabType = 'pending' | 'accepted' | 'completed';

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [refreshing, setRefreshing] = useState(false);

  // UC-048: completion modal state
  const [completionModalBooking, setCompletionModalBooking] = useState<Booking | null>(null);
  const [actualHoursInput, setActualHoursInput] = useState('');
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState(false);

  const { requests = [], isLoading, fetchRequests, acceptRequest, declineRequest, completeBooking } = useBookingsStore();

  useEffect(() => {
    fetchRequests(activeTab);
  }, [activeTab]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRequests(activeTab);
    setRefreshing(false);
  }, [activeTab]);

  const handleAccept = useCallback((booking: Booking) => {
    showConfirm(
      'Accept Request',
      `Accept date with ${booking.seeker.name}?`,
      async () => {
        const result = await acceptRequest(booking.id);
        if (result.success) {
          showAlert('Accepted', 'Date request accepted!');
          fetchRequests(activeTab);
        } else {
          showAlert('Error', result.error || 'Failed to accept');
        }
      },
      'Accept'
    );
  }, [activeTab]);

  const handleDecline = useCallback((booking: Booking) => {
    showConfirm(
      'Decline Request',
      `Decline date with ${booking.seeker.name}?`,
      async () => {
        const result = await declineRequest(booking.id);
        if (result.success) {
          showAlert('Declined', 'Date request declined.');
          fetchRequests(activeTab);
        } else {
          showAlert('Error', result.error || 'Failed to decline');
        }
      },
      'Decline'
    );
  }, [activeTab]);

  // UC-048: Companion marks date as completed
  const handleDateCompleted = useCallback((booking: Booking) => {
    setActualHoursInput(String(booking.duration || ''));
    setCompletionModalBooking(booking);
  }, []);

  const handleSubmitCompletion = useCallback(async () => {
    if (!completionModalBooking) return;
    const hours = parseFloat(actualHoursInput);
    if (isNaN(hours) || hours <= 0 || hours > 24) {
      showAlert('Invalid Hours', 'Please enter a valid number of hours (0–24).');
      return;
    }
    setIsSubmittingCompletion(true);
    const result = await completeBooking(completionModalBooking.id, hours);
    setIsSubmittingCompletion(false);
    if (result.success) {
      setCompletionModalBooking(null);
      setActualHoursInput('');
      showAlert('Done', 'Date marked as completed. Seeker has 24 hours to confirm.');
      fetchRequests(activeTab);
    } else {
      showAlert('Error', result.error || 'Failed to submit completion');
    }
  }, [completionModalBooking, actualHoursInput, activeTab]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>Date Requests</Text>
      </View>

      {/* UC-048: Date completion modal */}
      <Modal
        visible={completionModalBooking !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setCompletionModalBooking(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Date Completed</Text>
            <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
              How many hours did the date actually last?
            </Text>
            <TextInput
              style={[styles.hoursInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              value={actualHoursInput}
              onChangeText={setActualHoursInput}
              keyboardType="decimal-pad"
              placeholder={`Booked: ${completionModalBooking?.duration}h`}
              placeholderTextColor={colors.textSecondary}
              maxLength={4}
              accessibilityLabel="Actual hours"
            />
            <Text style={[styles.modalHint, { color: colors.textSecondary }]}>
              The seeker will receive a notification and has 24 hours to confirm.
            </Text>
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                size="sm"
                style={{ flex: 1 }}
                onPress={() => {
                  setCompletionModalBooking(null);
                  setActualHoursInput('');
                }}
                disabled={isSubmittingCompletion}
              />
              <Button
                title={isSubmittingCompletion ? 'Submitting...' : 'Confirm'}
                size="sm"
                style={{ flex: 1 }}
                onPress={handleSubmitCompletion}
                disabled={isSubmittingCompletion}
              />
            </View>
          </View>
        </View>
      </Modal>

      <View style={styles.tabs}>
        {(['pending', 'accepted', 'completed'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              { backgroundColor: colors.surface },
              activeTab === tab && { backgroundColor: colors.primary },
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.selectionAsync();
              }
              setActiveTab(tab);
            }}
            testID={`requests-tab-${tab}`}
            accessibilityLabel={`${tab.charAt(0).toUpperCase() + tab.slice(1)} requests`}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text style={[
              styles.tabText,
              { color: colors.textSecondary },
              activeTab === tab && { color: colors.white },
            ]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'pending' && requests.filter(r => r.status === 'pending').length > 0 && 
                ` (${requests.filter(r => r.status === 'pending').length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {requests.length === 0 && !isLoading ? (
          <EmptyState
            icon="inbox"
            title={`No ${activeTab} requests`}
            description={activeTab === 'pending' ? 'New date requests will appear here' : 'Your history will appear here'}
          />
        ) : (
          requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              type={activeTab}
              colors={colors}
              onAccept={() => handleAccept(request)}
              onDecline={() => handleDecline(request)}
              onComplete={() => handleDateCompleted(request)}
              formatDate={formatDate}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

interface RequestCardProps {
  request: Booking;
  type: TabType;
  colors: any;
  onAccept: () => void;
  onDecline: () => void;
  onComplete: () => void;
  formatDate: (date: string) => string;
}

function RequestCard({ request, type, colors, onAccept, onDecline, onComplete, formatDate }: RequestCardProps) {
  const seeker = request.seeker || { name: 'Unknown', photo: null };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return { bg: colors.primary + '20', text: colors.primary };
      case 'cancelled': return { bg: colors.error + '20', text: colors.error };
      case 'no_show': return { bg: colors.error + '20', text: colors.error };
      case 'pending_completion': return { bg: colors.warning + '20', text: colors.warning };
      default: return { bg: colors.textSecondary + '20', text: colors.textSecondary };
    }
  };

  const displayStatus = request.noShowReason ? 'no_show' : request.status;
  const statusStyle = getStatusStyle(displayStatus);

  const cardContent = (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <UserImage name={seeker.name} uri={seeker.photo} size={56} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.text }]}>{seeker.name}</Text>
          {request.seekerRating && request.seekerRating.count > 0 && (
            <View style={styles.seekerRatingRow}>
              <Text style={styles.seekerRatingStars}>
                {'★'.repeat(Math.round(request.seekerRating.average))}
                {'☆'.repeat(5 - Math.round(request.seekerRating.average))}
              </Text>
              <Text style={[styles.seekerRatingCount, { color: colors.textSecondary }]}>
                ({request.seekerRating.count})
              </Text>
            </View>
          )}
          <Text style={[styles.cardActivity, { color: colors.text }]}>{request.activity || 'Date'}</Text>
          <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{formatDate(request.date)} • {request.duration}h</Text>
        </View>
        <View style={styles.cardAmount}>
          <Text style={[styles.amountValue, { color: colors.success }]}>${request.total}</Text>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>
            {type === 'completed' ? 'Earned' : 'Total'}
          </Text>
          {type === 'completed' && (
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {displayStatus === 'no_show' ? 'no show' : displayStatus}
              </Text>
            </View>
          )}
        </View>
      </View>

      {request.message && (
        <View style={[styles.messageBox, { backgroundColor: colors.surface }]}>
          <Text style={[styles.messageText, { color: colors.textSecondary }]}>"{request.message}"</Text>
        </View>
      )}

      {type === 'pending' && (
        <View style={styles.actions}>
          <Button
            title="Decline"
            onPress={onDecline}
            variant="outline"
            size="sm"
            style={{ flex: 1, borderColor: colors.error }}
            textStyle={{ color: colors.error }}
          />
          <Button
            title="Accept"
            onPress={onAccept}
            size="sm"
            style={{ flex: 1, backgroundColor: colors.success }}
          />
        </View>
      )}

      {type === 'accepted' && request.status === 'pending_completion' && (
        <View style={[styles.pendingCompletionBanner, { backgroundColor: colors.warning + '15' }]}>
          <Icon name="clock" size={14} color={colors.warning} />
          <Text style={[styles.pendingCompletionText, { color: colors.warning }]}>
            Waiting for seeker to confirm ({request.completionActualHours}h reported)
          </Text>
        </View>
      )}

      {type === 'accepted' && request.status !== 'pending_completion' && (
        <View style={styles.actions}>
          <Button
            title="Message"
            onPress={() => router.push(`/chat/${request.seeker.id}?name=${encodeURIComponent(request.seeker.name)}`)}
            variant="outline"
            size="sm"
            style={{ flex: 1 }}
          />
          {request.isPaid ? (
            <Button
              title="Start Date"
              onPress={() => router.push(`/date/companion-checkin/${request.id}`)}
              size="sm"
              style={{ flex: 1 }}
            />
          ) : (
            <Button
              title="View Details"
              onPress={() => router.push(`/booking/${request.id}`)}
              size="sm"
              style={{ flex: 1 }}
            />
          )}
        </View>
      )}

      {type === 'accepted' && (request.status === 'active' || request.status === 'paid' || request.status === 'confirmed') && (
        <View style={[styles.actions, { marginTop: spacing.sm }]}>
          <Button
            title="Date Completed"
            onPress={onComplete}
            size="sm"
            style={{ flex: 1, backgroundColor: colors.success }}
            testID={`complete-date-${request.id}`}
            accessibilityLabel="Mark date as completed"
          />
        </View>
      )}

      {request.status === 'active' && type !== 'accepted' && (
        <View style={styles.actions}>
          <Button
            title="Resume Date"
            onPress={() => router.push(`/date/active/${request.id}`)}
            size="sm"
            style={{ flex: 1 }}
          />
        </View>
      )}

      {type === 'completed' && (
        <View style={[styles.rating, { borderTopColor: colors.border }]}>
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>
            {request.isPaid ? 'Payment received' : 'Awaiting payment'}
          </Text>
          <Button
            title="View Summary"
            onPress={() => router.push(`/date/summary/${request.id}`)}
            variant="outline"
            size="sm"
            style={{ marginTop: spacing.sm, alignSelf: 'stretch' }}
          />
        </View>
      )}
    </Card>
  );

  if (type === 'completed') {
    return (
      <TouchableOpacity
        onPress={() => router.push(`/date/summary/${request.id}`)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={`View summary of date with ${seeker.name}`}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  tabText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  seekerRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  seekerRatingStars: {
    fontSize: typography.sizes.sm,
    color: '#FF2A5F',
  },
  seekerRatingCount: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
  },
  cardActivity: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  cardDate: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  cardAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
  },
  amountLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    marginTop: spacing.xs,
  },
  statusText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.xs,
    textTransform: 'capitalize',
  },
  messageBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  messageText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  rating: {
    marginTop: spacing.md,
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
  ratingText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  pendingCompletionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  pendingCompletionText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    flex: 1,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 400,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
  },
  modalSubtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  hoursInput: {
    borderWidth: 1,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    minHeight: 48,
  },
  modalHint: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
