import { Tabs, Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/constants/theme';
import { useEffect, useState } from 'react';
import { CustomTabBar } from '../../src/components/CustomTabBar';

export default function TabsLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

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

  if (!isHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/(auth)/welcome" />;
  }

  const isCompanion = user.role === 'companion';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <CustomTabBar role={isCompanion ? 'companion' : 'seeker'} />}
    >
      {isCompanion ? (
        <>
          <Tabs.Screen name="female/index" />
          <Tabs.Screen name="female/requests" />
          <Tabs.Screen name="female/calendar" />
          <Tabs.Screen name="female/earnings" />
          <Tabs.Screen name="female/profile" />
          <Tabs.Screen name="male/index" options={{ href: null }} />
          <Tabs.Screen name="male/browse" options={{ href: null }} />
          <Tabs.Screen name="male/bookings" options={{ href: null }} />
          <Tabs.Screen name="male/messages" options={{ href: null }} />
          <Tabs.Screen name="male/profile" options={{ href: null }} />
        </>
      ) : (
        <>
          <Tabs.Screen name="male/index" />
          <Tabs.Screen name="male/browse" />
          <Tabs.Screen name="male/bookings" />
          <Tabs.Screen name="male/messages" />
          <Tabs.Screen name="male/profile" />
          <Tabs.Screen name="female/index" options={{ href: null }} />
          <Tabs.Screen name="female/requests" options={{ href: null }} />
          <Tabs.Screen name="female/calendar" options={{ href: null }} />
          <Tabs.Screen name="female/earnings" options={{ href: null }} />
          <Tabs.Screen name="female/profile" options={{ href: null }} />
        </>
      )}
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
