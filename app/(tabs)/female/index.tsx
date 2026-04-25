import { useCallback, useEffect, useState } from 'react'
import {
  Pressable,
  RefreshControl,
  ScrollView,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { colors } from '@/lib/theme'
import { Card, EmptyState, ErrorState, LoadingState } from '@/components/ui'

interface DashboardStats {
  totalEarnings: number
  thisMonthEarnings: number
  completedDates: number
  rating: number
  pendingRequestsCount: number
  isOnline: boolean
}

interface UpcomingBooking {
  id: string
  seekerName: string
  date: string
  duration: number
  location: string
}

interface DashboardData {
  stats: DashboardStats
  upcomingBookings: UpcomingBooking[]
  role?: string
}

function formatCurrency(amount: number): string {
  return '$' + amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 mx-1 items-center">
      <Text className="text-xl font-bold text-[#201317]">{value}</Text>
      <Text className="text-xs text-[#81656E] mt-1 text-center">{label}</Text>
    </View>
  )
}

function BookingRow({ booking }: { booking: UpcomingBooking }) {
  return (
    <View className="flex-row items-center py-3 border-b border-[#F0E6EA]">
      <View className="w-10 h-10 rounded-full bg-[#F5DDE5] items-center justify-center mr-3">
        <FontAwesome name="user" size={18} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-[#201317]">{booking.seekerName}</Text>
        <Text className="text-sm text-[#81656E]">
          {formatDate(booking.date)} · {booking.duration}h · {booking.location}
        </Text>
      </View>
    </View>
  )
}

export default function CompanionDashboard() {
  const { width } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [togglingOnline, setTogglingOnline] = useState(false)
  const [accessDenied, setAccessDenied] = useState(false)

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/companion/dashboard')
      if (res.status === 403) {
        setAccessDenied(true)
        return
      }
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to load dashboard')
      }
      const json: DashboardData = await res.json()
      setData(json)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    await fetchDashboard()
    setLoading(false)
  }, [fetchDashboard])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchDashboard()
    setRefreshing(false)
  }, [fetchDashboard])

  useEffect(() => { load() }, [load])

  const toggleOnline = async (value: boolean) => {
    if (!data || togglingOnline) return
    setTogglingOnline(true)
    setData(prev => prev ? { ...prev, stats: { ...prev.stats, isOnline: value } } : prev)
    try {
      const res = await fetch('/api/companion/online', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOnline: value }),
      })
      if (!res.ok) {
        setData(prev => prev ? { ...prev, stats: { ...prev.stats, isOnline: !value } } : prev)
      }
    } catch {
      setData(prev => prev ? { ...prev, stats: { ...prev.stats, isOnline: !value } } : prev)
    } finally {
      setTogglingOnline(false)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <LoadingState message="Loading dashboard..." />
      </View>
    )
  }

  if (accessDenied) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text className="text-xl font-bold text-[#201317] text-center">Access Denied</Text>
        <Text className="text-base text-[#81656E] text-center mt-2">
          This area is only available to approved companions.
        </Text>
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

  const stats = data.stats

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 80, maxWidth: 1200, alignSelf: 'center', width: '100%' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      <View className="max-w-4xl w-full mx-auto px-4">
        {/* Header */}
        <View className="flex-row items-center justify-between py-4">
          <Text className="text-2xl font-bold text-[#201317]">Dashboard</Text>
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <Text className="text-sm font-semibold text-[#81656E]">
              {stats.isOnline ? 'Online' : 'Offline'}
            </Text>
            <Switch
              value={stats.isOnline}
              onValueChange={toggleOnline}
              trackColor={{ false: colors.textSecondary, true: colors.primary }}
              thumbColor="#fff"
              disabled={togglingOnline}
              accessibilityLabel="Toggle online status"
            />
          </View>
        </View>

        {/* Stats row */}
        <View className="flex-row mb-3" style={{ marginHorizontal: -4 }}>
          <StatCard label="Total Earned" value={formatCurrency(stats.totalEarnings)} />
          <StatCard label="This Month" value={formatCurrency(stats.thisMonthEarnings)} />
        </View>
        <View className="flex-row mb-4" style={{ marginHorizontal: -4 }}>
          <StatCard label="Completed Dates" value={String(stats.completedDates)} />
          <StatCard label="Rating" value={stats.rating > 0 ? stats.rating.toFixed(1) + ' ★' : '—'} />
        </View>

        {/* Pending requests card */}
        <Pressable
          onPress={() => router.push('/(tabs)/female/requests')}
          accessibilityLabel="View pending requests"
        >
          <Card variant="outlined" padding="md">
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center" style={{ gap: 12 }}>
                <View className="w-10 h-10 rounded-full bg-[#FEE2E2] items-center justify-center">
                  <FontAwesome name="inbox" size={18} color={colors.error} />
                </View>
                <View>
                  <Text className="text-base font-bold text-[#201317]">Pending Requests</Text>
                  <Text className="text-sm text-[#81656E]">Needs response within 24h</Text>
                </View>
              </View>
              <View className="flex-row items-center" style={{ gap: 8 }}>
                {stats.pendingRequestsCount > 0 && (
                  <View className="w-7 h-7 rounded-full bg-[#C52660] items-center justify-center">
                    <Text className="text-xs font-bold text-white">{stats.pendingRequestsCount}</Text>
                  </View>
                )}
                <FontAwesome name="chevron-right" size={14} color={colors.textSecondary} />
              </View>
            </View>
          </Card>
        </Pressable>

        {/* Upcoming bookings */}
        <View className="mt-5">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-lg font-bold text-[#201317]">Upcoming Bookings</Text>
            <Pressable onPress={() => router.push('/(tabs)/female/calendar')} accessibilityLabel="View calendar">
              <Text className="text-sm font-semibold text-[#C52660]">View Calendar</Text>
            </Pressable>
          </View>

          {data.upcomingBookings.length === 0 ? (
            <Card variant="default" padding="md">
              <EmptyState
                title="No upcoming bookings"
                message="Accept requests to see your schedule here."
              />
            </Card>
          ) : (
            <Card variant="default" padding="sm">
              {data.upcomingBookings.slice(0, 3).map(booking => (
                <BookingRow key={booking.id} booking={booking} />
              ))}
            </Card>
          )}
        </View>
      </View>
    </ScrollView>
  )
}
