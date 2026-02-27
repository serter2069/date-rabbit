import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Platform, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Icon } from '../../../src/components/Icon';
import { useTheme, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { useEarningsStore } from '../../../src/store/earningsStore';
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

  const {
    earnings,
    connectStatus,
    isLoading: storeLoading,
    fetchEarnings,
    fetchConnectStatus,
    startStripeOnboarding,
  } = useEarningsStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [onboardingLoading, setOnboardingLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchEarnings(),
          fetchConnectStatus(),
          paymentsApi.getEarningsHistory(1, 4).then((data) => {
            setTransactions(data.transactions);
          }),
        ]);
      } catch (error) {
        console.error('Failed to fetch earnings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSetupPayments = async () => {
    setOnboardingLoading(true);
    const result = await startStripeOnboarding();
    setOnboardingLoading(false);

    if (result.success && result.url) {
      if (Platform.OS === 'web') {
        Linking.openURL(result.url);
      } else {
        await WebBrowser.openAuthSessionAsync(result.url, 'daterabbit://');
        // Re-check status after returning from Stripe
        fetchConnectStatus();
      }
    }
  };

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

  const isConnected = connectStatus?.complete === true;
  const payoutsEnabled = connectStatus?.payoutsEnabled === true;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Earnings</Text>
      </View>

      {/* Stripe Connect Setup Banner */}
      {!isConnected && (
        <Card style={[styles.setupBanner, { backgroundColor: colors.primary }]}>
          <View style={[styles.setupIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Icon name="credit-card" size={28} color="#fff" />
          </View>
          <Text style={styles.setupTitle}>Set Up Payments</Text>
          <Text style={styles.setupDescription}>
            Connect your bank account through Stripe to start receiving payments from bookings.
          </Text>
          <Button
            title={onboardingLoading ? 'Redirecting...' : 'Set Up Now'}
            onPress={handleSetupPayments}
            disabled={onboardingLoading}
            style={{ backgroundColor: colors.white, marginTop: spacing.md }}
            textStyle={{ color: colors.primary }}
          />
        </Card>
      )}

      {/* Verification Pending Warning */}
      {isConnected && !payoutsEnabled && (
        <Card style={[styles.warningBanner, { backgroundColor: colors.warning + '15', borderColor: colors.warning }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Icon name="clock" size={20} color={colors.warning} />
            <Text style={[styles.warningTitle, { color: colors.warning }]}>Verification Pending</Text>
          </View>
          <Text style={[styles.warningText, { color: colors.textSecondary }]}>
            Stripe is reviewing your account. Payouts will be enabled once verification is complete.
          </Text>
        </Card>
      )}

      {/* Earnings Card - show when connected */}
      {isConnected && (
        <>
          <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
            <Text style={[styles.balanceLabel, { color: colors.white }]}>Total Earnings</Text>
            <Text style={[styles.balanceAmount, { color: colors.white }]}>${earnings.totalEarnings.toFixed(2)}</Text>
            <View style={styles.balanceActions}>
              {payoutsEnabled && (
                <Button
                  title="Withdraw"
                  onPress={() => router.push('/female/earnings/withdraw')}
                  style={{ backgroundColor: colors.white }}
                  textStyle={{ color: colors.primary }}
                  size="md"
                />
              )}
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

          {/* Stripe Connected indicator */}
          <View style={styles.connectedRow}>
            <Icon name="check-circle" size={16} color={colors.success} />
            <Text style={[styles.connectedText, { color: colors.textMuted }]}>
              Stripe account connected
            </Text>
          </View>
        </>
      )}
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
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
  },
  setupBanner: {
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  setupIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  setupTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    color: '#fff',
    marginBottom: spacing.xs,
  },
  setupDescription: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    lineHeight: 20,
  },
  warningBanner: {
    marginBottom: spacing.lg,
    borderWidth: 2,
  },
  warningTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  warningText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  balanceCard: {
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    opacity: 0.8,
  },
  balanceAmount: {
    fontFamily: typography.fonts.heading,
    fontSize: 42,
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
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  pendingLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    opacity: 0.8,
  },
  pendingAmount: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
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
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
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
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
  },
  seeAll: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
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
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  txActivity: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  txDate: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
  },
  txRight: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  txStatus: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    textTransform: 'capitalize',
  },
  connectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingBottom: spacing.xl,
  },
  connectedText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
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
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
  },
});
