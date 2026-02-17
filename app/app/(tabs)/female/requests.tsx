import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../../src/components/Card';
import { UserImage } from '../../../src/components/UserImage';
import { Button } from '../../../src/components/Button';
import { Icon } from '../../../src/components/Icon';
import { EmptyState } from '../../../src/components/EmptyState';
import { useTheme, spacing, typography, borderRadius } from '../../../src/constants/theme';

type TabType = 'pending' | 'accepted' | 'completed';

const mockRequests = {
  pending: [
    { id: '1', name: 'Michael', age: 32, activity: 'Dinner at Le Bernardin', date: 'Tomorrow, 7 PM', duration: 3, amount: 300, message: 'Would love to take you to my favorite restaurant!' },
    { id: '2', name: 'James', age: 28, activity: 'Art Gallery Tour', date: 'Friday, 3 PM', duration: 2, amount: 200, message: 'There is a great exhibition at MoMA.' },
    { id: '3', name: 'Robert', age: 35, activity: 'Coffee & Walk', date: 'Saturday, 11 AM', duration: 1, amount: 100, message: 'Keep it casual, Central Park?' },
  ],
  accepted: [
    { id: '4', name: 'David', age: 30, activity: 'Rooftop Bar', date: 'Tonight, 8 PM', duration: 2, amount: 200, message: 'Looking forward to it!' },
  ],
  completed: [
    { id: '5', name: 'William', age: 34, activity: 'Dinner & Jazz', date: 'Last week', duration: 4, amount: 400, rating: 5 },
    { id: '6', name: 'Thomas', age: 29, activity: 'Brunch', date: '2 weeks ago', duration: 2, amount: 200, rating: 5 },
  ],
};

export default function RequestsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('pending');

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
              {tab === 'pending' && ` (${mockRequests.pending.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {mockRequests[activeTab].length === 0 ? (
          <EmptyState
            icon="inbox"
            title={`No ${activeTab} requests`}
            description={activeTab === 'pending' ? 'New date requests will appear here' : 'Your history will appear here'}
          />
        ) : (
          mockRequests[activeTab].map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              type={activeTab}
              colors={colors}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function RequestCard({ request, type, colors }: { request: any; type: TabType; colors: any }) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardHeader}>
        <UserImage name={request.name} size={56} />
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: colors.text }]}>{request.name}, {request.age}</Text>
          <Text style={[styles.cardActivity, { color: colors.text }]}>{request.activity}</Text>
          <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{request.date} • {request.duration}h</Text>
        </View>
        <View style={styles.cardAmount}>
          <Text style={[styles.amountValue, { color: colors.success }]}>${request.amount}</Text>
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
            onPress={() => {}}
            variant="outline"
            size="sm"
            style={{ flex: 1, borderColor: colors.error }}
            textStyle={{ color: colors.error }}
          />
          <Button
            title="Accept"
            onPress={() => {}}
            size="sm"
            style={{ flex: 1, backgroundColor: colors.success }}
          />
        </View>
      )}

      {type === 'accepted' && (
        <View style={styles.actions}>
          <Button
            title="Message"
            onPress={() => {}}
            variant="outline"
            size="sm"
            style={{ flex: 1 }}
          />
          <Button
            title="View Details"
            onPress={() => {}}
            size="sm"
            style={{ flex: 1 }}
          />
        </View>
      )}

      {type === 'completed' && request.rating && (
        <View style={[styles.rating, { borderTopColor: colors.border }]}>
          <View style={{ flexDirection: 'row', gap: 4, marginBottom: spacing.xs }}>
            {Array.from({ length: request.rating }).map((_, i) => (
              <Icon key={i} name="star" size={20} color={colors.accent} />
            ))}
          </View>
          <Text style={[styles.ratingText, { color: colors.textSecondary }]}>You received 5 stars!</Text>
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
    fontSize: typography.sizes.xl,
    fontWeight: '700',
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
    fontSize: typography.sizes.sm,
    fontWeight: '500',
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
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  cardActivity: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  cardDate: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  cardAmount: {
    alignItems: 'flex-end',
  },
  amountValue: {
    fontSize: typography.sizes.lg,
    fontWeight: '700',
  },
  amountLabel: {
    fontSize: typography.sizes.xs,
  },
  messageBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  messageText: {
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
    fontSize: typography.sizes.sm,
  },
});
