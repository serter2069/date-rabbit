import { useCallback, useEffect, useState } from 'react'
import { FlatList, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { colors } from '@/lib/theme'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingState } from '@/components/ui'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

type NotificationType =
  | 'booking_request'
  | 'booking_accepted'
  | 'booking_declined'
  | 'payment_captured'
  | 'review_received'

interface ApiNotification {
  id: string
  type: NotificationType
  title: string
  description: string
  createdAt: string
  readAt: string | null
}

function iconForType(type: NotificationType): {
  name: React.ComponentProps<typeof FontAwesome>['name']
  color: string
  bg: string
} {
  switch (type) {
    case 'booking_request':
      return { name: 'calendar', color: '#C52660', bg: '#F5DDE5' }
    case 'booking_accepted':
      return { name: 'check-circle', color: colors.success, bg: '#D1FAE5' }
    case 'booking_declined':
      return { name: 'times-circle', color: colors.error, bg: '#FEE2E2' }
    case 'payment_captured':
      return { name: 'credit-card', color: '#059669', bg: '#D1FAE5' }
    case 'review_received':
      return { name: 'star', color: colors.warning, bg: '#FEF3C7' }
    default:
      return { name: 'bell', color: colors.textSecondary, bg: '#F3F4F6' }
  }
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  return `${days}d ago`
}

function NotificationCard({
  item,
  onMarkRead,
}: {
  item: ApiNotification
  onMarkRead: (id: string) => void
}) {
  const { name, color, bg } = iconForType(item.type)
  const isUnread = !item.readAt

  return (
    <Pressable
      onPress={() => onMarkRead(item.id)}
      accessibilityLabel={item.title}
      style={{ backgroundColor: isUnread ? '#FDF2F6' : colors.surface }}
      className="flex-row items-start px-4 py-3.5 border-b border-[#F0E6EA] active:bg-[#F5DDE5]"
    >
      <View
        className="w-10 h-10 rounded-full items-center justify-center mt-0.5"
        style={{ backgroundColor: bg }}
      >
        <FontAwesome name={name} size={16} color={color} />
      </View>
      <View className="flex-1 ml-3">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text
            className={`text-sm flex-1 mr-2 ${isUnread ? 'font-bold text-[#201317]' : 'font-medium text-[#81656E]'}`}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text className="text-xs text-[#81656E] flex-shrink-0">{timeAgo(item.createdAt)}</Text>
        </View>
        <Text className={`text-sm ${isUnread ? 'text-[#201317]' : 'text-[#81656E]'}`} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      {isUnread && (
        <View className="w-2 h-2 rounded-full bg-[#C52660] mt-2 ml-2 flex-shrink-0" />
      )}
    </Pressable>
  )
}

export default function NotificationsScreen() {
  const router = useRouter()
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      if (res.ok) {
        const data: ApiNotification[] = await res.json()
        setNotifications(data)
      } else if (res.status === 404) {
        // Endpoint not yet implemented — treat as empty
        setNotifications([])
      }
    } catch {
      // Network error — show empty state
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const markRead = useCallback(async (id: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n)
    )
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch {
      // ignore — optimistic is fine
    }
  }, [token])

  const markAllRead = useCallback(async () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
    )
    try {
      await fetch(`${API_URL}/api/notifications/read-all`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
    } catch {
      // ignore
    }
  }, [token])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-2 pb-4 border-b border-[#F0E6EA] bg-white">
        <View className="flex-row items-center">
          <Pressable onPress={() => router.back()} className="mr-3" accessibilityLabel="Go back">
            <FontAwesome name="arrow-left" size={18} color={colors.text} />
          </Pressable>
          <Text className="text-2xl font-bold text-[#201317]">Notifications</Text>
        </View>
        {notifications.some(n => !n.readAt) && (
          <Pressable onPress={markAllRead} accessibilityLabel="Mark all as read">
            <Text className="text-sm text-[#C52660] font-medium">Mark all read</Text>
          </Pressable>
        )}
      </View>

      {loading ? (
        <LoadingState message="Loading notifications..." />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          contentContainerStyle={{ maxWidth: 768, alignSelf: 'center', width: '100%' }}
          renderItem={({ item }) => (
            <NotificationCard item={item} onMarkRead={markRead} />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
              <FontAwesome name="bell-slash-o" size={48} color="#D1C0C8" />
              <Text className="text-base text-[#81656E] mt-4 font-medium">No notifications yet</Text>
              <Text className="text-sm text-[#81656E] mt-1">We'll notify you about bookings and messages.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  )
}
