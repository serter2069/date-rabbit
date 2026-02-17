import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '../../src/components/Card';
import { UserImage } from '../../src/components/UserImage';
import { Button } from '../../src/components/Button';
import { Icon } from '../../src/components/Icon';
import { EmptyState } from '../../src/components/EmptyState';
import { useFavoritesStore } from '../../src/store/favoritesStore';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';

// Mock data - in production this would come from API
const allCompanions: Record<string, {
  id: string;
  name: string;
  age: number;
  location: string;
  rating: number;
  reviews: number;
  rate: number;
  bio: string;
  verified: boolean;
}> = {
  '1': { id: '1', name: 'Sarah', age: 28, location: 'Manhattan', rating: 4.9, reviews: 24, rate: 100, bio: 'Marketing professional who loves fine dining and art galleries.', verified: true },
  '2': { id: '2', name: 'Emma', age: 25, location: 'Brooklyn', rating: 4.8, reviews: 18, rate: 85, bio: 'Yoga instructor. Great listener, love deep conversations.', verified: true },
  '3': { id: '3', name: 'Olivia', age: 30, location: 'Upper East Side', rating: 5.0, reviews: 32, rate: 120, bio: 'Investment banker with a passion for wine and theater.', verified: true },
  '4': { id: '4', name: 'Ava', age: 26, location: 'Soho', rating: 4.7, reviews: 15, rate: 90, bio: 'Fashion designer, always up for gallery hopping or rooftop drinks.', verified: true },
  '5': { id: '5', name: 'Mia', age: 27, location: 'Chelsea', rating: 4.9, reviews: 28, rate: 95, bio: 'Travel blogger who knows all the hidden gems in NYC.', verified: true },
};

export default function FavoritesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { favorites, toggleFavorite } = useFavoritesStore();

  const favoriteCompanions = favorites
    .map(id => allCompanions[id])
    .filter(Boolean);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Favorites</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {favoriteCompanions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="heart"
              title="No favorites yet"
              description="Browse companions and tap the heart icon to save your favorites"
            />
            <Button
              title="Browse Companions"
              onPress={() => router.push('/(tabs)/male/browse')}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        ) : (
          <>
            <Text style={[styles.countText, { color: colors.textSecondary }]}>{favoriteCompanions.length} saved</Text>
            {favoriteCompanions.map((companion) => (
              <Card key={companion.id} style={styles.companionCard}>
                <View style={styles.cardHeader}>
                  <UserImage name={companion.name} size={72} showVerified={companion.verified} />
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardName, { color: colors.text }]}>{companion.name}, {companion.age}</Text>
                    <View style={styles.locationRow}>
                      <Icon name="map-pin" size={14} color={colors.textSecondary} />
                      <Text style={[styles.cardLocation, { color: colors.textSecondary }]}> {companion.location}</Text>
                    </View>
                    <View style={styles.ratingRow}>
                      <Icon name="star" size={14} color={colors.accent} />
                      <Text style={[styles.rating, { color: colors.text }]}> {companion.rating}</Text>
                      <Text style={[styles.reviews, { color: colors.textSecondary }]}>({companion.reviews} reviews)</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={() => toggleFavorite(companion.id)}
                  >
                    <Icon name="heart" size={24} color={colors.error} />
                  </TouchableOpacity>
                </View>

                <View style={styles.rateRow}>
                  <Text style={[styles.rateValue, { color: colors.primary }]}>${companion.rate}</Text>
                  <Text style={[styles.rateLabel, { color: colors.textSecondary }]}>/hour</Text>
                </View>

                <Text style={[styles.bio, { color: colors.textSecondary }]} numberOfLines={2}>{companion.bio}</Text>

                <View style={styles.actions}>
                  <Button
                    title="View Profile"
                    onPress={() => router.push({ pathname: '/profile/[id]', params: { id: companion.id } })}
                    variant="outline"
                    size="sm"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Book Date"
                    onPress={() => router.push({ pathname: '/booking/[id]', params: { id: companion.id } })}
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
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
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
    fontSize: typography.sizes.sm,
    fontWeight: '600',
  },
  reviews: {
    fontSize: typography.sizes.sm,
    marginLeft: spacing.xs,
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
});
