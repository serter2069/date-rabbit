import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Icon } from '../../../src/components/Icon';
import { useTheme, spacing, typography, borderRadius, colors as themeColors } from '../../../src/constants/theme';
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

// Aggregate transactions by day for the last N days.
// Returns array of { label: string, total: number } with length === days.
function aggregateByDay(txs: Transaction[], days: number): { label: string; total: number }[] {
  const result: { label: string; total: number }[] = [];
  const now = new Date();

  const DAY_LABELS_7 = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - i);

    const dayStr = day.toISOString().slice(0, 10);

    const total = txs
      .filter((tx) => {
        const txDate = new Date(tx.createdAt).toISOString().slice(0, 10);
        return txDate === dayStr;
      })
      .reduce((sum, tx) => sum + tx.amount, 0);

    let label: string;
    if (days === 7) {
      // dayOfWeek: 0=Sun,1=Mon,...,6=Sat
      const dow = day.getDay();
      // Shift so Mon=0
      const mondayBased = (dow + 6) % 7;
      label = DAY_LABELS_7[mondayBased];
    } else {
      // 30-day: show every 5th label (index 0,5,10,15,20,25,29)
      const idx = days - 1 - i; // 0-indexed from left
      const dayNum = idx + 1; // 1-indexed
      const showLabel = dayNum === 1 || dayNum % 5 === 1 || dayNum === days;
      label = showLabel ? String(dayNum) : '';
    }

    result.push({ label, total });
  }

  return result;
}

function getAverageBooking(txs: Transaction[]): string {
  if (txs.length === 0) return '$0';
  const avg = txs.reduce((sum, tx) => sum + tx.amount, 0) / txs.length;
  return `$${avg.toFixed(0)}`;
}

function getBestWeekday(txs: Transaction[]): string {
  if (txs.length === 0) return '—';
  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totals = new Array(7).fill(0);
  txs.forEach((tx) => {
    const dow = new Date(tx.createdAt).getDay();
    totals[dow] += tx.amount;
  });
  const bestDow = totals.indexOf(Math.max(...totals));
  return DAY_NAMES[bestDow];
}

function getMonthTotal(txs: Transaction[]): string {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const total = txs
    .filter((tx) => new Date(tx.createdAt) >= monthStart)
    .reduce((sum, tx) => sum + tx.amount, 0);
  return `$${total.toFixed(0)}`;
}

// Inline bar sparkline component
interface BarSparklineProps {
  data: { label: string; total: number }[];
  primaryColor: string;
  textSecondaryColor: string;
}

function BarSparkline({ data, primaryColor, textSecondaryColor }: BarSparklineProps) {
  const maxTotal = Math.max(...data.map((d) => d.total));
  const BAR_MAX_HEIGHT = 80;
  const noData = maxTotal === 0;

  return (
    <View style={sparklineStyles.container}>
      <View style={sparklineStyles.barsRow}>
        {data.map((d, idx) => {
          const barHeight = noData ? 2 : Math.max(2, (d.total / maxTotal) * BAR_MAX_HEIGHT);
          return (
            <View key={idx} style={sparklineStyles.barWrapper}>
              <View style={sparklineStyles.barColumn}>
                <View
                  style={[
                    sparklineStyles.bar,
                    {
                      height: barHeight,
                      backgroundColor: noData ? textSecondaryColor + '40' : primaryColor,
                      opacity: d.total === 0 && !noData ? 0.25 : 1,
                    },
                  ]}
                />
              </View>
              <Text style={[sparklineStyles.barLabel, { color: textSecondaryColor }]}>
                {d.label}
              </Text>
            </View>
          );
        })}
      </View>
      {noData && (
        <Text style={[sparklineStyles.noDataText, { color: textSecondaryColor }]}>
          No data yet
        </Text>
      )}
    </View>
  );
}

