import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import { useAuthStore } from '../../src/store/authStore';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

export default function NotificationsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { user, updateProfile } = useAuthStore();

  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [masterEnabled, setMasterEnabled] = useState(user?.notificationsEnabled ?? true);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    { id: 'bookings', title: 'Booking Updates', description: 'New requests, acceptances, and cancellations', enabled: true },
    { id: 'messages', title: 'New Messages', description: 'When someone sends you a message', enabled: true },
    { id: 'reminders', title: 'Date Reminders', description: 'Reminders before upcoming dates', enabled: true },
    { id: 'payments', title: 'Payment Updates', description: 'Payment confirmations and earnings', enabled: true },
  ]);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const { status } = await Notifications.getPermissionsAsync();
    setPermissionStatus(status);
  };

  const requestPermission = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);

    if (status === 'granted') {
      const token = await Notifications.getExpoPushTokenAsync();
      await updateProfile({ expoPushToken: token.data, notificationsEnabled: true });
      setMasterEnabled(true);
    } else {
      Alert.alert(
        'Permission Required',
        'Please enable notifications in your device settings to receive updates.',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleMaster = async (value: boolean) => {
    setMasterEnabled(value);
    await updateProfile({ notificationsEnabled: value });
  };

  const toggleSetting = (id: string) => {
    setSettings(prev =>
      prev.map(s => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Notifications</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {permissionStatus !== 'granted' && (
          <Card style={[styles.permissionCard, { backgroundColor: colors.warning + '15' }]}>
            <View style={styles.permissionContent}>
              <Icon name="bell-off" size={24} color={colors.warning} />
              <View style={styles.permissionText}>
                <Text style={[styles.permissionTitle, { color: colors.text }]}>
                  Notifications Disabled
                </Text>
                <Text style={[styles.permissionDescription, { color: colors.textSecondary }]}>
                  Enable notifications to stay updated on bookings and messages.
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.enableButton, { backgroundColor: colors.warning }]}
              onPress={requestPermission}
            >
              <Text style={[styles.enableButtonText, { color: colors.white }]}>Enable Notifications</Text>
            </TouchableOpacity>
          </Card>
        )}

        <Card style={styles.section}>
          <View style={[styles.settingRow, { borderBottomColor: colors.border }]}>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: colors.text }]}>Push Notifications</Text>
              <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                Receive notifications on your device
              </Text>
            </View>
            <Switch
              value={masterEnabled && permissionStatus === 'granted'}
              onValueChange={toggleMaster}
              disabled={permissionStatus !== 'granted'}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={masterEnabled ? colors.primary : colors.textSecondary}
            />
          </View>
        </Card>

        {masterEnabled && permissionStatus === 'granted' && (
          <Card style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Notification Types</Text>
            {settings.map((setting, index) => (
              <View
                key={setting.id}
                style={[
                  styles.settingRow,
                  { borderBottomColor: colors.border },
                  index === settings.length - 1 && { borderBottomWidth: 0 },
                ]}
              >
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{setting.title}</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => toggleSetting(setting.id)}
                  trackColor={{ false: colors.border, true: colors.primary + '60' }}
                  thumbColor={setting.enabled ? colors.primary : colors.textSecondary}
                />
              </View>
            ))}
          </Card>
        )}

        <Text style={[styles.footerText, { color: colors.textSecondary }]}>
          You can change notification settings at any time in your device settings.
        </Text>
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
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  permissionCard: {
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  permissionContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  permissionText: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  permissionDescription: {
    fontSize: typography.sizes.sm,
    lineHeight: 20,
  },
  enableButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  enableButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '600',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    minHeight: 64,
  },
  settingInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  settingTitle: {
    fontSize: typography.sizes.md,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: typography.sizes.sm,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
    lineHeight: 20,
  },
});
