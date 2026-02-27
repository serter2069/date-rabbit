import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
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

type TabType = 'pending' | 'accepted' | 'completed';

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [refreshing, setRefreshing] = useState(false);

  const { requests = [], isLoading, fetchRequests, acceptRequest, declineRequest } = useBookingsStore();

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
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

      <View style={styles.tabs}>
        {(['pending', 'accepted', 'completed'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              { backgroundColor: colors.surface },
              activeTab === tab && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab(tab)}
            testID={`requests-tab-${tab}`}
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
  formatDate: (date: string) => string;
}

function RequestCard({ request, type, colors, onAccept, onDecline, formatDate }: RequestCardProps) {
  const seeker = request.seeker || { name: 'Unknown', photo: null };
  
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <UserImage name={seeker.name} uri={seeker.photo} size={56} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.text }]}>{seeker.name}</Text>
          <Text style={[styles.cardActivity, { color: colors.text }]}>{request.activity || 'Date'}</Text>
          <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{formatDate(request.date)} • {request.duration}h</Text>
        </View>
        <View style={styles.cardAmount}>
          <Text style={[styles.amountValue, { color: colors.success }]}>${request.total}</Text>
          <Text style={[styles.amountLabel, { color: colors.textSecondary }]}>Total</Text>
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

      {type === 'accepted' && (
        <View style={styles.actions}>
          <Button
            title="Message"
            onPress={() => router.push({
              pathname: '/chat/[id]',
              params: { id: request.seeker.id, name: request.seeker.name },
            })}
            variant="outline"
            size="sm"
            style={{ flex: 1 }}
          />
          <Button
            title="View Details"
            onPress={() => router.push(`/booking/${request.id}`)}
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
        </View>
      )}
    </Card>
  );
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
});
