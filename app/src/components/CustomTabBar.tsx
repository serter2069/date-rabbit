import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { colors, spacing, typography } from '../constants/theme';
import { Home, Search, Calendar, MessageCircle, User, Grid, Mail, Wallet } from 'lucide-react-native';

interface TabItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ size: number; color: string }>;
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
    <View style={styles.container}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active = isActive(tab.path);
        const color = active ? colors.primary : colors.textSecondary;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => router.push(tab.path as any)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Icon size={22} color={color} strokeWidth={2} />
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    height: Platform.OS === 'web' ? 56 : 70,
    paddingBottom: Platform.OS === 'web' ? 6 : 16,
    paddingTop: 6,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
  },
});
