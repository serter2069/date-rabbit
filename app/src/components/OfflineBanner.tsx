import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNetworkStore } from '../store/networkStore';
import { colors } from '../constants/theme';

const BANNER_HEIGHT = 40;
const BACK_ONLINE_DURATION = 2000;

export function OfflineBanner() {
  const isOffline = useNetworkStore((s) => s.isOffline);
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-(BANNER_HEIGHT + 50))).current;
  const [showBackOnline, setShowBackOnline] = useState(false);
  const prevOfflineRef = useRef(false);
  const backOnlineTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const wasOffline = prevOfflineRef.current;
    prevOfflineRef.current = isOffline;

    if (isOffline) {
      // Clear any "back online" timer
      if (backOnlineTimer.current) {
        clearTimeout(backOnlineTimer.current);
        backOnlineTimer.current = null;
      }
      setShowBackOnline(false);
      // Slide banner in
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (wasOffline && !isOffline) {
      // Was offline, now online — show "Back online" briefly
      setShowBackOnline(true);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
      backOnlineTimer.current = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -(BANNER_HEIGHT + insets.top + 10),
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowBackOnline(false));
      }, BACK_ONLINE_DURATION);
    } else if (!isOffline && !wasOffline) {
      // Initial state — ensure banner is hidden
      translateY.setValue(-(BANNER_HEIGHT + insets.top + 10));
    }

    return () => {
      if (backOnlineTimer.current) {
        clearTimeout(backOnlineTimer.current);
      }
    };
  }, [isOffline, insets.top, translateY]);

  if (!isOffline && !showBackOnline) {
    return null;
  }

  const backgroundColor = showBackOnline && !isOffline ? '#2D9557' : '#1A1A1A';
  const message = showBackOnline && !isOffline ? 'Back online' : 'No internet connection';

  return (
    <Animated.View
      style={[
        styles.banner,
        {
          paddingTop: insets.top,
          height: BANNER_HEIGHT + insets.top,
          backgroundColor,
          transform: [{ translateY }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={styles.content}>
        <View style={[styles.dot, { backgroundColor: showBackOnline && !isOffline ? '#6EE7A0' : colors.error }]} />
        <Text style={styles.text}>{message}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    justifyContent: 'flex-end',
    ...(Platform.OS === 'web' ? ({ maxWidth: 430, marginLeft: 'auto', marginRight: 'auto' } as any) : {}),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
