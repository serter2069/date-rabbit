import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useAuth } from '@/contexts/AuthContext'
import { Badge } from '@/components/ui'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

type Role = 'ALL' | 'SEEKER' | 'COMPANION' | 'ADMIN'

interface AdminUser {
  id: string
  email: string
  name: string | null
  avatar: string | null
  role: string
  isVerified: boolean
  isBanned: boolean
  createdAt: string
}

const ROLE_TABS: Role[] = ['ALL', 'SEEKER', 'COMPANION', 'ADMIN']

function roleBadgeVariant(role: string): 'primary' | 'success' | 'warning' | 'neutral' {
  if (role === 'ADMIN') return 'warning'
  if (role === 'COMPANION') return 'success'
  if (role === 'SEEKER') return 'primary'
  return 'neutral'
}

function UserRow({ user, token, onAction }: { user: AdminUser; token: string | null; onAction: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [actioning, setActioning] = useState(false)

  async function toggleBan() {
    try {
      setActioning(true)
      const endpoint = user.isBanned ? 'unban' : 'ban'
      await fetch(`${API_URL}/api/admin/users/${user.id}/${endpoint}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      onAction()
    } catch (err) {
      console.error(err)
    } finally {
      setActioning(false)
    }
  }

  return (
    <Pressable
      onPress={() => setExpanded((v) => !v)}
      className="bg-white border-b border-[#F0E6EA] px-4 py-3 active:bg-[#FBF9FA]"
    >
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-[#FCE7EF] items-center justify-center">
          <Text className="text-[#C52660] font-bold text-base">
            {(user.name ?? user.email)[0].toUpperCase()}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-[#201317]">{user.name ?? '—'}</Text>
          <Text className="text-xs text-[#81656E]">{user.email}</Text>
        </View>
        <View className="gap-1 items-end">
          <Badge label={user.role} variant={roleBadgeVariant(user.role)} />
          {user.isVerified && <Badge label="Verified" variant="success" />}
          {user.isBanned && <Badge label="Banned" variant="error" />}
        </View>
      </View>

      {expanded && (
        <View className="mt-3 pt-3 border-t border-[#F0E6EA] flex-row items-center justify-between">
          <Text className="text-xs text-[#81656E]">
            Joined {new Date(user.createdAt).toLocaleDateString()}
          </Text>
          <Pressable
            onPress={toggleBan}
            disabled={actioning}
            className={`px-4 py-2 rounded-lg ${user.isBanned ? 'bg-[#059669]' : 'bg-[#DC2626]'} active:opacity-80`}
          >
            {actioning ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text className="text-white text-sm font-semibold">
                {user.isBanned ? 'Unban' : 'Ban'}
              </Text>
            )}
          </Pressable>
        </View>
      )}
    </Pressable>
  )
}

export default function AdminUsers() {
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [roleTab, setRoleTab] = useState<Role>('ALL')
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(
    async (nextPage = 1, append = false) => {
      try {
        if (nextPage === 1) setLoading(true)
        else setLoadingMore(true)
        setError(null)

        const params = new URLSearchParams({
          page: String(nextPage),
          limit: '20',
          ...(search ? { search } : {}),
          ...(roleTab !== 'ALL' ? { role: roleTab } : {}),
        })

        const res = await fetch(`${API_URL}/api/admin/users?${params}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        setTotal(data.total)
        setUsers((prev) => (append ? [...prev, ...data.users] : data.users))
        setPage(nextPage)
      } catch (err) {
        setError('Failed to load users')
        console.error(err)
      } finally {
        setLoading(false)
        setLoadingMore(false)
      }
    },
    [token, search, roleTab]
  )

  useEffect(() => {
    fetchUsers(1)
  }, [fetchUsers])

  function loadMore() {
    if (loadingMore || users.length >= total) return
    fetchUsers(page + 1, true)
  }

  return (
    <View className="flex-1 bg-[#FBF9FA]">
      {/* Search */}
      <View className="px-4 pt-3 pb-2 bg-[#FBF9FA]">
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search name or email…"
          placeholderTextColor="#81656E"
          className="bg-white border border-[#F0E6EA] rounded-xl px-4 py-2.5 text-sm text-[#201317]"
          returnKeyType="search"
          onSubmitEditing={() => fetchUsers(1)}
        />
      </View>

      {/* Role tabs */}
      <View className="flex-row px-4 pb-2 gap-2">
        {ROLE_TABS.map((r) => (
          <Pressable
            key={r}
            onPress={() => setRoleTab(r)}
            className={`px-3 py-1.5 rounded-full border ${
              roleTab === r
                ? 'bg-[#C52660] border-[#C52660]'
                : 'bg-white border-[#F0E6EA]'
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                roleTab === r ? 'text-white' : 'text-[#81656E]'
              }`}
            >
              {r}
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
      ) : users.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-[#81656E]">No users found</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(u) => u.id}
          renderItem={({ item }) => (
            <UserRow user={item} token={token} onAction={() => fetchUsers(1)} />
          )}
          onEndReached={loadMore}
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
          {users.length} of {total} users
        </Text>
      </View>
    </View>
  )
}
