import { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  Image,
} from 'react-native'
import { useLocalSearchParams, router } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Avatar, Badge, Card, Button, LoadingState, ErrorState } from '@/components/ui'
import { colors } from '@/lib/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

interface Review {
  id: string
  seekerName: string
  seekerAvatarUrl?: string
  rating: number
  comment: string
  createdAt: string
}

interface CompanionProfile {
  id: string
  name: string
  age: number
  city: string
  hourlyRate: number
  isOnline: boolean
  bio?: string
  photos?: string[]
  avatarUrl?: string
  rating: number
  reviewCount: number
  isVerified: boolean
  recentReviews?: Review[]
}

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FontAwesome
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-o'}
          size={size}
          color={s <= Math.round(rating) ? '#D97706' : '#E6D5DC'}
        />
      ))}
    </View>
  )
}

function PhotoGallery({ photos, name, avatarUrl }: { photos?: string[]; name: string; avatarUrl?: string }) {
  const images = photos?.length ? photos : avatarUrl ? [avatarUrl] : []

  if (images.length === 0) {
    return (
      <View
        style={{
          height: 280,
          backgroundColor: '#F5DDE5',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <FontAwesome name="user" size={64} color="#C52660" />
      </View>
    )
  }

  return (
    <ScrollView
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      style={{ height: 320 }}
    >
      {images.map((uri, i) => (
        <Image
          key={i}
          source={{ uri }}
          style={{ width: 400, height: 320, resizeMode: 'cover' }}
        />
      ))}
    </ScrollView>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Avatar uri={review.seekerAvatarUrl} name={review.seekerName} size="sm" />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#201317' }}>
            {review.seekerName}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <StarRating rating={review.rating} size={11} />
            <Text style={{ fontSize: 12, color: '#81656E' }}>{date}</Text>
          </View>
        </View>
      </View>
      {review.comment && (
        <Text style={{ fontSize: 14, color: '#201317', lineHeight: 20 }}>
          {review.comment}
        </Text>
      )}
    </View>
  )
}

export default function CompanionProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024

  const [companion, setCompanion] = useState<CompanionProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetchCompanion = async () => {
      setLoading(true)
      setError(null)
      setNotFound(false)
      try {
        const res = await fetch(`${API_URL}/api/companions/${id}`)
        if (res.status === 404) {
          setNotFound(true)
          return
        }
        if (!res.ok) throw new Error('Failed to load companion')
        const json: CompanionProfile = await res.json()
        setCompanion(json)
      } catch {
        setError('Could not load profile. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchCompanion()
  }, [id])

  if (loading) return <LoadingState message="Loading profile..." />

  if (notFound) {
    return (
      <ErrorState
        title="Profile not found"
        message="This companion profile does not exist or is no longer available."
        onRetry={() => router.back()}
      />
    )
  }

  if (error || !companion) {
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
  }

  const containerStyle = isDesktop
    ? { maxWidth: 768, alignSelf: 'center' as const, width: '100%' as const }
    : {}

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FBF9FA' }} edges={['bottom']}>
      {/* Back button */}
      <Pressable
        onPress={() => router.back()}
        style={{
          position: 'absolute',
          top: 16,
          left: 16,
          zIndex: 10,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: 'rgba(255,255,255,0.92)',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.12,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <FontAwesome name="chevron-left" size={14} color="#201317" />
      </Pressable>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Photo gallery */}
        <PhotoGallery
          photos={companion.photos}
          name={companion.name}
          avatarUrl={companion.avatarUrl}
        />

        <View style={[{ padding: 16, gap: 16 }, containerStyle]}>
          {/* Header info */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <View style={{ gap: 4 }}>
                <Text style={{ fontSize: 24, fontWeight: '700', color: '#201317' }}>
                  {companion.name}, {companion.age}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <FontAwesome name="map-marker" size={13} color={colors.textSecondary} />
                  <Text style={{ fontSize: 14, color: '#81656E' }}>{companion.city}</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 6 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#C52660' }}>
                  ${companion.hourlyRate}/hr
                </Text>
                {companion.isOnline && <Badge label="Online now" variant="success" />}
              </View>
            </View>

            {companion.isVerified && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <FontAwesome name="check-circle" size={14} color="#059669" />
                <Text style={{ fontSize: 13, color: '#059669', fontWeight: '600' }}>
                  ID Verified
                </Text>
              </View>
            )}
          </View>

          {/* Rating summary */}
          <Card variant="outlined" padding="md">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Text style={{ fontSize: 36, fontWeight: '800', color: '#201317' }}>
                {companion.rating.toFixed(1)}
              </Text>
              <View style={{ gap: 4 }}>
                <StarRating rating={companion.rating} size={16} />
                <Text style={{ fontSize: 13, color: '#81656E' }}>
                  {companion.reviewCount} {companion.reviewCount === 1 ? 'review' : 'reviews'}
                </Text>
              </View>
            </View>
          </Card>

          {/* Bio */}
          {companion.bio && (
            <Card variant="outlined" padding="md">
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#201317', marginBottom: 8 }}>
                About
              </Text>
              <Text style={{ fontSize: 14, color: '#201317', lineHeight: 22 }}>
                {companion.bio}
              </Text>
            </Card>
          )}

          {/* Reviews */}
          {companion.recentReviews && companion.recentReviews.length > 0 && (
            <Card variant="outlined" padding="md">
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#201317', marginBottom: 12 }}>
                Recent Reviews
              </Text>
              <View style={{ gap: 16 }}>
                {companion.recentReviews.map((review, i) => (
                  <View key={review.id}>
                    {i > 0 && (
                      <View
                        style={{ height: 1, backgroundColor: '#F0E6EA', marginBottom: 16 }}
                      />
                    )}
                    <ReviewCard review={review} />
                  </View>
                ))}
              </View>
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F0E6EA',
          padding: 16,
          paddingBottom: 24,
          flexDirection: 'row',
          gap: 12,
          ...(isDesktop
            ? { maxWidth: 768, alignSelf: 'center' as const, width: '100%' as const }
            : {}),
        }}
      >
        <View style={{ flex: 1 }}>
          <Button
            label="Message"
            variant="secondary"
            size="lg"
            fullWidth
            onPress={() =>
              router.push(`/chat/${companion.id}` as never)
            }
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            label="Book Now"
            variant="primary"
            size="lg"
            fullWidth
            onPress={() =>
              router.push(`/booking/${companion.id}` as never)
            }
          />
        </View>
      </View>
    </SafeAreaView>
  )
}
