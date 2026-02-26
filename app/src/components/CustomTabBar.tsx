import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius, shadows } from '../constants/theme';
import { Home, Search, Calendar, MessageCircle, User, Grid, Mail, Wallet } from 'lucide-react-native';

interface TabItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size: number; color: string; strokeWidth?: number }>;
  label: string;
}

const seekerTabs: TabItem[] = [
  { name: 'index', path: '/male', icon: Home, label: 'Home' },
  { name: 'browse', path: '/male/browse', icon: Search, label: 'Browse' },
  { name: 'bookings', path: '/male/bookings', icon: Calendar, label: 'Bookings' },
  { name: 'messages', path: '/male/messages', icon: MessageCircle, label: 'Messages' },
  { name: 'profile', path: '/male/profile', icon: User, label: 'Profile' },
];

const companionTabs: TabItem[] = [
  { name: 'index', path: '/female', icon: Grid, label: 'Dashboard' },
  { name: 'requests', path: '/female/requests', icon: Mail, label: 'Requests' },
  { name: 'calendar', path: '/female/calendar', icon: Calendar, label: 'Calendar' },
  { name: 'earnings', path: '/female/earnings', icon: Wallet, label: 'Earnings' },
  { name: 'profile', path: '/female/profile', icon: User, label: 'Profile' },
];

interface CustomTabBarProps {
  role: 'seeker' | 'companion';
}

export function CustomTabBar({ role }: CustomTabBarProps) {
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const router = useRouter();
  const tabs = role === 'companion' ? companionTabs : seekerTabs;

  const isActive = (path: string) => {
    if (path === '/male' || path === '/female') {
      return pathname === path || pathname === path + '/';
    }
    return pathname.startsWith(path);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Platform.OS === 'web' ? 8 : Math.max(insets.bottom, 8) },
      ]}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.path as any)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            activeOpacity={0.7}
          >
            {active ? (
              <View style={styles.activeIconWrap}>
                <LinearGradient
                  colors={colors.gradient.primary as readonly [string, string, ...string[]]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.activeIconBg}
                >
                  <Icon size={20} color={colors.white} strokeWidth={2.5} />
                </LinearGradient>
              </View>
            ) : (
              <View style={styles.iconWrap}>
                <Icon size={20} color={colors.textMuted} strokeWidth={1.8} />
              </View>
            )}
            <Text
              style={[
                styles.label,
                active ? styles.labelActive : styles.labelInactive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 3,
    borderTopColor: colors.black,
    paddingTop: spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconWrap: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBg: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: colors.primary,
  },
  labelInactive: {
    color: colors.textMuted,
  },
});
