import { useEffect, useState } from 'react'
import { ScrollView, Text, View, Pressable, ActivityIndicator, useWindowDimensions } from 'react-native'
import { router, useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { colors } from '@/lib/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

interface Stats {
  users: number
  pendingVerifications: number
  activeBookings: number
  openDisputes: number
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string
  value: number
  loading: boolean
}) {
  return (
    <View className="flex-1 bg-white rounded-2xl p-4 border border-[#F0E6EA]">
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Text className="text-2xl font-bold text-[#201317]">{value}</Text>
      )}
      <Text className="text-xs text-[#81656E] mt-1 font-medium">{label}</Text>
    </View>
  )
}

function QuickLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between bg-white rounded-xl px-4 py-3 border border-[#F0E6EA] active:opacity-70"
    >
      <Text className="text-base text-[#201317] font-medium">{label}</Text>
      <Text className="text-[#C52660] text-lg">›</Text>
    </Pressable>
  )
}

export default function AdminDashboard() {
  const { width } = useWindowDimensions()
  const { token } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_URL}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError('Failed to load stats')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerClassName="p-4 max-w-5xl w-full self-center" contentContainerStyle={{ maxWidth: 1200, alignSelf: 'center', width: '100%', paddingBottom: 40 }}>
      <Text className="text-2xl font-bold text-[#201317] mb-4">Overview</Text>

      {error && (
        <View className="bg-[#FEE2E2] rounded-xl p-3 mb-4">
          <Text className="text-[#DC2626] text-sm">{error}</Text>
        </View>
      )}

      {/* Stats row */}
      <View className="flex-row gap-3 mb-6 flex-wrap">
        <StatCard label="Total Users" value={stats?.users ?? 0} loading={loading} />
        <StatCard
          label="Pending Verifications"
          value={stats?.pendingVerifications ?? 0}
          loading={loading}
        />
        <StatCard
          label="Active Bookings"
          value={stats?.activeBookings ?? 0}
          loading={loading}
        />
        <StatCard
          label="Open Disputes"
          value={stats?.openDisputes ?? 0}
          loading={loading}
        />
      </View>

      <Text className="text-lg font-semibold text-[#201317] mb-3">Quick Actions</Text>
      <View className="gap-2">
        <QuickLink label="View Users" onPress={() => router.push('/admin/users' as never)} />
        <QuickLink label="View Verifications" onPress={() => router.push('/admin/verifications' as never)} />
        <QuickLink label="View Bookings" onPress={() => router.push('/admin/bookings' as never)} />
        <QuickLink label="View Disputes" onPress={() => router.push('/admin/disputes' as never)} />
        <QuickLink label="Manage Cities" onPress={() => router.push('/admin/cities' as never)} />
      </View>
    </ScrollView>
  )
}
