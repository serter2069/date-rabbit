import { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  useWindowDimensions,
  RefreshControl,
  Alert,
} from 'react-native'
import { router } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Avatar, Badge, Card, LoadingState, EmptyState, ErrorState, Button } from '@/components/ui'
import { colors } from '@/lib/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

interface FavoriteCompanion {
  id: string
  companionId: string
  name: string
  age: number
  city: string
  hourlyRate: number
  rating: number
  reviewCount: number
  isOnline: boolean
  avatarUrl?: string
}

interface FavoritesResponse {
  data: FavoriteCompanion[]
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FontAwesome
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-o'}
          size={11}
          color={s <= Math.round(rating) ? '#D97706' : '#E6D5DC'}
        />
      ))}
    </View>
  )
}

function FavoriteCard({
  item,
  onRemove,
  onPress,
}: {
  item: FavoriteCompanion
  onRemove: () => void
  onPress: () => void
}) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Card variant="outlined" padding="sm">
        <View style={{ position: 'relative', alignSelf: 'center' }}>
          <Avatar uri={item.avatarUrl} name={item.name} size="xl" />
          {item.isOnline && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: '#059669',
                borderWidth: 2,
                borderColor: '#FFFFFF',
              }}
            />
          )}
          {/* Remove button */}
          <Pressable
            onPress={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              width: 26,
              height: 26,
              borderRadius: 13,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.12,
              shadowRadius: 2,
              elevation: 2,
            }}
          >
            <FontAwesome name="heart" size={13} color="#C52660" />
          </Pressable>
        </View>
        <View style={{ marginTop: 8 }}>
          <Text
            style={{ fontSize: 13, fontWeight: '600', color: '#201317' }}
            numberOfLines={1}
          >
            {item.name}, {item.age}
          </Text>
          <Text style={{ fontSize: 12, color: '#81656E', marginTop: 2 }} numberOfLines={1}>
            {item.city}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: '#C52660', marginTop: 4 }}>
            ${item.hourlyRate}/hr
          </Text>
          <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <StarRating rating={item.rating} />
            <Text style={{ fontSize: 11, color: '#81656E' }}>({item.reviewCount})</Text>
          </View>
          {item.isOnline && (
            <View style={{ marginTop: 6 }}>
              <Badge label="Online" variant="success" />
            </View>
          )}
        </View>
      </Card>
    </Pressable>
  )
}

export default function FavoritesScreen() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024
  const numCols = isDesktop ? 3 : 2

  const [favorites, setFavorites] = useState<FavoriteCompanion[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchFavorites = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/favorites`)
      if (!res.ok) throw new Error('Failed to load favorites')
      const json: FavoritesResponse = await res.json()
      setFavorites(json.data)
    } catch {
      setError('Could not load favorites. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchFavorites(false)
  }, [fetchFavorites])

  const handleRemove = useCallback(
    (companionId: string, name: string) => {
      Alert.alert(
        'Remove Favorite',
        `Remove ${name} from your favorites?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: async () => {
              // Optimistic update
              setFavorites((prev) => prev.filter((f) => f.companionId !== companionId))
              try {
                await fetch(`${API_URL}/api/favorites/${companionId}`, { method: 'DELETE' })
              } catch {
                // Revert on error
                fetchFavorites(false)
              }
            },
          },
        ],
      )
    },
    [fetchFavorites],
  )

  return (
    <View style={{ flex: 1, backgroundColor: '#FBF9FA' }}>
      {loading ? (
        <LoadingState message="Loading favorites..." />
      ) : error ? (
        <ErrorState
          title="Could not load"
          message={error}
          onRetry={() => fetchFavorites(false)}
        />
      ) : favorites.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          message="Save companions you love to find them quickly"
          actionLabel="Browse Companions"
          onAction={() => router.push('/(tabs)/male/browse' as never)}
        />
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          numColumns={numCols}
          key={String(numCols)}
          contentContainerStyle={{
            padding: 12,
            ...(isDesktop ? { maxWidth: 1152, alignSelf: 'center', width: '100%' } : {}),
          }}
          columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchFavorites(true)}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <FavoriteCard
              item={item}
              onPress={() => router.push(`/profile/${item.companionId}` as never)}
              onRemove={() => handleRemove(item.companionId, item.name)}
            />
          )}
        />
      )}
    </View>
  )
}
