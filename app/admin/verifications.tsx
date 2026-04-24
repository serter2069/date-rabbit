import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

type StatusTab = 'PENDING' | 'APPROVED' | 'REJECTED'

interface VerificationUser {
  id: string
  email: string
  name: string | null
  role: string
}

interface Verification {
  id: string
  type: string
  status: string
  documents: { urls?: string[] } | null
  createdAt: string
  user: VerificationUser
}

const STATUS_TABS: StatusTab[] = ['PENDING', 'APPROVED', 'REJECTED']

function VerificationCard({
  item,
  token,
  onUpdate,
}: {
  item: Verification
  token: string | null
  onUpdate: (id: string) => void
}) {
  const [actioning, setActioning] = useState<null | 'approve' | 'reject'>(null)

  async function approve() {
    try {
      setActioning('approve')
      const res = await fetch(`${API_URL}/api/admin/verifications/${item.id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) onUpdate(item.id)
    } catch (err) {
      console.error(err)
    } finally {
      setActioning(null)
    }
  }

  function promptReject() {
    Alert.prompt(
      'Reject Verification',
      'Enter rejection reason:',
      async (reason) => {
        if (reason === null) return
        try {
          setActioning('reject')
          const res = await fetch(`${API_URL}/api/admin/verifications/${item.id}/reject`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reason }),
          })
          if (res.ok) onUpdate(item.id)
        } catch (err) {
          console.error(err)
        } finally {
          setActioning(null)
        }
      },
      'plain-text'
    )
  }

  const docs: string[] = item.documents?.urls ?? []

  return (
    <View className="bg-white mx-4 mb-3 rounded-2xl border border-[#F0E6EA] p-4">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-sm font-semibold text-[#201317]">{item.user.name ?? '—'}</Text>
          <Text className="text-xs text-[#81656E]">{item.user.email}</Text>
          <Text className="text-xs text-[#81656E] mt-0.5">
            Submitted {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View className="gap-1 items-end">
          <Badge label={item.type} variant="primary" />
          <Badge label={item.status} variant={item.status === 'PENDING' ? 'warning' : item.status === 'APPROVED' ? 'success' : 'error'} />
        </View>
      </View>

      {/* Document thumbnails */}
      {docs.length > 0 && (
        <View className="flex-row gap-2 mb-3 flex-wrap">
          {docs.map((url, i) => (
            <Image
              key={i}
              source={{ uri: url }}
              className="w-20 h-20 rounded-lg bg-[#F5EEF0]"
              resizeMode="cover"
            />
          ))}
        </View>
      )}

      {/* Actions — only for pending */}
      {item.status === 'PENDING' && (
        <View className="flex-row gap-2 mt-2">
          <Pressable
            onPress={approve}
            disabled={actioning !== null}
            className="flex-1 bg-[#059669] rounded-xl py-2.5 items-center active:opacity-80"
          >
            {actioning === 'approve' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white text-sm font-semibold">Approve</Text>
            )}
          </Pressable>
          <Pressable
            onPress={promptReject}
            disabled={actioning !== null}
            className="flex-1 bg-[#DC2626] rounded-xl py-2.5 items-center active:opacity-80"
          >
            {actioning === 'reject' ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white text-sm font-semibold">Reject</Text>
            )}
          </Pressable>
        </View>
      )}
    </View>
  )
}

export default function AdminVerifications() {
  const { token } = useAuth()
  const [tab, setTab] = useState<StatusTab>('PENDING')
  const [verifications, setVerifications] = useState<Verification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchVerifications = useCallback(
    async (status: StatusTab) => {
      try {
        setLoading(true)
        setError(null)
        const res = await fetch(`${API_URL}/api/admin/verifications?status=${status}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        setVerifications(data.verifications)
      } catch (err) {
        setError('Failed to load verifications')
        console.error(err)
      } finally {
        setLoading(false)
      }
    },
    [token]
  )

  useEffect(() => {
    fetchVerifications(tab)
  }, [tab, fetchVerifications])

  function removeItem(id: string) {
    setVerifications((prev) => prev.filter((v) => v.id !== id))
  }

  return (
    <View className="flex-1 bg-[#FBF9FA]">
      {/* Tabs */}
      <View className="flex-row px-4 pt-3 pb-2 gap-2">
        {STATUS_TABS.map((s) => (
          <Pressable
            key={s}
            onPress={() => setTab(s)}
            className={`flex-1 py-2 rounded-full border items-center ${
              tab === s ? 'bg-[#C52660] border-[#C52660]' : 'bg-white border-[#F0E6EA]'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                tab === s ? 'text-white' : 'text-[#81656E]'
              }`}
            >
              {s}
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
      ) : verifications.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#81656E]">No {tab.toLowerCase()} verifications</Text>
        </View>
      ) : (
        <FlatList
          data={verifications}
          keyExtractor={(v) => v.id}
          contentContainerClassName="pt-2 pb-6"
          renderItem={({ item }) => (
            <VerificationCard item={item} token={token} onUpdate={removeItem} />
          )}
        />
      )}
    </View>
  )
}
