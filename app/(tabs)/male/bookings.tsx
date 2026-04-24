import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import { Avatar, Badge, Card, LoadingState, EmptyState, ErrorState, Button } from '@/components/ui'
import { colors } from '@/lib/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

type BookingStatus = 'upcoming' | 'pending' | 'completed' | 'cancelled'

interface Booking {
  id: string
  companionId: string
  companionName: string
  companionAvatarUrl?: string
  date: string
  duration: number
  status: BookingStatus
  location: string
  hasReview: boolean
}

interface BookingsResponse {
  data: Booking[]
  total: number
}

type FilterTab = 'upcoming' | 'pending' | 'completed' | 'all'

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'pending', label: 'Pending' },
  { key: 'completed', label: 'Completed' },
  { key: 'all', label: 'All' },
]

const STATUS_VARIANT: Record<BookingStatus, 'success' | 'warning' | 'neutral' | 'error'> = {
  upcoming: 'success',
  pending: 'warning',
  completed: 'neutral',
  cancelled: 'error',
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function BookingCard({ booking }: { booking: Booking }) {
  return (
    <Card variant="outlined" padding="md">
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
        <Pressable onPress={() => router.push(`/profile/${booking.companionId}` as never)}>
          <Avatar uri={booking.companionAvatarUrl} name={booking.companionName} size="md" />
        </Pressable>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#201317' }}>
              {booking.companionName}
            </Text>
            <Badge label={booking.status} variant={STATUS_VARIANT[booking.status]} />
          </View>
          <Text style={{ fontSize: 13, color: '#81656E' }}>{formatDate(booking.date)}</Text>
          <Text style={{ fontSize: 13, color: '#81656E' }}>
            {booking.duration}h • {booking.location}
          </Text>
          {booking.status === 'completed' && !booking.hasReview && (
            <View style={{ marginTop: 8 }}>
              <Button
                label="Write Review"
                variant="secondary"
                size="sm"
                onPress={() =>
                  router.push(`/reviews/new?bookingId=${booking.id}` as never)
                }
              />
            </View>
          )}
        </View>
      </View>
    </Card>
  )
}

export default function BookingsScreen() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024

  const [activeTab, setActiveTab] = useState<FilterTab>('upcoming')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ filter: activeTab, page: '1', limit: '50' })
      const res = await fetch(`${API_URL}/api/bookings?${params}`)
      if (!res.ok) throw new Error('Failed to load bookings')
      const json: BookingsResponse = await res.json()
      setBookings(json.data)
    } catch {
      setError('Could not load bookings. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchBookings(false)
  }, [fetchBookings])

  const containerStyle = isDesktop
    ? { maxWidth: 768, alignSelf: 'center' as const, width: '100%' as const }
    : {}

  return (
    <View style={{ flex: 1, backgroundColor: '#FBF9FA' }}>
      {/* Filter tabs */}
      <View style={[{ backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F0E6EA' }, containerStyle]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 4 }}
        >
          {TABS.map((tab) => {
            const active = tab.key === activeTab
            return (
              <Pressable
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderBottomWidth: 2,
                  borderBottomColor: active ? '#C52660' : 'transparent',
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: active ? '700' : '500',
                    color: active ? '#C52660' : '#81656E',
                  }}
                >
                  {tab.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
      </View>

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading bookings..." />
      ) : error ? (
        <ErrorState
          title="Could not load"
          message={error}
          onRetry={() => fetchBookings(false)}
        />
      ) : bookings.length === 0 ? (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBookings(true)}
              tintColor={colors.primary}
            />
          }
        >
          <EmptyState
            title={`No ${activeTab === 'all' ? '' : activeTab} bookings`}
            message={
              activeTab === 'upcoming'
                ? 'Your upcoming dates will appear here'
                : 'Nothing here yet'
            }
            actionLabel={activeTab !== 'upcoming' ? undefined : 'Browse Companions'}
            onAction={
              activeTab === 'upcoming'
                ? () => router.push('/(tabs)/male/browse' as never)
                : undefined
            }
          />
        </ScrollView>
      ) : (
        <ScrollView
          contentContainerStyle={[
            { padding: 16, gap: 12 },
            containerStyle,
          ]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBookings(true)}
              tintColor={colors.primary}
            />
          }
        >
          {bookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </ScrollView>
      )}
    </View>
  )
}
