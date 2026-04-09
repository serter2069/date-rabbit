import { Stack, Redirect } from 'expo-router';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../src/store/authStore';
import { colors } from '../../src/constants/theme';

export default function AdminLayout() {
  const { user, isAuthenticated, _hasHydrated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(_hasHydrated);

  useEffect(() => {
    if (_hasHydrated) {
      setIsHydrated(true);
      return;
    }
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }
    return () => unsub();
  }, [_hasHydrated]);

  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!isAuthenticated || !user?.isAdmin) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
