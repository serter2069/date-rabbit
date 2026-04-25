import { useState, useCallback, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  Pressable,
  useWindowDimensions,
  TextInput,
  RefreshControl,
} from 'react-native'
import { router } from 'expo-router'
import FontAwesome from '@expo/vector-icons/FontAwesome'
import { Avatar, Badge, Card, LoadingState, EmptyState, ErrorState, Button } from '@/components/ui'
import { colors } from '@/lib/theme'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3500'

interface Companion {
  id: string
  name: string
  age: number
  city: string
  hourlyRate: number
  rating: number
  reviewCount: number
  isOnline: boolean
  avatarUrl?: string
  photos?: string[]
}

interface PaginatedResponse {
  data: Companion[]
  total: number
  page: number
  limit: number
}

function StarRating({ rating }: { rating: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <FontAwesome
          key={s}
          name={s <= Math.round(rating) ? 'star' : 'star-o'}
          size={11}
          color={s <= Math.round(rating) ? colors.warning : '#E6D5DC'}
        />
      ))}
    </View>
  )
}

function CompanionCard({ item, onPress }: { item: Companion; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ flex: 1 }}>
      <Card variant="outlined" padding="sm">
        <View style={{ position: 'relative', alignSelf: 'center' }}>
          <Avatar
            uri={item.avatarUrl || (item.photos?.[0] ?? undefined)}
            name={item.name}
            size="xl"
          />
          {item.isOnline && (
            <View
              style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: colors.success,
                borderWidth: 2,
                borderColor: colors.surface,
              }}
            />
          )}
        </View>
        <View style={{ marginTop: 8 }}>
          <Text
            style={{ fontSize: 13, fontWeight: '600', color: colors.text }}
            numberOfLines={1}
          >
            {item.name}, {item.age}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }} numberOfLines={1}>
            {item.city}
          </Text>
          <Text style={{ fontSize: 12, fontWeight: '700', color: colors.primary, marginTop: 4 }}>
            ${item.hourlyRate}/hr
          </Text>
          <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <StarRating rating={item.rating} />
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>({item.reviewCount})</Text>
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

type FilterState = {
  city: string
  priceMin: string
  priceMax: string
  rating: number
}

const INITIAL_FILTERS: FilterState = { city: '', priceMin: '', priceMax: '', rating: 0 }

function FiltersPanel({
  filters,
  onChange,
  onClose,
}: {
  filters: FilterState
  onChange: (f: FilterState) => void
  onClose: () => void
}) {
  const [local, setLocal] = useState<FilterState>(filters)

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#F0E6EA',
      }}
    >
      <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: 12 }}>
        Filters
      </Text>
      <View style={{ gap: 10 }}>
        <TextInput
          style={{
            height: 44,
            borderRadius: 12,
            backgroundColor: colors.background,
            paddingHorizontal: 12,
            fontSize: 14,
            color: colors.text,
            borderWidth: 1,
            borderColor: '#E6D5DC',
          }}
          placeholder="City"
          placeholderTextColor={colors.textSecondary}
          value={local.city}
          onChangeText={(v) => setLocal((f) => ({ ...f, city: v }))}
        />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              backgroundColor: colors.background,
              paddingHorizontal: 12,
              fontSize: 14,
              color: colors.text,
              borderWidth: 1,
              borderColor: '#E6D5DC',
            }}
            placeholder="Min $"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={local.priceMin}
            onChangeText={(v) => setLocal((f) => ({ ...f, priceMin: v }))}
          />
          <TextInput
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              backgroundColor: colors.background,
              paddingHorizontal: 12,
              fontSize: 14,
              color: colors.text,
              borderWidth: 1,
              borderColor: '#E6D5DC',
            }}
            placeholder="Max $"
            placeholderTextColor={colors.textSecondary}
            keyboardType="numeric"
            value={local.priceMax}
            onChangeText={(v) => setLocal((f) => ({ ...f, priceMax: v }))}
          />
        </View>
        <View>
          <Text style={{ fontSize: 12, fontWeight: '600', color: colors.textSecondary, marginBottom: 8 }}>
            Min Rating
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[0, 1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                onPress={() => setLocal((f) => ({ ...f, rating: n }))}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 999,
                  borderWidth: 1,
                  backgroundColor: local.rating === n ? colors.primary : colors.surface,
                  borderColor: local.rating === n ? colors.primary : '#E6D5DC',
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '600',
                    color: local.rating === n ? colors.surface : colors.textSecondary,
                  }}
                >
                  {n === 0 ? 'Any' : `${n}+`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
          <View style={{ flex: 1 }}>
            <Button
              label="Clear"
              variant="secondary"
              size="sm"
              fullWidth
              onPress={() => setLocal(INITIAL_FILTERS)}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              label="Apply"
              variant="primary"
              size="sm"
              fullWidth
              onPress={() => {
                onChange(local)
                onClose()
              }}
            />
          </View>
        </View>
      </View>
    </View>
  )
}

