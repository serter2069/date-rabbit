import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../../../src/components/Card';
import { Button } from '../../../../src/components/Button';
import { Icon } from '../../../../src/components/Icon';
import { useTheme, colors, spacing, typography, borderRadius } from '../../../../src/constants/theme';
import { paymentsApi } from '../../../../src/services/api';

interface Payout {
  id: string;
  amount: number;
  status: string;
  arrivalDate: string;
  createdAt: string;
}

export default function WithdrawScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors } = useTheme();

  const [balance, setBalance] = useState({ available: 0, pending: 0, currency: 'usd' });
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [amount, setAmount] = useState('');
  const [useFullAmount, setUseFullAmount] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [balanceData, payoutsData] = await Promise.all([
        paymentsApi.getPayoutBalance(),
        paymentsApi.getPayoutHistory(5),
      ]);
      setBalance(balanceData);
      setPayouts(payoutsData.payouts);
    } catch (error) {
      console.error('Failed to fetch payout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const withdrawAmount = useFullAmount ? undefined : parseFloat(amount);

    if (!useFullAmount && (!withdrawAmount || withdrawAmount < 1)) {
      Alert.alert('Invalid Amount', 'Please enter an amount of at least $1.00');
      return;
    }

    if (!useFullAmount && withdrawAmount > balance.available) {
      Alert.alert('Insufficient Balance', 'The amount exceeds your available balance');
      return;
    }

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw ${useFullAmount ? `$${balance.available.toFixed(2)}` : `$${withdrawAmount?.toFixed(2)}`} to your bank account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          onPress: async () => {
            setWithdrawing(true);
            try {
              const result = await paymentsApi.createPayout(withdrawAmount);
              Alert.alert('Success', result.message);
              fetchData();
              setAmount('');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to create payout');
            } finally {
              setWithdrawing(false);
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return colors.success;
      case 'pending': return colors.warning;
      case 'in_transit': return colors.primary;
      case 'failed': return colors.error;
      default: return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Withdraw Funds</Text>
        <View style={styles.placeholder} />
      </View>

      <Card style={[styles.balanceCard, { backgroundColor: colors.primary }]}>
        <Text style={[styles.balanceLabel, { color: colors.white }]}>Available to Withdraw</Text>
        <Text style={[styles.balanceAmount, { color: colors.white }]}>
          ${balance.available.toFixed(2)}
        </Text>
        {balance.pending > 0 && (
          <View style={styles.pendingRow}>
            <Icon name="clock" size={14} color={colors.white} />
            <Text style={[styles.pendingText, { color: colors.white }]}>
              ${balance.pending.toFixed(2)} pending
            </Text>
          </View>
        )}
      </Card>

      <Card style={styles.withdrawCard}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Withdrawal Amount</Text>

        <TouchableOpacity
          style={[
            styles.optionRow,
            useFullAmount && { backgroundColor: colors.primary + '15', borderColor: colors.primary },
          ]}
          onPress={() => setUseFullAmount(true)}
        >
          <View style={[styles.radio, useFullAmount && { borderColor: colors.primary }]}>
            {useFullAmount && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
          </View>
          <Text style={[styles.optionText, { color: colors.text }]}>
            Withdraw full amount (${balance.available.toFixed(2)})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.optionRow,
            !useFullAmount && { backgroundColor: colors.primary + '15', borderColor: colors.primary },
          ]}
          onPress={() => setUseFullAmount(false)}
        >
          <View style={[styles.radio, !useFullAmount && { borderColor: colors.primary }]}>
            {!useFullAmount && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
          </View>
          <Text style={[styles.optionText, { color: colors.text }]}>Custom amount</Text>
        </TouchableOpacity>

        {!useFullAmount && (
          <View style={styles.amountInputContainer}>
            <Text style={[styles.currencySymbol, { color: colors.text }]}>$</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.text, borderColor: colors.border }]}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        )}

        <Button
          title={withdrawing ? 'Processing...' : 'Withdraw to Bank'}
          onPress={handleWithdraw}
          disabled={withdrawing || balance.available < 1}
          style={{ marginTop: spacing.lg }}
        />

        {balance.available < 1 && (
          <Text style={[styles.minAmountText, { color: colors.textSecondary }]}>
            Minimum withdrawal amount is $1.00
          </Text>
        )}
      </Card>

      {payouts.length > 0 && (
        <View style={styles.historySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Withdrawals</Text>

          {payouts.map((payout) => (
            <Card key={payout.id} style={styles.payoutCard}>
              <View style={[styles.payoutIcon, { backgroundColor: getStatusColor(payout.status) + '20' }]}>
                <Icon
                  name={payout.status === 'paid' ? 'check' : payout.status === 'failed' ? 'x' : 'arrow-right'}
                  size={16}
                  color={getStatusColor(payout.status)}
                />
              </View>
              <View style={styles.payoutInfo}>
                <Text style={[styles.payoutAmount, { color: colors.text }]}>
                  ${payout.amount.toFixed(2)}
                </Text>
                <Text style={[styles.payoutDate, { color: colors.textSecondary }]}>
                  {formatDate(payout.createdAt)}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payout.status) + '20' }]}>
                <Text style={[styles.statusText, { color: getStatusColor(payout.status) }]}>
                  {payout.status.replace('_', ' ')}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}

      <View style={styles.infoSection}>
        <Icon name="info" size={16} color={colors.textSecondary} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Withdrawals typically arrive in 1-2 business days. Instant payouts may be available for an additional fee.
        </Text>
      </View>
    </ScrollView>
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
  content: {
    padding: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  balanceCard: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  balanceLabel: {
    fontSize: typography.sizes.sm,
    opacity: 0.8,
  },
  balanceAmount: {
    fontSize: 42,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.xs,
  },
  pendingText: {
    fontSize: typography.sizes.sm,
    opacity: 0.8,
  },
  withdrawCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: spacing.sm,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  optionText: {
    fontSize: typography.sizes.md,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  currencySymbol: {
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    marginRight: spacing.sm,
  },
  amountInput: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: '600',
    padding: spacing.md,
    borderWidth: 1,
    borderRadius: borderRadius.md,
  },
  minAmountText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  historySection: {
    marginBottom: spacing.lg,
  },
  payoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  payoutIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payoutInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  payoutAmount: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  payoutDate: {
    fontSize: typography.sizes.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  statusText: {
    fontSize: typography.sizes.xs,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
  },
  infoText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
});
