import { useEffect, useState } from 'react'
import { colors } from '@/lib/theme'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { Badge, EmptyState } from '@/components/ui'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

interface DisputeBookingUser {
  id: string
  name: string | null
}

interface DisputeBooking {
  id: string
  date: string
  totalAmount: number
  seeker: DisputeBookingUser
  companion: { user: DisputeBookingUser }
}

interface Dispute {
  id: string
  status: string
  reason?: string
  winner?: string | null
  createdAt: string
  booking: DisputeBooking
}

function DisputeCard({
  item,
  token,
  onResolve,
}: {
  item: Dispute
  token: string | null
  onResolve: (id: string) => void
}) {
  const [actioning, setActioning] = useState<null | 'seeker' | 'companion'>(null)

  async function resolve(winner: 'seeker' | 'companion') {
    try {
      setActioning(winner)
      const res = await fetch(`${API_URL}/api/admin/disputes/${item.id}/resolve`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ winner }),
      })
      if (res.ok) onResolve(item.id)
    } catch (err) {
      console.error(err)
    } finally {
      setActioning(null)
    }
  }

  const bk = item.booking

  return (
    <View className="bg-white mx-4 mb-3 rounded-2xl border border-[#F0E6EA] p-4">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-[#201317]">
            {bk.seeker.name ?? 'Seeker'} vs {bk.companion.user.name ?? 'Companion'}
          </Text>
          <Text className="text-xs text-[#81656E]">
            Booking {new Date(bk.date).toLocaleDateString()} · ${bk.totalAmount.toFixed(2)}
          </Text>
          {item.reason && (
            <Text className="text-xs text-[#81656E] mt-1" numberOfLines={2}>
              Claim: {item.reason}
            </Text>
          )}
        </View>
        <Badge
          label={item.status}
          variant={item.status === 'RESOLVED' ? 'success' : 'error'}
        />
      </View>

      {item.winner && (
        <View className="bg-[#D1FAE5] rounded-lg px-3 py-2 mb-2">
          <Text className="text-xs text-[#059669] font-semibold">
            Resolved in favour of {item.winner}
          </Text>
        </View>
      )}

      {item.status === 'OPEN' && (
        <View className="flex-row gap-2 mt-2">
          <Pressable
            onPress={() => resolve('seeker')}
            disabled={actioning !== null}
            className="flex-1 bg-[#C52660] rounded-xl py-2.5 items-center active:opacity-80"
          >
            {actioning === 'seeker' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white text-sm font-semibold">Favour Seeker</Text>
            )}
          </Pressable>
          <Pressable
            onPress={() => resolve('companion')}
            disabled={actioning !== null}
            className="flex-1 bg-[#E95C20] rounded-xl py-2.5 items-center active:opacity-80"
          >
            {actioning === 'companion' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white text-sm font-semibold">Favour Companion</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  )
}

export default function AdminDisputes() {
  const { width } = useWindowDimensions()
  const { token } = useAuth()
  const [disputes, setDisputes] = useState<Dispute[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDisputes()
  }, [])

  async function fetchDisputes() {
    try {
      setLoading(true)
      setError(null)
      const res = await fetch(`${API_URL}/api/admin/disputes`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setDisputes(data.disputes)
    } catch (err) {
      setError('Failed to load disputes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  function handleResolve(id: string) {
    setDisputes((prev) => prev.filter((d) => d.id !== id))
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#FBF9FA]">
        <ActivityIndicator color={colors.primary} />
      </View>
    )
  }

  return (
    <View className="flex-1 bg-[#FBF9FA]">
      {error && (
        <View className="mx-4 mt-3 bg-[#FEE2E2] rounded-xl p-3">
          <Text className="text-[#DC2626] text-sm">{error}</Text>
        </View>
      )}

      {disputes.length === 0 ? (
        <EmptyState
          title="No disputes"
          message="All disputes will appear here for review."
        />
      ) : (
        <FlatList
          data={disputes}
          keyExtractor={(d) => d.id}
          contentContainerClassName="pt-3 pb-6"
          renderItem={({ item }) => (
            <DisputeCard item={item} token={token} onResolve={handleResolve} />
          )}
        />
      )}
    </View>
  )
}
