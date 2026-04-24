import { useEffect } from 'react'
import { Stack, useRouter } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'

export default function AdminLayout() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user?.role !== 'ADMIN') {
      router.replace('/')
    }
  }, [user, isLoading, router])

  if (isLoading) return null
  if (user?.role !== 'ADMIN') return null

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#C52660' },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontFamily: 'PlusJakartaSans-SemiBold' },
        headerBackVisible: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Admin Dashboard', headerBackVisible: false }}
      />
      <Stack.Screen name="users" options={{ title: 'Users' }} />
      <Stack.Screen name="verifications" options={{ title: 'Verifications' }} />
      <Stack.Screen name="bookings" options={{ title: 'Bookings' }} />
      <Stack.Screen name="disputes" options={{ title: 'Disputes' }} />
      <Stack.Screen name="cities" options={{ title: 'Cities' }} />
    </Stack>
  )
}
