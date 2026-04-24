import { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { colors } from '@/lib/theme'
import { Avatar, Button, Card, EmptyState, ErrorState, LoadingState } from '@/components/ui'

interface BookingRequest {
  id: string
  seekerName: string
  seekerAvatar?: string
  date: string
  duration: number
  activity: string
  location: string
  price: number
  createdAt: string
}

function hoursUntilExpiry(createdAt: string): number {
  const created = new Date(createdAt).getTime()
  const expiry = created + 24 * 60 * 60 * 1000
  const diff = expiry - Date.now()
  return Math.max(0, Math.ceil(diff / (60 * 60 * 1000)))
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function RequestCard({
  request,
  onAccept,
  onDecline,
  processing,
}: {
  request: BookingRequest
  onAccept: (id: string) => void
  onDecline: (id: string) => void
  processing: boolean
}) {
  const hours = hoursUntilExpiry(request.createdAt)

  return (
    <Card variant="outlined" padding="md">
      {/* Header row */}
      <View className="flex-row items-center mb-3" style={{ gap: 12 }}>
        <Avatar uri={request.seekerAvatar} name={request.seekerName} size="md" />
        <View className="flex-1">
          <Text className="text-base font-bold text-[#201317]">{request.seekerName}</Text>
          <View className="flex-row items-center mt-0.5" style={{ gap: 4 }}>
            <FontAwesome name="clock-o" size={12} color={hours < 4 ? colors.error : colors.warning} />
            <Text
              className="text-xs font-semibold"
              style={{ color: hours < 4 ? colors.error : colors.warning }}
            >
              Expires in {hours}h
            </Text>
          </View>
        </View>
        <Text className="text-base font-bold text-[#C52660]">${request.price}</Text>
      </View>

      {/* Details */}
      <View style={{ gap: 4 }} className="mb-4">
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <FontAwesome name="calendar" size={13} color={colors.textSecondary} />
          <Text className="text-sm text-[#81656E]">{formatDate(request.date)}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <FontAwesome name="clock-o" size={13} color={colors.textSecondary} />
          <Text className="text-sm text-[#81656E]">{request.duration}h · {request.activity}</Text>
        </View>
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <FontAwesome name="map-marker" size={13} color={colors.textSecondary} />
          <Text className="text-sm text-[#81656E]">{request.location}</Text>
        </View>
      </View>

      {/* Actions */}
      <View className="flex-row" style={{ gap: 8 }}>
        <View className="flex-1">
          <Button
            label="Decline"
            variant="secondary"
            size="sm"
            disabled={processing}
            onPress={() => onDecline(request.id)}
          />
        </View>
        <View className="flex-1">
          <Button
            label="Accept"
            variant="primary"
            size="sm"
            disabled={processing}
            onPress={() => onAccept(request.id)}
          />
        </View>
      </View>
    </Card>
  )
}

export default function RequestsScreen() {
  const insets = useSafeAreaInsets()
  const [requests, setRequests] = useState<BookingRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [processingId, setProcessingId] = useState<string | null>(null)

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/bookings/requests?status=pending')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to load requests')
      }
      const json: BookingRequest[] = await res.json()
      setRequests(json)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    await fetchRequests()
    setLoading(false)
  }, [fetchRequests])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchRequests()
    setRefreshing(false)
  }, [fetchRequests])

  useEffect(() => { load() }, [load])

  const handleAction = async (id: string, action: 'accept' | 'decline') => {
    if (processingId) return
    setProcessingId(id)
    // optimistic remove
    setRequests(prev => prev.filter(r => r.id !== id))
    try {
      const res = await fetch(`/api/bookings/${id}/${action}`, { method: 'PUT' })
      if (!res.ok) {
        // revert
        await fetchRequests()
      }
    } catch {
      await fetchRequests()
    } finally {
      setProcessingId(null)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <LoadingState message="Loading requests..." />
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

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ paddingTop: insets.top }} className="px-4 py-4">
        <Text className="text-2xl font-bold text-[#201317]">Pending Requests</Text>
      </View>
      <FlatList
        data={requests}
        keyExtractor={item => item.id}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: insets.bottom + 80,
          gap: 12,
          maxWidth: 768,
          alignSelf: 'center',
          width: '100%',
        }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            title="No pending requests"
            message="New booking requests will appear here."
          />
        }
        renderItem={({ item }) => (
          <RequestCard
            request={item}
            onAccept={(id) => handleAction(id, 'accept')}
            onDecline={(id) => handleAction(id, 'decline')}
            processing={processingId === item.id}
          />
        )}
      />
    </View>
  )
}
