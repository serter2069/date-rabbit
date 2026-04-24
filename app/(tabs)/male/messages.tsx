// TODO: connect Socket.IO for real-time updates
import { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import { useRouter, useFocusEffect } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '@/lib/theme'
import { Avatar, EmptyState, ErrorState, LoadingState } from '@/components/ui'

interface Conversation {
  id: string
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
  lastMessage: string
  lastMessageAt: string
  unreadCount: number
  isPreBooking: boolean
  preBookingMsgCount?: number
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  return `${Math.floor(hours / 24)}d`
}

function ConversationRow({ conv, onPress }: { conv: Conversation; onPress: () => void }) {
  const remaining = conv.isPreBooking ? 5 - (conv.preBookingMsgCount ?? 0) : null

  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={`Conversation with ${conv.otherUserName}`}
      className="flex-row items-center px-4 py-3 border-b border-[#F0E6EA] active:bg-[#F5DDE5]"
    >
      <View className="mr-3">
        <Avatar uri={conv.otherUserAvatar} name={conv.otherUserName} size="md" />
      </View>
      <View className="flex-1 min-w-0">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-base font-semibold text-[#201317]" numberOfLines={1}>
            {conv.otherUserName}
          </Text>
          <Text className="text-xs text-[#81656E] ml-2 flex-shrink-0">{timeAgo(conv.lastMessageAt)}</Text>
        </View>
        <View className="flex-row items-center justify-between">
          <Text className="text-sm text-[#81656E] flex-1 mr-2" numberOfLines={1}>
            {conv.lastMessage.slice(0, 40)}{conv.lastMessage.length > 40 ? '…' : ''}
          </Text>
          {conv.unreadCount > 0 && (
            <View className="w-5 h-5 rounded-full bg-[#C52660] items-center justify-center flex-shrink-0">
              <Text className="text-xs font-bold text-white">{conv.unreadCount > 9 ? '9+' : conv.unreadCount}</Text>
            </View>
          )}
        </View>
        {conv.isPreBooking && (
          <View className="flex-row items-center mt-0.5">
            <View className="px-1.5 py-0.5 rounded bg-[#F5DDE5]">
              <Text className="text-xs text-[#C52660] font-medium">Pre-booking</Text>
            </View>
            {remaining !== null && (
              <Text className="text-xs text-[#81656E] ml-1.5">{remaining} msg{remaining !== 1 ? 's' : ''} left</Text>
            )}
          </View>
        )}
      </View>
    </Pressable>
  )
}

export default function MaleMessagesScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/messages')
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to load messages')
      }
      const json: Conversation[] = await res.json()
      setConversations(json)
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    await fetchConversations()
    setLoading(false)
  }, [fetchConversations])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    await fetchConversations()
    setRefreshing(false)
  }, [fetchConversations])

  useEffect(() => { load() }, [load])

  // Polling fallback: refetch on screen focus (until Socket.IO is connected)
  useFocusEffect(
    useCallback(() => {
      fetchConversations()
    }, [fetchConversations])
  )

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <LoadingState message="Loading messages..." />
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
      <View style={{ paddingTop: insets.top }} className="px-4 py-4 border-b border-[#F0E6EA] bg-white">
        <Text className="text-2xl font-bold text-[#201317]">Messages</Text>
      </View>
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: insets.bottom + 80, maxWidth: 768, alignSelf: 'center', width: '100%' }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            title="No messages yet"
            message="Browse companions and start a conversation."
          />
        }
        renderItem={({ item }) => (
          <ConversationRow
            conv={item}
            onPress={() => router.push(`/chat/${item.id}`)}
          />
        )}
      />
    </View>
  )
}
