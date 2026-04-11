import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../constants/theme';

// ---------------------------------------------------------------------------
// ProtoHeader — all nav variants
// ---------------------------------------------------------------------------
type HeaderVariant = 'guest' | 'auth' | 'back' | 'seeker' | 'companion' | 'admin';

interface HeaderProps {
  variant?: HeaderVariant;
  title?: string;
  onBack?: () => void;
  onLogoPress?: () => void;
}

export function ProtoHeader({ variant = 'guest', title, onBack, onLogoPress }: HeaderProps) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;

  return (
    <View style={hStyles.container}>
      {/* Left */}
      <View style={hStyles.left}>
        {variant === 'back' ? (
          <Pressable style={hStyles.iconBtn} onPress={onBack}>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
        ) : (
          <Pressable style={hStyles.logoRow} onPress={onLogoPress}>
            <Text style={hStyles.logo}>DateRabbit</Text>
          </Pressable>
        )}
        {title && <Text style={hStyles.title}>{title}</Text>}
      </View>

      {/* Right */}
      <View style={hStyles.right}>
        {!isMobile && variant !== 'auth' && variant !== 'back' && (
          <View style={hStyles.navLinks}>
            {variant === 'guest' && (
              <>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>About</Text></Pressable>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>Safety</Text></Pressable>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>Pricing</Text></Pressable>
              </>
            )}
            {variant === 'seeker' && (
              <>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>Browse</Text></Pressable>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>Bookings</Text></Pressable>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>Messages</Text></Pressable>
              </>
            )}
            {variant === 'companion' && (
              <>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>Requests</Text></Pressable>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>Calendar</Text></Pressable>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>Earnings</Text></Pressable>
              </>
            )}
            {variant === 'admin' && (
              <>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>Users</Text></Pressable>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>Cities</Text></Pressable>
                <Pressable style={hStyles.navLink}><Text style={hStyles.navLinkText}>Verifications</Text></Pressable>
              </>
            )}
          </View>
        )}

        {variant === 'guest' && (
          <Pressable style={[hStyles.signInBtn, shadows.sm]}>
            <Text style={hStyles.signInText}>Sign In</Text>
          </Pressable>
        )}

        {(variant === 'seeker' || variant === 'companion') && (
          <>
            <Pressable style={hStyles.iconBtn}>
              <Feather name="bell" size={20} color={colors.text} />
            </Pressable>
            <View style={hStyles.avatarSmall}>
              <Feather name="user" size={14} color={colors.textInverse} />
            </View>
          </>
        )}

        {variant === 'admin' && (
          <View style={hStyles.avatarSmall}>
            <Feather name="user" size={14} color={colors.textInverse} />
          </View>
        )}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ProtoTabBar — bottom tab navigation (mobile only)
// ---------------------------------------------------------------------------
type TabRole = 'seeker' | 'companion';

interface TabBarProps {
  role?: TabRole;
  activeTab?: string;
  onTabPress?: (tab: string) => void;
}

export function ProtoTabBar({ role = 'seeker', activeTab = 'home', onTabPress }: TabBarProps) {
  const seekerTabs = [
    { id: 'home', icon: 'home' as const, label: 'Home' },
    { id: 'bookings', icon: 'calendar' as const, label: 'Bookings' },
    { id: 'messages', icon: 'message-circle' as const, label: 'Messages' },
    { id: 'profile', icon: 'user' as const, label: 'Profile' },
  ];

  const companionTabs = [
    { id: 'home', icon: 'home' as const, label: 'Home' },
    { id: 'requests', icon: 'inbox' as const, label: 'Requests' },
    { id: 'calendar', icon: 'calendar' as const, label: 'Calendar' },
    { id: 'earnings', icon: 'dollar-sign' as const, label: 'Earnings' },
    { id: 'profile', icon: 'user' as const, label: 'Profile' },
  ];

  const tabs = role === 'companion' ? companionTabs : seekerTabs;

  return (
    <View style={tStyles.container}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <Pressable
            key={tab.id}
            style={[tStyles.tabItem, isActive && tStyles.tabItemActive]}
            onPress={() => onTabPress?.(tab.id)}
          >
            <Feather
              name={tab.icon}
              size={20}
              color={isActive ? colors.primary : colors.textMuted}
            />
            <Text style={[tStyles.tabLabel, isActive && tStyles.tabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// ProtoBurger — drawer menu (desktop only)
// ---------------------------------------------------------------------------
interface BurgerProps {
  role?: 'seeker' | 'companion' | 'admin';
  userName?: string;
}

export function ProtoBurger({ role = 'seeker', userName = 'Alex Johnson' }: BurgerProps) {
  const [open, setOpen] = useState(false);

  const menuItems = role === 'admin'
    ? [
        { icon: 'users', label: 'Users' },
        { icon: 'map-pin', label: 'Cities' },
        { icon: 'check-circle', label: 'Verifications' },
        { icon: 'credit-card', label: 'Payments' },
        { icon: 'settings', label: 'Settings' },
      ]
    : role === 'companion'
    ? [
        { icon: 'home', label: 'Dashboard' },
        { icon: 'inbox', label: 'Requests' },
        { icon: 'calendar', label: 'Calendar' },
        { icon: 'dollar-sign', label: 'Earnings' },
        { icon: 'user', label: 'Profile' },
        { icon: 'settings', label: 'Settings' },
      ]
    : [
        { icon: 'home', label: 'Browse' },
        { icon: 'calendar', label: 'Bookings' },
        { icon: 'message-circle', label: 'Messages' },
        { icon: 'heart', label: 'Favorites' },
        { icon: 'user', label: 'Profile' },
        { icon: 'settings', label: 'Settings' },
      ];

  return (
    <View>
      <Pressable style={bStyles.trigger} onPress={() => setOpen(!open)}>
        <Feather name={open ? 'x' : 'menu'} size={20} color={colors.text} />
      </Pressable>

      {open && (
        <View style={bStyles.drawer}>
          <View style={bStyles.drawerHeader}>
            <View style={bStyles.avatarSmall}>
              <Feather name="user" size={14} color={colors.textInverse} />
            </View>
            <View>
              <Text style={bStyles.userName}>{userName}</Text>
              <Text style={bStyles.userRole}>{role.toUpperCase()}</Text>
            </View>
          </View>
          {menuItems.map(item => (
            <Pressable key={item.label} style={bStyles.menuItem}>
              <Feather name={item.icon as any} size={18} color={colors.text} />
              <Text style={bStyles.menuLabel}>{item.label}</Text>
            </Pressable>
          ))}
          <View style={bStyles.divider} />
          <Pressable style={bStyles.menuItem}>
            <Feather name="log-out" size={18} color={colors.error} />
            <Text style={[bStyles.menuLabel, { color: colors.error }]}>Log Out</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const hStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: colors.border,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logo: { ...typography.h3, color: colors.primary },
  title: { ...typography.bodyMedium, color: colors.textSecondary },
  iconBtn: { padding: 4 },
  navLinks: { flexDirection: 'row', gap: spacing.md },
  navLink: { paddingVertical: 4, paddingHorizontal: 8 },
  navLinkText: { ...typography.bodySmall, color: colors.text },
  signInBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  signInText: { ...typography.caption, color: colors.textInverse, fontWeight: '700' },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
});

const tStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: borderWidth.thin,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 2 },
  tabItemActive: {},
  tabLabel: { ...typography.caption, color: colors.textMuted, fontSize: 10 },
  tabLabelActive: { color: colors.primary, fontWeight: '700' },
});

const bStyles = StyleSheet.create({
  trigger: { padding: 8 },
  drawer: {
    position: 'absolute',
    top: 44,
    right: 0,
    width: 260,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    ...shadows.lg as any,
    zIndex: 100,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderBottomWidth: borderWidth.thin,
    borderBottomColor: colors.border,
  },
  avatarSmall: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
  },
  userName: { ...typography.bodyMedium, color: colors.text },
  userRole: { ...typography.caption, color: colors.textMuted },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  menuLabel: { ...typography.body, color: colors.text },
  divider: {
    height: borderWidth.thin,
    backgroundColor: colors.divider,
    marginVertical: spacing.xs,
  },
});
