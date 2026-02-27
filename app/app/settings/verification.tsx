import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
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

interface Requirement {
  name: string;
  met: boolean;
  description: string;
}

export default function VerificationScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, refreshUser } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [canRequest, setCanRequest] = useState(false);
  const [requirements, setRequirements] = useState<Requirement[]>([]);

  const fetchStatus = useCallback(async () => {
    try {
      const status = await usersApi.getVerificationStatus();
      setIsVerified(status.isVerified);
      setCanRequest(status.canRequest);
      setRequirements(status.requirements);
    } catch {
      // Error fetching status
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleRequestVerification = async () => {
    showConfirm(
      'Request Verification',
      'Are you sure you want to submit your profile for verification?',
      async () => {
        setIsSubmitting(true);
        try {
          const result = await usersApi.requestVerification();
          if (result.success) {
            showAlert('Success', result.message);
            await refreshUser();
            await fetchStatus();
          }
        } catch (err: any) {
          showAlert('Error', err.message || 'Failed to submit verification request');
        } finally {
          setIsSubmitting(false);
        }
      },
      'Submit',
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Verification</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Verification</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {isVerified ? (
          <Card style={[styles.statusCard, { backgroundColor: colors.success + '15' }]}>
            <View style={styles.statusContent}>
              <View style={[styles.statusIcon, { backgroundColor: colors.success }]}>
                <Icon name="check" size={32} color={colors.white} />
              </View>
              <Text style={[styles.statusTitle, { color: colors.success }]}>Verified</Text>
              <Text style={[styles.statusDescription, { color: colors.textSecondary }]}>
                Your profile has been verified. You now have a verified badge visible to all users.
              </Text>
            </View>
          </Card>
        ) : (
          <>
            <Card style={styles.infoCard}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>Get Verified</Text>
              <Text style={[styles.infoDescription, { color: colors.textSecondary }]}>
                A verified badge shows others that you are a real person. Verified profiles receive more bookings and build trust with clients.
              </Text>
            </Card>

            <Card style={styles.requirementsCard}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Requirements</Text>
              {requirements.map((req) => (
                <View key={req.name} style={[styles.requirementRow, { borderBottomColor: colors.border }]}>
                  <View style={[styles.requirementIcon, { backgroundColor: req.met ? colors.success + '15' : colors.border }]}>
                    <Icon
                      name={req.met ? 'check' : 'x'}
                      size={16}
                      color={req.met ? colors.success : colors.textSecondary}
                    />
                  </View>
                  <Text style={[styles.requirementText, { color: req.met ? colors.text : colors.textSecondary }]}>
                    {req.description}
                  </Text>
                </View>
              ))}
            </Card>

            <View style={styles.actions}>
              <Button
                title={isSubmitting ? 'Submitting...' : 'Request Verification'}
                onPress={handleRequestVerification}
                disabled={!canRequest || isSubmitting}
                loading={isSubmitting}
              />

              {!canRequest && (
                <Text style={[styles.helpText, { color: colors.textSecondary }]}>
                  Complete all requirements above to request verification
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.editProfileLink}
              onPress={() => router.push('/settings/edit-profile')}
            >
              <Icon name="edit-2" size={16} color={colors.primary} />
              <Text style={[styles.editProfileText, { color: colors.primary }]}>
                Edit Profile
              </Text>
            </TouchableOpacity>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  statusCard: {
    padding: spacing.xl,
  },
  statusContent: {
    alignItems: 'center',
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  statusTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  statusDescription: {
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  infoCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  infoTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  infoDescription: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
  },
  requirementsCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  requirementIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  requirementText: {
    flex: 1,
    fontSize: typography.sizes.md,
  },
  actions: {
    marginBottom: spacing.lg,
  },
  helpText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  editProfileLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
  },
  editProfileText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.md,
    fontWeight: '500',
  },
});