export default function BrowseScreen() {
  const { width } = useWindowDimensions()
  const isDesktop = width >= 1024
  const numCols = isDesktop ? 3 : 2

  const [search, setSearch] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [companions, setCompanions] = useState<Companion[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)

  const fetchCompanions = useCallback(
    async (pageNum = 1, replace = true) => {
      if (pageNum === 1) {
        if (replace) setLoading(true)
        else setRefreshing(true)
      } else {
        setLoadingMore(true)
      }
      setError(null)

      try {
        const params = new URLSearchParams({
          page: String(pageNum),
          limit: '20',
          sort: 'lastSeen',
        })
        if (search.trim()) params.set('q', search.trim())
        if (filters.city) params.set('city', filters.city)
        if (filters.priceMin) params.set('priceMin', filters.priceMin)
        if (filters.priceMax) params.set('priceMax', filters.priceMax)
        if (filters.rating) params.set('rating', String(filters.rating))

        const res = await fetch(`${API_URL}/api/companions?${params}`)
        if (!res.ok) throw new Error('Failed to load companions')
        const json: PaginatedResponse = await res.json()
        if (replace) setCompanions(json.data)
        else setCompanions((prev) => [...prev, ...json.data])
        setHasMore(json.data.length === 20)
        setPage(pageNum)
      } catch {
        setError('Could not load companions. Please try again.')
      } finally {
        setLoading(false)
        setRefreshing(false)
        setLoadingMore(false)
      }
    },
    [search, filters],
  )

  useEffect(() => {
    fetchCompanions(1, true)
  }, [fetchCompanions])

  const handleRefresh = () => fetchCompanions(1, false)
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) fetchCompanions(page + 1, false)
  }

  const hasActiveFilters =
    Boolean(filters.city) || Boolean(filters.priceMin) || Boolean(filters.priceMax) || filters.rating > 0

  const containerStyle = isDesktop
    ? { maxWidth: 1152, alignSelf: 'center' as const, width: '100%' as const }
    : {}

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Search bar */}
      <View style={[{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }, containerStyle]}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: colors.surface,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: '#E6D5DC',
              paddingHorizontal: 12,
              height: 44,
            }}
          >
            <FontAwesome name="search" size={14} color={colors.textSecondary} />
            <TextInput
              style={{ flex: 1, marginLeft: 8, fontSize: 14, color: colors.text }}
              placeholder="Search companions..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => fetchCompanions(1, true)}
              returnKeyType="search"
            />
          </View>
          <Pressable
            onPress={() => setShowFilters((v) => !v)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              backgroundColor: hasActiveFilters ? colors.primary : colors.surface,
              borderColor: hasActiveFilters ? colors.primary : '#E6D5DC',
            }}
          >
            <FontAwesome
              name="sliders"
              size={16}
              color={hasActiveFilters ? '#FFFFFF' : colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {showFilters && (
        <View style={[{ paddingBottom: 12 }, containerStyle]}>
          <FiltersPanel
            filters={filters}
            onChange={(f) => {
              setFilters(f)
              setShowFilters(false)
            }}
            onClose={() => setShowFilters(false)}
          />
        </View>
      )}

      {/* Content */}
      {loading ? (
        <LoadingState message="Loading companions..." />
      ) : error ? (
        <ErrorState
          title="Could not load"
          message={error}
          onRetry={() => fetchCompanions(1, true)}
        />
      ) : companions.length === 0 ? (
        <EmptyState
          title="No companions found"
          message="Try adjusting your search or filters"
          actionLabel="Clear filters"
          onAction={() => {
            setFilters(INITIAL_FILTERS)
            setSearch('')
          }}
        />
      ) : (
        <FlatList
          data={companions}
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
              onRefresh={handleRefresh}
              tintColor={colors.primary}
            />
          }
          renderItem={({ item }) => (
            <CompanionCard
              item={item}
              onPress={() => router.push(`/profile/${item.id}` as never)}
            />
          )}
          ListFooterComponent={
            hasMore ? (
              <View style={{ paddingVertical: 16, alignItems: 'center' }}>
                <Button
                  label={loadingMore ? 'Loading...' : 'Load more'}
                  variant="secondary"
                  size="sm"
                  loading={loadingMore}
                  onPress={handleLoadMore}
                />
              </View>
            ) : null
          }
        />
      )}
    </View>
  )
}
