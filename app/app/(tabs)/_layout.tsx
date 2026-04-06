import { Tabs, Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/constants/theme';
import { useEffect, useState } from 'react';
import { CustomTabBar } from '../../src/components/CustomTabBar';
import { useMessagesStore } from '../../src/store/messagesStore';

const UNREAD_REFRESH_INTERVAL_MS = 30_000; // 30 seconds

export default function TabsLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const refreshUnreadCount = useMessagesStore((s) => s.refreshUnreadCount);

  useEffect(() => {
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });

    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }

    return () => {
      unsubFinishHydration();
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Fetch immediately on mount
    refreshUnreadCount();

    // Then refresh periodically
    const interval = setInterval(refreshUnreadCount, UNREAD_REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, refreshUnreadCount]);

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/welcome?redirect=1" />;
  }

  const isCompanion = user.role === 'companion';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar role={isCompanion ? 'companion' : 'seeker'} />}
    >
      {/* Female / companion screens — hidden for seekers */}
      <Tabs.Screen
        name="female/index"
        options={isCompanion ? undefined : { href: null }}
      />
      <Tabs.Screen
        name="female/requests"
        options={isCompanion ? undefined : { href: null }}
      />
      <Tabs.Screen
        name="female/calendar"
        options={isCompanion ? undefined : { href: null }}
      />
      <Tabs.Screen
        name="female/earnings"
        options={isCompanion ? undefined : { href: null }}
      />
      <Tabs.Screen
        name="female/history"
        options={isCompanion ? undefined : { href: null }}
      />
      <Tabs.Screen
        name="female/profile"
        options={isCompanion ? undefined : { href: null }}
      />
      {/* Male / seeker screens — hidden for companions */}
      <Tabs.Screen
        name="male/index"
        options={isCompanion ? { href: null } : undefined}
      />
<Tabs.Screen
        name="male/browse"
        options={isCompanion ? { href: null } : undefined}
      />
      <Tabs.Screen
        name="male/bookings"
        options={isCompanion ? { href: null } : undefined}
      />
      <Tabs.Screen
        name="male/messages"
        options={isCompanion ? { href: null } : undefined}
      />
      <Tabs.Screen
        name="male/profile"
        options={isCompanion ? { href: null } : undefined}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
