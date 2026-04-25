import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  useWindowDimensions,
} from 'react-native'
import { router } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Avatar, Badge, Card, LoadingState, ErrorState, Button } from '@/components/ui'
import { colors } from '@/lib/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

interface UserProfile {
  id: string
  name: string
  email: string
  city?: string
  avatarUrl?: string
  isVerified: boolean
  role: string
}

interface LinkItem {
  label: string
  icon: React.ComponentProps<typeof FontAwesome>['name']
  onPress: () => void
  danger?: boolean
}

export default function MaleProfileScreen() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024

  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_URL}/api/users/me`)
        if (!res.ok) throw new Error('Failed to load profile')
        const json: UserProfile = await res.json()
        setUser(json)
      } catch {
        setError('Could not load profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/api/auth/logout`, { method: 'POST' })
            } catch {
              // best-effort
            }
            router.replace('/(auth)/email' as never)
          },
        },
      ],
    )
  }

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and all your data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await fetch(`${API_URL}/api/users/me`, { method: 'DELETE' })
              router.replace('/(auth)/email' as never)
            } catch {
              Alert.alert('Error', 'Could not delete account. Please try again.')
            }
          },
        },
      ],
    )
  }

  const quickLinks: LinkItem[] = [
    {
      label: 'Settings',
      icon: 'cog',
      onPress: () => router.push('/settings' as never),
    },
    {
      label: 'My Bookings',
      icon: 'calendar',
      onPress: () => router.push('/(tabs)/male/bookings' as never),
    },
    {
      label: 'Help & Support',
      icon: 'question-circle',
      onPress: () => {},
    },
    ...(user?.role === 'ADMIN' ? [{
      label: 'Admin Panel',
      icon: 'shield' as React.ComponentProps<typeof FontAwesome>['name'],
      onPress: () => router.push('/admin' as never),
    }] : []),
  ]

  const containerStyle = isDesktop
    ? { maxWidth: 600, alignSelf: 'center' as const, width: '100%' as const }
    : {}

  if (loading) return <LoadingState message="Loading profile..." />
  if (error || !user)
    return (
      <ErrorState
        title="Could not load"
        message={error ?? 'Unknown error'}
        onRetry={() => {
          setLoading(true)
          setError(null)
        }}
      />
    )

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[{ padding: 16, gap: 16 }, containerStyle]}
    >
      {/* Profile card */}
      <Card variant="elevated" padding="lg">
        <View style={{ alignItems: 'center', gap: 12 }}>
          <Avatar uri={user.avatarUrl} name={user.name} size="xl" />
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 20, fontWeight: '700', color: colors.text }}>
              {user.name}
            </Text>
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>{user.email}</Text>
            {user.city && (
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>{user.city}</Text>
            )}
            {user.isVerified && (
              <Badge label="Verified" variant="success" />
            )}
          </View>
        </View>
      </Card>

      {/* Quick links — static list, no empty state */}
      <Card variant="outlined" padding="sm">
        {quickLinks.map((link, i) => (
          <View key={link.label}>
            {i > 0 && (
              <View style={{ height: 1, backgroundColor: '#F0E6EA', marginHorizontal: 4 }} />
            )}
            <Pressable
              onPress={link.onPress}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingHorizontal: 12,
                paddingVertical: 14,
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: '#FCE7EF',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FontAwesome name={link.icon} size={16} color={colors.primary} />
              </View>
              <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: colors.text }}>
                {link.label}
              </Text>
              <FontAwesome name="chevron-right" size={12} color={colors.textSecondary} />
            </Pressable>
          </View>
        ))}
      </Card>

      {/* Log out */}
      <Button
        label="Log Out"
        variant="secondary"
        size="lg"
        fullWidth
        onPress={handleLogout}
      />

      {/* Danger zone */}
      <View style={{ marginTop: 8 }}>
        <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 8, textAlign: 'center' }}>
          DANGER ZONE
        </Text>
        <Pressable
          onPress={handleDeleteAccount}
          style={{
            paddingVertical: 14,
            alignItems: 'center',
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#FEE2E2',
            backgroundColor: '#FEF2F2',
          }}
        >
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.error }}>
            Delete Account
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}
