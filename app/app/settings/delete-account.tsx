import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';
import { usersApi } from '../../src/services/api';
import { showAlert, showConfirm } from '../../src/utils/alert';

export default function DeleteAccountScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { logout } = useAuthStore();

  const [confirmation, setConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmation.toLowerCase() === 'delete';

  const handleDeleteAccount = () => {
    showConfirm(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?',
      async () => {
        setIsDeleting(true);
        try {
          const result = await usersApi.deleteAccount();
          if (result.success) {
            showAlert('Account Deleted', result.message, async () => {
              await logout();
              router.replace('/welcome');
            });
          }
        } catch (err: any) {
          showAlert('Error', err.message || 'Failed to delete account');
          setIsDeleting(false);
        }
      },
      'Delete Forever',
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.error }]}>Delete Account</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={[styles.warningCard, { backgroundColor: colors.error + '10' }]}>
          <View style={styles.warningHeader}>
            <View style={[styles.warningIcon, { backgroundColor: colors.error }]}>
              <Icon name="alert-triangle" size={24} color={colors.white} />
            </View>
            <Text style={[styles.warningTitle, { color: colors.error }]}>
              Danger Zone
            </Text>
          </View>
          <Text style={[styles.warningText, { color: colors.text }]}>
            Deleting your account is permanent and cannot be undone. This action will:
          </Text>
        </Card>

        <Card style={styles.listCard}>
          <View style={styles.listItem}>
            <Icon name="x-circle" size={20} color={colors.error} />
            <Text style={[styles.listText, { color: colors.text }]}>
              Delete all your profile information
            </Text>
          </View>
          <View style={styles.listItem}>
            <Icon name="x-circle" size={20} color={colors.error} />
            <Text style={[styles.listText, { color: colors.text }]}>
              Remove all your photos
            </Text>
          </View>
          <View style={styles.listItem}>
            <Icon name="x-circle" size={20} color={colors.error} />
            <Text style={[styles.listText, { color: colors.text }]}>
              Cancel any pending bookings
            </Text>
          </View>
          <View style={styles.listItem}>
            <Icon name="x-circle" size={20} color={colors.error} />
            <Text style={[styles.listText, { color: colors.text }]}>
              Anonymize your message history
            </Text>
          </View>
        </Card>

        <Card style={styles.confirmationCard}>
          <Text style={[styles.confirmationLabel, { color: colors.text }]}>
            Type "DELETE" to confirm:
          </Text>
          <TextInput
            style={[
              styles.confirmationInput,
              {
                backgroundColor: colors.surface,
                borderColor: confirmation && !canDelete ? colors.error : colors.border,
                color: colors.text,
              },
            ]}
            placeholder="DELETE"
            placeholderTextColor={colors.textSecondary}
            value={confirmation}
            onChangeText={setConfirmation}
            autoCapitalize="characters"
            autoCorrect={false}
          />
        </Card>

        <Button
          title={isDeleting ? 'Deleting...' : 'Delete My Account'}
          onPress={handleDeleteAccount}
          disabled={!canDelete || isDeleting}
          loading={isDeleting}
          style={{ backgroundColor: canDelete ? colors.error : colors.border }}
        />

        <TouchableOpacity
          style={styles.cancelLink}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
            Keep my account
          </Text>
        </TouchableOpacity>
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
  warningCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  warningIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '700',
  },
  warningText: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  listCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  listText: {
    fontSize: typography.sizes.md,
    flex: 1,
  },
  confirmationCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  confirmationLabel: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  confirmationInput: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 2,
  },
  cancelLink: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  cancelText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
    fontWeight: '500',
  },
});
