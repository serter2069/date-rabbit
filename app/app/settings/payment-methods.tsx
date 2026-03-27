import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Methods</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Empty state */}
        <Card style={styles.emptyCard}>
          <View style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}>
            <Icon name="credit-card" size={40} color={colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Payment Methods</Text>
          <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
            Add a credit or debit card to easily pay for date bookings.
          </Text>
        </Card>

        <Button
          title="Add Payment Method"
          onPress={() => {
            // TODO: integrate with Stripe payment method setup
          }}
          fullWidth
          size="lg"
        />

        <View style={styles.infoSection}>
          <Card>
            <View style={styles.infoRow}>
              <Icon name="lock" size={18} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Your payment information is securely stored and processed by Stripe.
              </Text>
            </View>
            <View style={[styles.infoDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.infoRow}>
              <Icon name="shield" size={18} color={colors.primary} />
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                We never store your full card number on our servers.
              </Text>
            </View>
          </Card>
        </View>
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
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
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
  emptyCard: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    marginBottom: spacing.xl,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    marginBottom: spacing.sm,
  },
  emptyDescription: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: spacing.lg,
  },
  infoSection: {
    marginTop: spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  infoText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    flex: 1,
    lineHeight: 20,
  },
  infoDivider: {
    height: 1,
    marginVertical: spacing.xs,
  },
});
