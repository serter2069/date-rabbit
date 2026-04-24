import { useCallback, useEffect, useRef, useState } from 'react'
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { colors } from '@/lib/theme'
import { Avatar, ErrorState, LoadingState } from '@/components/ui'

interface Message {
  id: string
  senderId: string
  content: string
  createdAt: string
  optimistic?: boolean
}

interface ConversationMeta {
  otherUserId: string
  otherUserName: string
  otherUserAvatar?: string
  isPreBooking: boolean
  preMsgCount: number
  preMsgLimit: number
}

let nextOptimisticId = 1

export default function ChatConversationScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const flatListRef = useRef<FlatList>(null)

  const [meta, setMeta] = useState<ConversationMeta | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [meId, setMeId] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!id) return
    try {
      const [meRes, convRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch(`/api/messages/${id}`),
      ])
      if (meRes.ok) {
        const me = await meRes.json()
        setMeId(me.id)
      }
      if (!convRes.ok) {
        const body = await convRes.json().catch(() => ({}))
        throw new Error(body.message || 'Failed to load conversation')
      }
      const json = await convRes.json()
      setMeta(json.meta ?? null)
      setMessages(json.messages ?? [])
      setError(null)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    }
  }, [id])

  const load = useCallback(async () => {
    setLoading(true)
    await fetchMessages()
    setLoading(false)
  }, [fetchMessages])

  useEffect(() => { load() }, [load])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
    }
  }, [messages.length])

  const send = async () => {
    const content = text.trim()
    if (!content || sending || !id) return
    if (content.length > 2000) return

    setText('')
    setSending(true)

    const optimisticId = `opt-${nextOptimisticId++}`
    const optimistic: Message = {
      id: optimisticId,
      senderId: meId ?? 'me',
      content,
      createdAt: new Date().toISOString(),
      optimistic: true,
    }
    setMessages(prev => [...prev, optimistic])

    try {
      const res = await fetch(`/api/messages/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      if (!res.ok) {
        // remove optimistic, restore text
        setMessages(prev => prev.filter(m => m.id !== optimisticId))
        setText(content)
      } else {
        const sent: Message = await res.json()
        setMessages(prev => prev.map(m => m.id === optimisticId ? sent : m))
      }
    } catch {
      setMessages(prev => prev.filter(m => m.id !== optimisticId))
      setText(content)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, paddingTop: insets.top }}>
        <LoadingState message="Loading conversation..." />
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

  const atLimit = meta?.isPreBooking && (meta.preMsgCount ?? 0) >= (meta.preMsgLimit ?? 5)

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={insets.bottom}
    >
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-white border-b border-[#F0E6EA] flex-row items-center px-4 py-3"
      >
        <Pressable onPress={() => router.back()} className="mr-3 p-1" accessibilityLabel="Go back">
          <FontAwesome name="arrow-left" size={18} color={colors.text} />
        </Pressable>
        <Avatar uri={meta?.otherUserAvatar} name={meta?.otherUserName} size="sm" />
        <View className="ml-2 flex-1">
          <Text className="text-base font-bold text-[#201317]" numberOfLines={1}>
            {meta?.otherUserName ?? '...'}
          </Text>
          {meta?.isPreBooking && (
            <Text className="text-xs text-[#81656E]">
              Pre-booking · {meta.preMsgCount}/{meta.preMsgLimit} messages
            </Text>
          )}
        </View>
      </View>

      {/* Pre-booking limit banner */}
      {atLimit && (
        <View className="bg-[#FEF3C7] px-4 py-2 flex-row items-center" style={{ gap: 8 }}>
          <FontAwesome name="exclamation-triangle" size={14} color={colors.warning} />
          <Text className="text-sm text-[#92400E] flex-1">
            Book a date to continue chatting
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16, gap: 8, paddingBottom: 8 }}
        ListEmptyComponent={
          <View className="items-center justify-center py-12">
            <Text className="text-base text-[#81656E]">No messages yet. Say hi!</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isOwn = item.senderId === meId
          return (
            <View className={`flex-row ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <View
                style={{
                  maxWidth: '75%',
                  backgroundColor: isOwn ? colors.primary : '#F0E6EA',
                  borderRadius: 16,
                  borderBottomRightRadius: isOwn ? 4 : 16,
                  borderBottomLeftRadius: isOwn ? 16 : 4,
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  opacity: item.optimistic ? 0.7 : 1,
                }}
              >
                <Text style={{ color: isOwn ? '#fff' : colors.text, fontSize: 15, lineHeight: 21 }}>
                  {item.content}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: isOwn ? 'rgba(255,255,255,0.7)' : colors.textSecondary,
                    marginTop: 3,
                    textAlign: 'right',
                  }}
                >
                  {new Date(item.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>
          )
        }}
      />

      {/* Composer */}
      <View
        style={{ paddingBottom: insets.bottom + 8 }}
        className="bg-white border-t border-[#F0E6EA] flex-row items-end px-4 pt-3 pb-3"
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={atLimit ? 'Book a date to continue' : 'Type a message...'}
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={2000}
          editable={!atLimit}
          style={{
            flex: 1,
            backgroundColor: colors.background,
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 10,
            fontSize: 15,
            color: colors.text,
            maxHeight: 120,
            marginRight: 8,
          }}
          accessibilityLabel="Message input"
        />
        <Pressable
          onPress={send}
          disabled={!text.trim() || sending || atLimit}
          accessibilityLabel="Send message"
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: !text.trim() || sending || atLimit ? '#D1C4CA' : colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FontAwesome name="send" size={16} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}
