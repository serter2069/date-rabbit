import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { Button } from './Button';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

export interface FilterOptions {
  priceRange: [number, number];
  maxDistance: number;
  minRating: number;
  availability: 'any' | 'today' | 'this_week' | 'weekend';
  ageRange: [number, number];
  sortBy: 'recommended' | 'price_low' | 'price_high' | 'rating' | 'distance';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
}

const defaultFilters: FilterOptions = {
  priceRange: [50, 200],
  maxDistance: 25,
  minRating: 4.0,
  availability: 'any',
  ageRange: [21, 45],
  sortBy: 'recommended',
};

const availabilityOptions = [
  { value: 'any', label: 'Any time' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This week' },
  { value: 'weekend', label: 'Weekend' },
] as const;

const sortOptions = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'distance', label: 'Nearest First' },
] as const;

export function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterModalProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    ...defaultFilters,
    ...initialFilters,
  });

  const handleReset = () => {
    setFilters(defaultFilters);
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const updateFilter = <K extends keyof FilterOptions>(
    key: K,
    value: FilterOptions[K]
  ) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton} testID="filter-close-btn">
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title} testID="filter-modal-title">Filters</Text>
          <TouchableOpacity onPress={handleReset} testID="filter-reset-btn">
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Price Range (per hour)</Text>
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeValue}>${filters.priceRange[0]}</Text>
              <Text style={styles.rangeValue}>${filters.priceRange[1]}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={20}
                maximumValue={300}
                step={5}
                value={filters.priceRange[0]}
                onValueChange={(value) =>
                  updateFilter('priceRange', [
                    Math.min(value, filters.priceRange[1] - 10),
                    filters.priceRange[1],
                  ])
                }
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
              <Slider
                style={styles.slider}
                minimumValue={20}
                maximumValue={300}
                step={5}
                value={filters.priceRange[1]}
                onValueChange={(value) =>
                  updateFilter('priceRange', [
                    filters.priceRange[0],
                    Math.max(value, filters.priceRange[0] + 10),
                  ])
                }
                minimumTrackTintColor={colors.border}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>
          </View>

          {/* Distance */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Maximum Distance</Text>
              <Text style={styles.valueLabel}>{filters.maxDistance} miles</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={50}
              step={1}
              value={filters.maxDistance}
              onValueChange={(value) => updateFilter('maxDistance', value)}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          </View>

          {/* Minimum Rating */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
              <Text style={styles.valueLabel}>⭐ {filters.minRating.toFixed(1)}+</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={3.0}
              maximumValue={5.0}
              step={0.1}
              value={filters.minRating}
              onValueChange={(value) => updateFilter('minRating', value)}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
            />
          </View>

          {/* Age Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Age Range</Text>
            <View style={styles.rangeLabels}>
              <Text style={styles.rangeValue}>{filters.ageRange[0]} years</Text>
              <Text style={styles.rangeValue}>{filters.ageRange[1]} years</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={60}
                step={1}
                value={filters.ageRange[0]}
                onValueChange={(value) =>
                  updateFilter('ageRange', [
                    Math.min(value, filters.ageRange[1] - 1),
                    filters.ageRange[1],
                  ])
                }
                minimumTrackTintColor={colors.primary}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
              <Slider
                style={styles.slider}
                minimumValue={18}
                maximumValue={60}
                step={1}
                value={filters.ageRange[1]}
                onValueChange={(value) =>
                  updateFilter('ageRange', [
                    filters.ageRange[0],
                    Math.max(value, filters.ageRange[0] + 1),
                  ])
                }
                minimumTrackTintColor={colors.border}
                maximumTrackTintColor={colors.border}
                thumbTintColor={colors.primary}
              />
            </View>
          </View>

          {/* Availability */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Availability</Text>
            <View style={styles.chipGroup}>
              {availabilityOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.chip,
                    filters.availability === option.value && styles.chipActive,
                  ]}
                  onPress={() => updateFilter('availability', option.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      filters.availability === option.value && styles.chipTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sort By</Text>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioRow}
                onPress={() => updateFilter('sortBy', option.value)}
              >
                <View
                  style={[
                    styles.radio,
                    filters.sortBy === option.value && styles.radioActive,
                  ]}
                >
                  {filters.sortBy === option.value && (
                    <View style={styles.radioInner} />
                  )}
                </View>
                <Text style={styles.radioLabel}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: spacing.xxl }} />
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title="Apply Filters"
            onPress={handleApply}
            fullWidth
            size="lg"
            testID="filter-apply-btn"
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 20,
    color: colors.text,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.text,
  },
  resetText: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  valueLabel: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    color: colors.primary,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  rangeValue: {
    fontSize: typography.sizes.sm,
    fontWeight: '600',
    color: colors.primary,
  },
  sliderContainer: {
    marginTop: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.white,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  radioLabel: {
    fontSize: typography.sizes.md,
    color: colors.text,
  },
  footer: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
