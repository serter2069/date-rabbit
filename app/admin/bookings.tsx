import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

type StatusFilter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'PAID' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED'

const STATUS_FILTERS: StatusFilter[] = [
  'ALL', 'PENDING', 'ACCEPTED', 'PAID', 'COMPLETED', 'DISPUTED', 'CANCELLED',
]

const CANCELLABLE: StatusFilter[] = ['PENDING', 'ACCEPTED', 'PAID']

function statusVariant(status: string): 'neutral' | 'warning' | 'success' | 'error' | 'primary' {
  if (status === 'COMPLETED') return 'success'
  if (status === 'CANCELLED') return 'neutral'
  if (status === 'DISPUTED') return 'error'
  if (status === 'PENDING') return 'warning'
  if (status === 'ACCEPTED' || status === 'PAID') return 'primary'
  return 'neutral'
}

interface BookingUser {
  id: string
  name: string | null
  avatar: string | null
}

interface BookingCompanion {
  user: BookingUser
}

interface AdminBooking {
  id: string
  status: string
  date: string
  totalAmount: number
  seeker: BookingUser
  companion: BookingCompanion
  createdAt: string
}

function BookingRow({
  item,
  token,
  onCancel,
}: {
  item: AdminBooking
  token: string | null
  onCancel: (id: string) => void
}) {
  const [cancelling, setCancelling] = useState(false)
  const canCancel = CANCELLABLE.includes(item.status as StatusFilter)

  async function cancel() {
    try {
      setCancelling(true)
      const res = await fetch(`${API_URL}/api/admin/bookings/${item.id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) onCancel(item.id)
    } catch (err) {
      console.error(err)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <View className="bg-white border-b border-[#F0E6EA] px-4 py-3">
      <View className="flex-row items-center justify-between mb-1">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-[#201317]">
            {item.seeker.name ?? 'Seeker'} → {item.companion.user.name ?? 'Companion'}
          </Text>
          <Text className="text-xs text-[#81656E]">
            {new Date(item.date).toLocaleDateString()} · ${item.totalAmount.toFixed(2)}
          </Text>
        </View>
        <View className="items-end gap-1">
          <Badge label={item.status} variant={statusVariant(item.status)} />
          {canCancel && (
            <Pressable
              onPress={cancel}
              disabled={cancelling}
              className="bg-[#DC2626] rounded-lg px-3 py-1 active:opacity-80"
            >
              {cancelling ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-xs font-semibold">Cancel</Text>
              )}
            </Pressable>
          )}
        </View>
      </View>
    </View>
  )
}

export default function AdminBookings() {
  const { token } = useAuth()
  const [filter, setFilter] = useState<StatusFilter>('ALL')
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(
    async (nextPage = 1, append = false) => {
      try {
        if (nextPage === 1) setLoading(true)
        else setLoadingMore(true)
        setError(null)

        const params = new URLSearchParams({
          page: String(nextPage),
          limit: '20',
          ...(filter !== 'ALL' ? { status: filter } : {}),
        })

        const res = await fetch(`${API_URL}/api/admin/bookings?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        setTotal(data.total)
        setBookings((prev) => (append ? [...prev, ...data.bookings] : data.bookings))
        setPage(nextPage)
      } catch (err) {
        setError('Failed to load bookings')
        console.error(err)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [token, filter]
  )

  useEffect(() => {
    fetchBookings(1)
  }, [fetchBookings])

  function handleCancel(id: string) {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'CANCELLED' } : b))
    )
  }

  return (
    <View className="flex-1 bg-[#FBF9FA]">
      {/* Filter scroll */}
      <View className="flex-row flex-wrap px-4 pt-3 pb-2 gap-2">
        {STATUS_FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full border ${
              filter === f ? 'bg-[#C52660] border-[#C52660]' : 'bg-white border-[#F0E6EA]'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                filter === f ? 'text-white' : 'text-[#81656E]'
              }`}
            >
              {f}
            </Text>
          </Pressable>
        ))}
      </View>

      {error && (
        <View className="mx-4 mb-2 bg-[#FEE2E2] rounded-xl p-3">
          <Text className="text-[#DC2626] text-sm">{error}</Text>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C52660" />
        </View>
      ) : bookings.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#81656E]">No bookings found</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => (
            <BookingRow item={item} token={token} onCancel={handleCancel} />
          )}
          onEndReached={() => {
            if (!loadingMore && bookings.length < total) fetchBookings(page + 1, true)
          }}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="#C52660" />
              </View>
            ) : null
          }
        />
      )}

      <View className="px-4 py-2 bg-white border-t border-[#F0E6EA]">
        <Text className="text-xs text-[#81656E]">
          {bookings.length} of {total} bookings
        </Text>
      </View>
    </View>
  )
}
