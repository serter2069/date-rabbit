import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { UserImage } from '../../src/components/UserImage';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { EmptyState } from '../../src/components/EmptyState';
import { useFavoritesStore } from '../../src/store/favoritesStore';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import { companionsApi, CompanionDetail } from '../../src/services/api';
import * as Haptics from 'expo-haptics';

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { favorites, toggleFavorite, syncFromServer } = useFavoritesStore();
  
  const [favoriteCompanions, setFavoriteCompanions] = useState<CompanionDetail[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFavorites = useCallback(async () => {
    if (favorites.length === 0) {
      setFavoriteCompanions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const companionPromises = favorites.map(id => companionsApi.getById(id));
      const companions = await Promise.all(companionPromises);
      setFavoriteCompanions(companions);
    } catch (err) {
      console.error('Failed to fetch favorites:', err);
      setError('Failed to load favorites. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [favorites]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    await syncFromServer();
    await fetchFavorites();
    setRefreshing(false);
  }, [fetchFavorites, syncFromServer]);

  const handleToggleFavorite = (id: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    toggleFavorite(id);
    setFavoriteCompanions(prev => prev.filter(c => c.id !== id));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color={colors.error} />
            <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.primary }]}
              onPress={() => fetchFavorites()}
              accessibilityRole="button"
              accessibilityLabel="Retry loading favorites"
            >
              <Text style={[styles.retryButtonText, { color: colors.white }]}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary, marginTop: spacing.md }]}>Loading favorites...</Text>
          </View>
        ) : favoriteCompanions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="heart"
              title="No favorites yet"
              description="Browse companions and tap the heart icon to save your favorites"
            />
            <Button
              title="Browse Companions"
              onPress={() => router.replace('/male/browse')}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        ) : (
          <>
            <Text style={[styles.countText, { color: colors.textSecondary }]}>{favoriteCompanions.length} saved</Text>
            {favoriteCompanions.map((companion) => (
              <Card key={companion.id} style={styles.companionCard}>
                <View style={styles.cardHeader}>
                  <UserImage name={companion.name} uri={companion.primaryPhoto} size={72} showVerified={companion.isVerified} />
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, { color: colors.text }]}>{companion.name}{companion.age ? `, ${companion.age}` : ''}</Text>
                    <View style={styles.locationRow}>
                      <Icon name="map-pin" size={14} color={colors.textSecondary} />
                      <Text style={[styles.cardLocation, { color: colors.textSecondary }]}> {companion.location || 'Location hidden'}</Text>
                    </View>
                    <View style={styles.ratingRow}>
                      {companion.reviewCount > 0 ? (
                        <>
                          <Icon name="star" size={14} color={colors.accent} />
                          <Text style={[styles.rating, { color: colors.text }]}> {Number(companion.rating).toFixed(1)}</Text>
                          <Text style={[styles.reviews, { color: colors.textSecondary }]}>({companion.reviewCount} reviews)</Text>
                        </>
                      ) : (
                        <View style={[styles.newBadge, { backgroundColor: colors.primary + '15' }]}>
                          <Text style={[styles.newBadgeText, { color: colors.primary }]}>New</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => handleToggleFavorite(companion.id)}
                    accessibilityLabel={`Remove ${companion.name} from favorites`}
                    accessibilityRole="button"
                  >
                    <Icon name="heart" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.rateRow}>
                  <Text style={[styles.rateValue, { color: colors.primary }]}>${companion.hourlyRate}</Text>
                  <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>/hour</Text>
                </View>

                {companion.bio && (
                  <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={2}>{companion.bio}</Text>
                )}

                <View style={styles.actions}>
                  <Button
                    title="View Profile"
                    onPress={() => router.push(`/profile/${companion.id}`)}
                    variant="outline"
                    size="sm"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Book Date"
                    onPress={() => router.push(`/booking/${companion.id}`)}
                    size="sm"
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    fontSize: typography.sizes.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  countText: {
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  companionCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  cardName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  cardLocation: {
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
    fontWeight: '600',
  },
  reviews: {
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
  heartButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  rateValue: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  rateLabel: {
    fontSize: typography.sizes.sm,
    marginLeft: spacing.xs,
  },
  bio: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  errorContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
  },
  errorText: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
});
