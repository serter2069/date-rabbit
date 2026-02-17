import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Icon } from '../../../src/components/Icon';
import { useTheme, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { paymentsApi } from '../../../src/services/api';

interface Transaction {
  id: string;
  type: 'earning' | 'payout';
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  seekerName?: string;
  activity?: string;
  createdAt: string;
}

export default function EarningsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const [earnings, setEarnings] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    completedBookings: 0,
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [earningsData, historyData] = await Promise.all([
          paymentsApi.getEarnings(),
          paymentsApi.getEarningsHistory(1, 4),
        ]);
        setEarnings(earningsData);
        setTransactions(historyData.transactions);
      } catch (error) {
        console.error('Failed to fetch earnings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Earnings</Text>
      </View>

      <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
        <Text style={[styles.balanceLabel, { color: colors.white }]}>Total Earnings</Text>
        <Text style={[styles.balanceAmount, { color: colors.white }]}>${earnings.totalEarnings.toFixed(2)}</Text>
        <View style={styles.balanceActions}>
          <Button
            title="Withdraw"
            onPress={() => router.push('/female/earnings/withdraw')}
            style={{ backgroundColor: colors.white }}
            textStyle={{ color: colors.primary }}
            size="md"
          />
        </View>
        <View style={styles.pendingRow}>
          <Text style={[styles.pendingLabel, { color: colors.white }]}>Pending</Text>
          <Text style={[styles.pendingAmount, { color: colors.white }]}>${earnings.pendingPayouts.toFixed(2)}</Text>
        </View>
      </Card>

      <View style={styles.statsRow}>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Completed</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>{earnings.completedBookings}</Text>
        </Card>
        <Card style={styles.statCard}>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          <Text style={[styles.statValue, { color: colors.text }]}>${earnings.totalEarnings.toFixed(0)}</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push('/female/earnings/history')}>
            <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No transactions yet
            </Text>
          </Card>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.id} style={styles.transactionCard}>
              <View style={[styles.txIcon, { backgroundColor: tx.status === 'completed' ? colors.success + '20' : colors.warning + '20' }]}>
                <Icon
                  name={tx.status === 'completed' ? 'check' : 'clock'}
                  size={18}
                  color={tx.status === 'completed' ? colors.success : colors.warning}
                />
              </View>
              <View style={styles.txInfo}>
                <Text style={[styles.txName, { color: colors.text }]}>{tx.seekerName || 'Unknown'}</Text>
                {tx.activity && (
                  <Text style={[styles.txActivity, { color: colors.textSecondary }]}>{tx.activity}</Text>
                )}
                <Text style={[styles.txDate, { color: colors.textSecondary }]}>{formatDate(tx.createdAt)}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={[
                  styles.txAmount,
                  { color: tx.status === 'completed' ? colors.success : colors.warning }
                ]}>
                  +${tx.amount.toFixed(2)}
                </Text>
                <Text style={[
                  styles.txStatus,
                  { color: tx.status === 'completed' ? colors.success : colors.warning }
                ]}>
                  {tx.status}
                </Text>
              </View>
            </Card>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Methods</Text>
        <Card>
          <View style={styles.paymentMethod}>
            <View style={[styles.paymentIconContainer, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="building-2" size={24} color={colors.primary} />
            </View>
            <View style={styles.paymentInfo}>
              <Text style={[styles.paymentName, { color: colors.text }]}>Bank Account</Text>
              <Text style={[styles.paymentDetails, { color: colors.textSecondary }]}>••••4521</Text>
            </View>
            <Text style={[styles.paymentDefault, { color: colors.primary }]}>Default</Text>
          </View>
        </Card>
        <TouchableOpacity style={styles.addPayment}>
          <Text style={[styles.addPaymentText, { color: colors.primary }]}>+ Add Payment Method</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  balanceCard: {
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontSize: typography.sizes.sm,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    marginVertical: spacing.sm,
  },
  balanceActions: {
    marginBottom: spacing.md,
  },
  pendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  pendingLabel: {
    fontSize: typography.sizes.sm,
    opacity: 0.8,
  },
  pendingAmount: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statLabel: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  txIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  txInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  txName: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  txActivity: {
    fontSize: typography.sizes.sm,
  },
  txDate: {
    fontSize: typography.sizes.xs,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  txStatus: {
    fontSize: typography.sizes.xs,
    textTransform: 'capitalize',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  paymentName: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
  },
  paymentDetails: {
    fontSize: typography.sizes.sm,
  },
  paymentDefault: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
  },
  addPayment: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  addPaymentText: {
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyText: {
    fontSize: typography.sizes.md,
  },
});
