import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Pressable, ScrollView, Switch, Text, useWindowDimensions, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { colors } from '@/lib/theme'
import { useAuth } from '@/contexts/AuthContext'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

interface UserMe {
  id: string
  email: string
  name: string | null
  role: string
}

function SettingRow({
  icon,
  label,
  rightElement,
  onPress,
  destructive,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name']
  label: string
  rightElement?: React.ReactNode
  onPress?: () => void
  destructive?: boolean
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityLabel={label}
      className="flex-row items-center px-4 py-4 border-b border-[#F0E6EA] active:bg-[#F5DDE5]"
    >
      <View className="w-9 h-9 rounded-lg bg-[#F5DDE5] items-center justify-center">
        <FontAwesome name={icon} size={15} color={destructive ? colors.error : colors.primary} />
      </View>
      <Text
        className={`flex-1 ml-3 text-base ${destructive ? 'text-[#DC2626]' : 'text-[#201317]'}`}
      >
        {label}
      </Text>
      {rightElement !== undefined
        ? rightElement
        : <FontAwesome name="chevron-right" size={12} color="#D1C0C8" />
      }
    </Pressable>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold text-[#81656E] uppercase tracking-wide px-4 pt-6 pb-2">
      {title}
    </Text>
  )
}

export default function SettingsScreen() {
  const { width } = useWindowDimensions()
  const router = useRouter()
  const { signOut, token } = useAuth()
  const [pushEnabled, setPushEnabled] = useState(true)
  const [user, setUser] = useState<UserMe | null>(null)
  const [deletingAccount, setDeletingAccount] = useState(false)
  const [loadingProfile, setLoadingProfile] = useState(true)

  const fetchMe = useCallback(async () => {
    if (!token) { setLoadingProfile(false); return }
    try {
      const res = await fetch(`${API_URL}/api/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data: UserMe = await res.json()
        setUser(data)
      }
    } catch {
      // non-critical, ignore
    } finally {
      setLoadingProfile(false)
    }
  }, [token])

  useEffect(() => { fetchMe() }, [fetchMe])

  const handleLogOut = useCallback(async () => {
    await signOut()
    router.replace('/(auth)/welcome')
  }, [signOut, router])

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!token) return
            setDeletingAccount(true)
            try {
              const res = await fetch(`${API_URL}/api/users/me`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
              })
              if (res.ok) {
                await signOut()
                router.replace('/(auth)/welcome')
              } else {
                Alert.alert('Error', 'Failed to delete account. Please try again.')
              }
            } catch {
              Alert.alert('Error', 'Something went wrong. Please try again.')
            } finally {
              setDeletingAccount(false)
            }
          },
        },
      ]
    )
  }, [token, signOut, router])

  const isCompanion = user?.role === 'COMPANION'

  if (loadingProfile) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#C52660" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32, maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
        {/* Header */}
        <View className="flex-row items-center px-4 pt-2 pb-4 border-b border-[#F0E6EA] bg-white">
          <Pressable onPress={() => router.back()} className="mr-3" accessibilityLabel="Go back">
            <FontAwesome name="arrow-left" size={18} color={colors.text} />
          </Pressable>
          <Text className="text-2xl font-bold text-[#201317]">Settings</Text>
        </View>

        {/* Profile section */}
        <SectionTitle title="Profile" />
        <SettingRow
          icon="user"
          label="Edit Profile"
          // TODO: navigate to /profile/edit when screen is built
          onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon')}
        />
        <SettingRow
          icon="bell"
          label="Push Notifications"
          rightElement={
            <Switch
              value={pushEnabled}
              onValueChange={setPushEnabled}
              trackColor={{ true: colors.primary }}
            />
          }
        />

        {/* Account section */}
        <SectionTitle title="Account" />
        <SettingRow
          icon="ban"
          label="Blocked Users"
          // TODO: navigate to /blocked when screen is built
          onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon')}
        />
        <SettingRow
          icon="envelope"
          label="Change Email"
          // TODO: navigate to /profile/change-email when screen is built
          onPress={() => Alert.alert('Coming Soon', 'This feature is coming soon')}
        />

        {/* Companion-only section */}
        {isCompanion && (
          <>
            <SectionTitle title="Earnings" />
            <SettingRow
              icon="credit-card"
              label="Connect Bank Account"
              onPress={() => router.push('/stripe-connect' as never)}
            />
          </>
        )}

        {__DEV__ && (
          <>
            <SectionTitle title="Developer" />
            <SettingRow
              icon="paint-brush"
              label="Design System"
              onPress={() => router.push('/brand' as never)}
              rightElement={null}
            />
          </>
        )}

        {/* Danger zone */}
        <SectionTitle title="Danger Zone" />
        <SettingRow
          icon="sign-out"
          label="Log Out"
          onPress={handleLogOut}
          destructive
          rightElement={null}
        />
        <SettingRow
          icon="trash"
          label={deletingAccount ? 'Deleting…' : 'Delete Account'}
          onPress={deletingAccount ? undefined : handleDeleteAccount}
          destructive
          rightElement={null}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
