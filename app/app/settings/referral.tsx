import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  ActivityIndicator,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { referralApi } from '../../src/services/api';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import { showAlert } from '../../src/utils/alert';

export default function ReferralScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [code, setCode] = useState<string | null>(null);
  const [stats, setStats] = useState<{ invited: number; credited: number }>({ invited: 0, credited: 0 });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [codeRes, statsRes] = await Promise.all([
        referralApi.getMyCode(),
        referralApi.getMyStats(),
      ]);
      setCode(codeRes.code);
      setStats(statsRes);
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to load referral info');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCopy = async () => {
    if (!code) return;
    await Clipboard.setStringAsync(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!code) return;
    try {
      await Share.share({
        message: `Join DateRabbit with my referral code ${code} and get 50% off your Background Check!`,
      });
    } catch {
      // User cancelled share
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Invite Friends</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.heroSection}>
          <View style={[styles.iconCircle, { backgroundColor: colors.primary + '15' }]}>
            <Icon name="gift" size={32} color={colors.primary} />
          </View>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Share the Love</Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary }]}>
            Your friend gets 50% off their Background Check when they sign up with your code.
          </Text>
        </View>

        <Card>
          <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>Your referral code</Text>
          <View style={styles.codeRow}>
            <Text style={[styles.codeText, { color: colors.text }]}>{code || '---'}</Text>
            <TouchableOpacity
              style={[styles.copyButton, { backgroundColor: copied ? colors.success + '20' : colors.primary + '15' }]}
              onPress={handleCopy}
              accessibilityLabel="Copy referral code"
              accessibilityRole="button"
            >
              <Icon name={copied ? 'check' : 'copy'} size={18} color={copied ? colors.success : colors.primary} />
              <Text style={[styles.copyText, { color: copied ? colors.success : colors.primary }]}>
                {copied ? 'Copied' : 'Copy'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        <View style={styles.buttonSection}>
          <Button
            title="Share with Friends"
            onPress={handleShare}
            fullWidth
            size="lg"
            icon={<Icon name="share-2" size={18} color="#FFFFFF" />}
          />
        </View>

        <Card>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Your Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.primary }]}>{stats.invited}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Friends Invited</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.divider }]} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.success }]}>{stats.credited}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Bonuses Credited</Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  heroSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  codeLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.sm,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  codeText: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
    letterSpacing: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: 6,
  },
  copyText: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.sm,
  },
  buttonSection: {
    marginVertical: spacing.lg,
  },
  statsTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xxl,
    fontWeight: '700',
  },
  statLabel: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
});