const sparklineStyles = StyleSheet.create({
  container: {
    marginTop: spacing.sm,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 100,
    gap: 2,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 100,
  },
  barColumn: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    borderRadius: 3,
    minHeight: 2,
  },
  barLabel: {
    fontFamily: typography.fonts.body,
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  noDataText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

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
  } = useEarningsStore();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chartTransactions, setChartTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d'>('7d');

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchEarnings(),
          fetchConnectStatus(),
          // Fetch last 4 for recent transactions display
          paymentsApi.getEarningsHistory(1, 4).then((data) => {
            setTransactions(data.transactions);
          }),
          // Fetch up to 100 for chart aggregation
          paymentsApi.getEarningsHistory(1, 100).then((data) => {
            const earningTxs = (data.transactions as Transaction[]).filter(
              (tx) => tx.type === 'earning' && tx.status === 'completed'
            );
            setChartTransactions(earningTxs);
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

  // Aggregate chart data based on selected period — client-side only, no re-fetch
  const chartData = useMemo(() => {
    const days = chartPeriod === '7d' ? 7 : 30;
    return aggregateByDay(chartTransactions, days);
  }, [chartTransactions, chartPeriod]);

  const avgBooking = useMemo(() => getAverageBooking(chartTransactions), [chartTransactions]);
  const bestWeekday = useMemo(() => getBestWeekday(chartTransactions), [chartTransactions]);
  const monthTotal = useMemo(() => getMonthTotal(chartTransactions), [chartTransactions]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
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
            <Icon name="credit-card" size={28} color={colors.white} />
          </View>
          <Text style={styles.setupTitle}>Connect your bank to receive payouts</Text>
          <Button
            title="Set Up Payouts"
            onPress={() => router.push('/stripe/connect')}
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

          {/* Earnings Sparkline Chart */}
          <Card style={[styles.chartCard, { borderColor: colors.border }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.chartTitle, { color: colors.text }]}>Earnings Overview</Text>
              <View style={[styles.toggleRow, { backgroundColor: (colors as any).backgroundSecondary || colors.background }]}>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    chartPeriod === '7d' && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setChartPeriod('7d')}
                  accessibilityLabel="Show 7 day chart"
                  accessibilityRole="button"
                >
                  <Text style={[
                    styles.toggleBtnText,
                    { color: chartPeriod === '7d' ? colors.white : colors.textSecondary },
                  ]}>
                    7D
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    chartPeriod === '30d' && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setChartPeriod('30d')}
                  accessibilityLabel="Show 30 day chart"
                  accessibilityRole="button"
                >
                  <Text style={[
                    styles.toggleBtnText,
                    { color: chartPeriod === '30d' ? colors.white : colors.textSecondary },
                  ]}>
                    30D
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <BarSparkline
              data={chartData}
              primaryColor={colors.primary}
              textSecondaryColor={colors.textSecondary}
            />
          </Card>

          {/* Analytics Cards */}
          <View style={styles.analyticsRow}>
            <Card style={styles.analyticsCard}>
              <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Avg Booking</Text>
              <Text style={[styles.analyticsValue, { color: colors.text }]}>{avgBooking}</Text>
            </Card>
            <Card style={styles.analyticsCard}>
              <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>Best Day</Text>
              <Text style={[styles.analyticsValue, { color: colors.text }]}>{bestWeekday}</Text>
            </Card>
            <Card style={styles.analyticsCard}>
              <Text style={[styles.analyticsLabel, { color: colors.textSecondary }]}>This Month</Text>
              <Text style={[styles.analyticsValue, { color: colors.text }]}>{monthTotal}</Text>
            </Card>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
              <TouchableOpacity onPress={() => router.push('/female/earnings/history')}
                accessibilityLabel="View earnings history"
                accessibilityRole="button"
              >
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
    color: themeColors.white,
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
    marginBottom: spacing.lg,
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
  // Chart
  chartCard: {
    marginBottom: spacing.md,
    borderWidth: 1,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chartTitle: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
  },
  toggleRow: {
    flexDirection: 'row',
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    padding: 2,
    gap: 2,
  },
  toggleBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  toggleBtnText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
  },
  // Analytics cards
  analyticsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  analyticsCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  analyticsLabel: {
    fontFamily: typography.fonts.body,
    fontSize: 10,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  analyticsValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
    textAlign: 'center',
  },
  // Sections
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
