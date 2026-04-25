import { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { colors } from '@/lib/theme'
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState } from '@/components/ui'

interface EarningsData {
  totalEarnings: number
  thisMonthEarnings: number
  pendingPayout: number
  stripeAccountId: string | null
  completedDates: number
  rating: number
  history: EarningsRow[]
}

interface EarningsRow {
  id: string
  date: string
  seekerName: string
  amount: number
  status: 'paid' | 'pending'
}

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function SummaryCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View className="bg-white rounded-2xl p-4 flex-1 mx-1">
      <Text className="text-xs text-[#81656E] mb-1">{label}</Text>
      <Text
        className="text-xl font-bold"
        style={{ color: accent ? colors.primary : colors.text }}
      >
        {value}
      </Text>
    </View>
  )
}

function HistoryRow({ row }: { row: EarningsRow }) {
  return (
    <View className="flex-row items-center py-3 border-b border-[#F0E6EA]">
      <View className="flex-1">
        <Text className="text-sm font-semibold text-[#201317]">{row.seekerName}</Text>
        <Text className="text-xs text-[#81656E]">{formatDate(row.date)}</Text>
      </View>
      <View className="items-end" style={{ gap: 2 }}>
        <Text className="text-base font-bold text-[#201317]">{formatCurrency(row.amount)}</Text>
        <View
          className="px-2 py-0.5 rounded-full"
          style={{ backgroundColor: row.status === 'paid' ? '#D1FAE5' : '#FEF3C7' }}
        >
          <Text
            className="text-xs font-semibold"
            style={{ color: row.status === 'paid' ? colors.success : colors.warning }}
          >
            {row.status === 'paid' ? 'Paid' : 'Pending'}
          </Text>
        </View>
      </View>
    </View>
  )
}

export default function EarningsScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchEarnings = useCallback(async () => {
    try {
      const res = await fetch('/api/companion/dashboard')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to load earnings')
      }
      const json: EarningsData = await res.json()
      setData(json)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    await fetchEarnings()
    setLoading(false)
  }, [fetchEarnings])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchEarnings()
    setRefreshing(false)
  }, [fetchEarnings])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <LoadingState message="Loading earnings..." />
      </View>
    )
  }

  if (error) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <ErrorState message={error} onRetry={load} />
      </View>
    )
  }

  if (!data) return null

  const history = data.history ?? []

  return (
    <FlatList
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      ListHeaderComponent={
        <View className="max-w-4xl w-full mx-auto px-4">
          <Text className="text-2xl font-bold text-[#201317] py-4">Earnings</Text>

          {/* Stripe warning */}
          {!data.stripeAccountId && (
            <Pressable
              onPress={() => router.push('/stripe-connect' as never)}
              accessibilityLabel="Connect bank account"
            >
              <Card variant="outlined" padding="md">
                <View className="flex-row items-center" style={{ gap: 12 }}>
                  <View className="w-10 h-10 rounded-full bg-[#FEF3C7] items-center justify-center">
                    <FontAwesome name="bank" size={16} color={colors.warning} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-[#201317]">Connect Bank Account</Text>
                    <Text className="text-sm text-[#81656E]">Required to receive payouts</Text>
                  </View>
                  <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
                </View>
              </Card>
            </Pressable>
          )}

          {/* Total */}
          <Card variant="default" padding="lg">
            <Text className="text-sm text-[#81656E] mb-1">Total Earnings</Text>
            <Text className="text-4xl font-extrabold text-[#C52660] mb-1">
              {formatCurrency(data.totalEarnings)}
            </Text>
            <Text className="text-sm text-[#81656E]">All time</Text>
          </Card>

          {/* Summary row */}
          <View className="flex-row mt-3 mb-4" style={{ marginHorizontal: -4 }}>
            <SummaryCard label="This Month" value={formatCurrency(data.thisMonthEarnings)} accent />
            <SummaryCard label="Pending Payout" value={formatCurrency(data.pendingPayout)} />
          </View>

          {/* Earnings history header */}
          <Text className="text-lg font-bold text-[#201317] mb-2">Earnings History</Text>

          {history.length === 0 && (
            <EmptyState
              title="No earnings yet"
              message="Completed bookings will appear here."
            />
          )}
        </View>
      }
      data={history}
      keyExtractor={item => item.id}
      renderItem={({ item, index }) => (
        <View style={{ paddingHorizontal: 16, maxWidth: 768, alignSelf: 'center', width: '100%' }}>
          <HistoryRow row={item} />
        </View>
      )}
    />
  )
}
