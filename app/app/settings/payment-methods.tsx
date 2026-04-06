import React, { useEffect, useState, useCallback, Platform } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { StripeSetupForm } from '../../src/components/StripeSetupForm';
import { paymentsApi, ApiError } from '../../src/services/api';
import { useTheme, colors, spacing, typography, borderRadius } from '../../src/constants/theme';
import { showAlert } from '../../src/utils/alert';

interface SavedCard {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
}

function formatBrand(brand: string): string {
  const map: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
  };
  return map[brand.toLowerCase()] ?? brand;
}

export default function PaymentMethodsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [setupClientSecret, setSetupClientSecret] = useState<string | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const result = await paymentsApi.listPaymentMethods();
      setCards(result.paymentMethods);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to load payment methods';
      setFetchError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleAddCard = async () => {
    if (Platform.OS !== 'web') {
      showAlert(
        'Web Required',
        'Please open DateRabbit in your browser to add a payment method.',
      );
      return;
    }
    setSetupLoading(true);
    try {
      const { clientSecret } = await paymentsApi.createSetupIntent();
      setSetupClientSecret(clientSecret);
      setShowAddModal(true);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to initialize card setup';
      showAlert('Error', msg);
    } finally {
      setSetupLoading(false);
    }
  };

  const handleSetupSuccess = async () => {
    setShowAddModal(false);
    setSetupClientSecret(null);
    await fetchCards();
    showAlert('Card Saved', 'Your payment method has been saved successfully.');
  };

  const handleSetupCancel = () => {
    setShowAddModal(false);
    setSetupClientSecret(null);
  };

  const handleDelete = (card: SavedCard) => {
    showAlert(
      'Remove Card',
      `Remove ${formatBrand(card.brand)} ending in ${card.last4}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setDeletingId(card.id);
            try {
              await paymentsApi.deletePaymentMethod(card.id);
              setCards((prev) => prev.filter((c) => c.id !== card.id));
            } catch (err) {
              const msg = err instanceof ApiError ? err.message : 'Failed to remove card';
              showAlert('Error', msg);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + spacing.sm,
            backgroundColor: colors.white,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Methods</Text>
        <View style={{ width: 44 }} />
      </View>

      {fetchError && (
        <View style={[styles.errorBanner, { borderColor: colors.black, backgroundColor: colors.errorLight }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>{fetchError}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.black }]}
            onPress={fetchCards}
            accessibilityLabel="Try again"
            accessibilityRole="button"
          >
            <Text style={[styles.retryButtonText, { color: colors.white }]}>Try Again</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {fetchError && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{fetchError}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchCards}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              Loading payment methods...
            </Text>
          </View>
        ) : cards.length === 0 ? (
          /* Empty state */
          <Card style={styles.emptyCard}>
            <View
              style={[styles.emptyIconContainer, { backgroundColor: colors.primary + '15' }]}
            >
              <Icon name="credit-card" size={40} color={colors.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No Payment Methods</Text>
            <Text style={[styles.emptyDescription, { color: colors.textSecondary }]}>
              Add a credit or debit card to easily pay for date bookings.
            </Text>
          </Card>
        ) : (
          /* Card list */
          <View style={styles.cardList}>
            {cards.map((card) => (
              <Card key={card.id} style={styles.cardItem}>
                <View style={styles.cardRow}>
                  <View
                    style={[
                      styles.cardIconContainer,
                      { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <Icon name="credit-card" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardBrand, { color: colors.text }]}>
                      {formatBrand(card.brand)}
                    </Text>
                    <Text style={[styles.cardDetails, { color: colors.textSecondary }]}>
                      {'\u2022\u2022\u2022\u2022'} {card.last4} &middot; Expires {card.expMonth}/{String(card.expYear).slice(-2)}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.deleteButton, { backgroundColor: colors.error + '15' }]}
                    onPress={() => handleDelete(card)}
                    disabled={deletingId === card.id}
                    accessibilityLabel={`Remove ${formatBrand(card.brand)} ending in ${card.last4}`}
                    accessibilityRole="button"
                  >
                    {deletingId === card.id ? (
                      <ActivityIndicator size="small" color={colors.error} />
                    ) : (
                      <Icon name="trash" size={18} color={colors.error} />
                    )}
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        )}

        <Button
          title={setupLoading ? 'Setting up...' : 'Add Payment Method'}
          onPress={handleAddCard}
          variant="pink"
          fullWidth
          size="lg"
          disabled={setupLoading}
          style={{ marginTop: cards.length > 0 ? spacing.md : spacing.xl }}
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

      {/* Add Card Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={handleSetupCancel}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              {
                backgroundColor: colors.white,
                borderColor: colors.border,
                paddingBottom: insets.bottom + spacing.lg,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Add Payment Method</Text>
              <TouchableOpacity
                onPress={handleSetupCancel}
                style={[styles.modalCloseButton, { backgroundColor: colors.surface }]}
                accessibilityLabel="Close"
                accessibilityRole="button"
              >
                <Icon name="x" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>

            {setupClientSecret ? (
              <StripeSetupForm
                clientSecret={setupClientSecret}
                onSuccess={handleSetupSuccess}
                onError={(msg) => showAlert('Error', msg)}
                onCancel={handleSetupCancel}
              />
            ) : (
              <ActivityIndicator size="large" color={colors.primary} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    flex: 1,
    marginRight: spacing.sm,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  retryButtonText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
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
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  loadingText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
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
  cardList: {
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  cardItem: {
    paddingVertical: spacing.sm,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  cardIconContainer: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardBrand: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardDetails: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
  },
  errorText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    color: colors.primary,
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.sm,
  },
  retryText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
    color: colors.primary,
  },
});
