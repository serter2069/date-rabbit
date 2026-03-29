import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Card } from '../../../src/components/Card';
import { UserImage } from '../../../src/components/UserImage';
import { Button } from '../../../src/components/Button';
import { Icon } from '../../../src/components/Icon';
import { EmptyState } from '../../../src/components/EmptyState';
import { FilterModal, FilterOptions } from '../../../src/components/FilterModal';
import { useTheme, colors, spacing, typography, borderRadius } from '../../../src/constants/theme';
import { companionsApi, CompanionListItem } from '../../../src/services/api';
import { showAlert } from '../../../src/utils/alert';

import { useAuthStore } from '../../../src/store/authStore';
import { useFavoritesStore } from '../../../src/store/favoritesStore';
import * as Haptics from 'expo-haptics';

const quickFilters = ['All', 'Nearby', 'Top Rated', 'New'];

const defaultFilterOptions: FilterOptions = {
  priceRange: [50, 200],
  maxDistance: 25,
  minRating: 0.0,
  availability: 'any',
  ageRange: [21, 45],
  sortBy: 'recommended',
};

export default function BrowseScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { isAuthenticated } = useAuthStore();
  const { favorites, toggleFavorite } = useFavoritesStore();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterOptions>(defaultFilterOptions);

  // Location state
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  // Data state
  const [companions, setCompanions] = useState<CompanionListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Reusable location request function
  const requestLocation = useCallback(async () => {
    setIsRequestingLocation(true);
    try {
      const locationResult = await Promise.race([
        (async () => {
          const { status } = await Location.requestForegroundPermissionsAsync();
          setLocationPermission(status === 'granted' ? 'granted' : 'denied');
          if (status === 'granted') {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.Balanced,
            });
            return {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
          }
          return null;
        })(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
      ]);
      if (locationResult) {
        setUserLocation(locationResult);
      }
      return locationResult;
    } catch {
      // Location fetch failed, continue without
      return null;
    } finally {
      setIsRequestingLocation(false);
    }
  }, []);

  // Request location on mount (with timeout for web)
  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  // Track fetch generation to prevent stale responses from overwriting fresh data
  const fetchGeneration = React.useRef(0);

  // Fetch companions when location or filters change
  const fetchCompanions = useCallback(async () => {
    const generation = ++fetchGeneration.current;

    try {
      const sortByMap: Record<string, 'recommended' | 'price_low' | 'price_high' | 'rating' | 'distance' | 'new'> = {
        'recommended': 'recommended',
        'price_low': 'price_low',
        'price_high': 'price_high',
        'rating': 'rating',
        'distance': 'distance',
        'new': 'new',
      };

      let sortBy: 'recommended' | 'price_low' | 'price_high' | 'rating' | 'distance' | 'new' =
        sortByMap[appliedFilters.sortBy] || 'recommended';

      // Quick filter overrides
      if (activeFilter === 'Nearby' && userLocation) {
        sortBy = 'distance';
      } else if (activeFilter === 'Top Rated') {
        sortBy = 'rating';
      } else if (activeFilter === 'New') {
        sortBy = 'new';
      }

      const response = await companionsApi.search({
        priceMin: appliedFilters.priceRange[0],
        priceMax: appliedFilters.priceRange[1],
        maxDistance: appliedFilters.maxDistance,
        minRating: appliedFilters.minRating,
        ageMin: appliedFilters.ageRange[0],
        ageMax: appliedFilters.ageRange[1],
        sortBy,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        search: searchQuery.trim() || undefined,
      });

      // Only update state if this is still the latest fetch (prevents stale overwrites)
      if (generation === fetchGeneration.current) {
        setCompanions(response.companions);
      }
    } catch (err) {
      // Only handle error if this is still the latest fetch
      if (generation === fetchGeneration.current) {
        console.error('Failed to fetch companions:', err);
        // Keep existing companions on error instead of wiping the list
      }
    }
  }, [appliedFilters, activeFilter, userLocation, searchQuery]);

  useEffect(() => {
    setIsLoading(true);
    fetchCompanions().finally(() => setIsLoading(false));
  }, [fetchCompanions]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchCompanions();
    setIsRefreshing(false);
  }, [fetchCompanions]);

  // Filter locally for search (API also filters, but this is instant)
  const filteredCompanions = useMemo(() => {
    if (!searchQuery.trim()) return companions;

    const query = searchQuery.toLowerCase();
    return companions.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        (c.location?.toLowerCase().includes(query) ?? false)
    );
  }, [companions, searchQuery]);

  const handleApplyFilters = (filters: FilterOptions) => {
    setAppliedFilters(filters);
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (appliedFilters.priceRange[0] !== defaultFilterOptions.priceRange[0] ||
        appliedFilters.priceRange[1] !== defaultFilterOptions.priceRange[1]) count++;
    if (appliedFilters.maxDistance !== defaultFilterOptions.maxDistance) count++;
    if (appliedFilters.minRating !== defaultFilterOptions.minRating) count++;
    if (appliedFilters.availability !== defaultFilterOptions.availability) count++;
    if (appliedFilters.ageRange[0] !== defaultFilterOptions.ageRange[0] ||
        appliedFilters.ageRange[1] !== defaultFilterOptions.ageRange[1]) count++;
    if (appliedFilters.sortBy !== defaultFilterOptions.sortBy) count++;
    return count;
  }, [appliedFilters]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={[styles.title, { color: colors.text }]}>Browse</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Find your perfect companion</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface }]}>
          <Icon name="search" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name, location..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
            testID="browse-search-input"
          />
        </View>
        <TouchableOpacity
          style={[styles.filterButton, { backgroundColor: colors.surface }]}
          onPress={() => setFilterModalVisible(true)}
          testID="browse-filter-btn"
          accessibilityLabel={activeFiltersCount > 0 ? `Filters, ${activeFiltersCount} active` : 'Open filters'}
          accessibilityRole="button"
        >
          <Icon name="sliders" size={20} color={colors.text} />
          {activeFiltersCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.filterBadgeText, { color: colors.white }]}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContent}
      >
        {quickFilters.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              { backgroundColor: colors.surface },
              activeFilter === filter && [styles.filterChipActive, { backgroundColor: colors.primary }],
            ]}
            onPress={() => {
              if (Platform.OS !== 'web') {
                Haptics.selectionAsync();
              }
              setActiveFilter(filter);
              if (filter === 'Nearby' && !userLocation) {
                requestLocation();
              }
            }}
            accessibilityLabel={filter}
            accessibilityRole="button"
            accessibilityState={{ selected: activeFilter === filter }}
          >
            <Text style={[
              styles.filterText,
              { color: colors.textSecondary },
              activeFilter === filter && { color: colors.white },
            ]}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
      >
        {isLoading || (activeFilter === 'Nearby' && isRequestingLocation) ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              {isRequestingLocation ? 'Getting your location...' : 'Finding companions...'}
            </Text>
          </View>
        ) : activeFilter === 'Nearby' && !userLocation ? (
          <EmptyState
            icon="map-pin"
            title="Location Required"
            description="Enable location access to see nearby companions. We need your location to sort by distance."
            actionLabel="Enable Location"
            onAction={requestLocation}
          />
        ) : filteredCompanions.length === 0 ? (
          <EmptyState
            icon="search"
            title="No matches found"
            description="Try adjusting your filters or search query"
            actionLabel="Reset Filters"
            onAction={() => setAppliedFilters(defaultFilterOptions)}
          />
        ) : (
          filteredCompanions.map((companion) => (
            <Card key={`${companion.id}-${activeFilter}`} style={styles.companionCard}>
              <View style={styles.cardHeader}>
                <UserImage
                  name={companion.name}
                  uri={companion.primaryPhoto}
                  size={72}
                  showVerified={companion.isVerified}
                />
                <View style={styles.cardInfo}>
                  <Text style={[styles.cardName, { color: colors.text }]}>
                    {companion.name}{companion.age ? `, ${companion.age}` : ''}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                    <Icon name="map-pin" size={14} color={colors.textSecondary} />
                    <Text style={[styles.cardLocation, { color: colors.textSecondary, marginLeft: 4 }]}>
                      {companion.distance !== undefined
                        ? `${Number(companion.distance).toFixed(1)} mi away`
                        : companion.location || 'Location hidden'}
                    </Text>
                  </View>
                  <View style={styles.ratingRow}>
                    {companion.reviewCount > 0 ? (
                      <>
                        <Icon name="star" size={14} color={colors.accent} />
                        <Text style={[styles.rating, { color: colors.text, marginLeft: 4 }]}>{Number(companion.rating).toFixed(1)}</Text>
                        <Text style={[styles.reviews, { color: colors.textSecondary }]}>({companion.reviewCount} reviews)</Text>
                      </>
                    ) : (
                      <View style={[styles.newBadge, { backgroundColor: colors.primary + '15' }]}>
                        <Text style={[styles.newBadgeText, { color: colors.primary }]}>New</Text>
                      </View>
                    )}
                  </View>
                </View>
                <View style={[styles.rateBox, { backgroundColor: colors.primary + '15' }]}>
                  <Text style={[styles.rateValue, { color: colors.primary }]}>${companion.hourlyRate ?? 0}</Text>
                  <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>/hr</Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.heartButton, { backgroundColor: colors.white }]}
                onPress={() => {
                  if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }
                  toggleFavorite(companion.id);
                }}
                testID={`browse-favorite-${companion.id}`}
                accessibilityLabel={favorites.includes(companion.id) ? 'Remove from favorites' : 'Add to favorites'}
                accessibilityRole="button"
                accessibilityState={{ selected: favorites.includes(companion.id) }}
              >
                <Icon name="heart" size={18} color={favorites.includes(companion.id) ? colors.error : colors.textSecondary} />
              </TouchableOpacity>

              {companion.distance !== undefined && (
                <View style={[styles.distanceBadge, { backgroundColor: colors.success + '15' }]}>
                  <Icon name="navigation" size={12} color={colors.success} />
                  <Text style={[styles.distanceText, { color: colors.success }]}>
                    {Number(companion.distance) < 1
                      ? `${(Number(companion.distance) * 5280).toFixed(0)} ft`
                      : `${Number(companion.distance).toFixed(1)} mi`}
                  </Text>
                </View>
              )}

              <View style={styles.actions}>
                <Button
                  title="View Profile"
                  onPress={() => router.push(`/profile/${companion.id}`)}
                  variant="outline"
                  size="md"
                  style={styles.actionButton}
                  testID={`browse-view-profile-${companion.id}`}
                />
                <Button
                  title="Book Date"
                  onPress={() => {
                    if (!isAuthenticated) {
                      showAlert('Sign In Required', 'Please sign in to book a date.');
                      router.push('/(auth)/welcome');
                      return;
                    }
                    router.push(`/booking/${companion.id}`);
                  }}
                  size="md"
                  style={styles.actionButton}
                  testID={`browse-book-date-${companion.id}`}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleApplyFilters}
        initialFilters={appliedFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
  },
  subtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  loadingText: {
    fontFamily: typography.fonts.body,
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  distanceText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 2,
    borderColor: colors.border,
    gap: spacing.sm,
    overflow: 'hidden',
    // Neo-Brutalism offset shadow
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    zIndex: 1,
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    // Neo-Brutalism offset shadow
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    zIndex: 10,
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  filterBadgeText: {
    fontFamily: typography.fonts.heading,
    fontSize: 10,
    fontWeight: '700',
  },
  searchInput: {
    fontFamily: typography.fonts.body,
    flex: 1,
    fontSize: typography.sizes.md,
    padding: 0,
    ...Platform.select({
      web: {
        outlineStyle: 'none',
      } as any,
    }),
  },
  filtersScroll: {
    maxHeight: 56,
  },
  filtersContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
    alignItems: 'center',
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    // Inactive chip: subtle shadow
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  filterChipActive: {
    // Active chip: stronger offset shadow
    shadowOffset: { width: 3, height: 3 },
    elevation: 3,
  },
  filterText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  companionCard: {
    marginBottom: spacing.sm,
    position: 'relative',
  },
  heartButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    zIndex: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.lg,
  },
  cardLocation: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  rating: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
  },
  reviews: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginLeft: spacing.xs,
  },
  newBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
  },
  newBadgeText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.xs,
  },
  rateBox: {
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  rateValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
  },
  rateLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
  },
  bio: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
});
