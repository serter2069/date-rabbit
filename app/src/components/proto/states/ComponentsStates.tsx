import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StateSection } from '../StateSection';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';

// ---------------------------------------------------------------------------
// 1. HEADER VARIANTS
// ---------------------------------------------------------------------------
function HeaderVariants() {
  return (
    <View style={{ gap: 16 }}>
      {/* Public Nav */}
      <View>
        <Text style={s.subLabel}>PUBLIC NAV</Text>
        <View style={[s.headerBar, { backgroundColor: colors.surface }]}>
          <Text style={[typography.h3, { color: colors.primary }]}>DateRabbit</Text>
          <View style={s.headerRight}>
            <Pressable style={s.headerLink}>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>About</Text>
            </Pressable>
            <Pressable style={[s.btnSmall, s.btnPrimary, shadows.sm]}>
              <Text style={[typography.caption, { color: colors.textInverse, fontWeight: '700' }]}>Sign In</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Auth Nav */}
      <View>
        <Text style={s.subLabel}>AUTH NAV</Text>
        <View style={[s.headerBar, { backgroundColor: colors.surface }]}>
          <Pressable>
            <Feather name="arrow-left" size={20} color={colors.text} />
          </Pressable>
          <Text style={[typography.h3, { color: colors.text }]}>Create Account</Text>
          <View style={{ width: 20 }} />
        </View>
      </View>

      {/* User Nav */}
      <View>
        <Text style={s.subLabel}>USER NAV (SEEKER)</Text>
        <View style={[s.headerBar, { backgroundColor: colors.surface }]}>
          <Text style={[typography.h3, { color: colors.primary }]}>DateRabbit</Text>
          <View style={s.headerRight}>
            <Pressable>
              <Feather name="bell" size={20} color={colors.text} />
            </Pressable>
            <Pressable>
              <Feather name="settings" size={20} color={colors.text} />
            </Pressable>
            <View style={s.avatar}>
              <Feather name="user" size={16} color={colors.textInverse} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 2. BOTTOM TAB BAR
// ---------------------------------------------------------------------------
function BottomTabBar() {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = [
    { label: 'Discover', icon: 'compass' },
    { label: 'Matches', icon: 'heart' },
    { label: 'Chat', icon: 'message-circle' },
    { label: 'Events', icon: 'calendar' },
    { label: 'Profile', icon: 'user' },
  ];

  return (
    <View style={s.tabBarContainer}>
      {tabs.map((tab, i) => (
        <Pressable
          key={tab.label}
          style={[s.tabItem, activeTab === i && s.tabItemActive]}
          onPress={() => setActiveTab(i)}
        >
          <Feather
            name={tab.icon as any}
            size={22}
            color={activeTab === i ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              s.tabLabel,
              { color: activeTab === i ? colors.primary : colors.textMuted },
              activeTab === i && { fontWeight: '700' },
            ]}
          >
            {tab.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 3. BURGER / DRAWER MENU
// ---------------------------------------------------------------------------
function BurgerDrawer() {
  const [open, setOpen] = useState(false);
  const menuItems = [
    { icon: 'compass', label: 'Discover' },
    { icon: 'heart', label: 'My Matches' },
    { icon: 'message-circle', label: 'Messages' },
    { icon: 'calendar', label: 'Events' },
    { icon: 'star', label: 'Favorites' },
    { icon: 'settings', label: 'Settings' },
    { icon: 'help-circle', label: 'Support' },
    { icon: 'log-out', label: 'Log Out' },
  ];

  return (
    <View>
      <Pressable
        style={[s.btnSmall, s.btnSecondary, shadows.sm]}
        onPress={() => setOpen(!open)}
      >
        <Feather name={open ? 'x' : 'menu'} size={18} color={colors.text} />
        <Text style={[typography.caption, { color: colors.text, fontWeight: '700', marginLeft: 6 }]}>
          {open ? 'CLOSE' : 'MENU'}
        </Text>
      </Pressable>
      {open && (
        <View style={s.drawerPanel}>
          <View style={s.drawerHeader}>
            <View style={s.avatar}>
              <Feather name="user" size={16} color={colors.textInverse} />
            </View>
            <View>
              <Text style={[typography.bodyMedium, { color: colors.text }]}>Alex Johnson</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>Premium Member</Text>
            </View>
          </View>
          {menuItems.map(item => (
            <Pressable key={item.label} style={s.drawerItem}>
              <Feather name={item.icon as any} size={18} color={colors.text} />
              <Text style={[typography.body, { color: colors.text }]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 4. SEARCH / FILTER
// ---------------------------------------------------------------------------
function SearchFilter() {
  const [city, setCity] = useState('');
  const [ageMin, setAgeMin] = useState('21');
  const [ageMax, setAgeMax] = useState('35');
  const [interests, setInterests] = useState<string[]>(['Travel', 'Music']);

  const allInterests = ['Travel', 'Music', 'Art', 'Sport', 'Food', 'Cinema', 'Books', 'Nature'];

  const toggleInterest = (interest: string) => {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <View style={{ gap: 12 }}>
      {/* City search */}
      <View>
        <Text style={s.inputLabel}>CITY</Text>
        <View style={s.searchInputWrap}>
          <Feather name="map-pin" size={16} color={colors.textMuted} />
          <TextInput
            style={s.searchInput}
            placeholder="Search city..."
            placeholderTextColor={colors.textLight}
            value={city}
            onChangeText={setCity}
          />
        </View>
      </View>

      {/* Age range */}
      <View>
        <Text style={s.inputLabel}>AGE RANGE</Text>
        <View style={s.ageRow}>
          <TextInput
            style={[s.inputDefault, { flex: 1, textAlign: 'center' }]}
            value={ageMin}
            onChangeText={setAgeMin}
            keyboardType="numeric"
          />
          <Text style={[typography.body, { color: colors.textMuted }]}>to</Text>
          <TextInput
            style={[s.inputDefault, { flex: 1, textAlign: 'center' }]}
            value={ageMax}
            onChangeText={setAgeMax}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Interest chips */}
      <View>
        <Text style={s.inputLabel}>INTERESTS</Text>
        <View style={s.chipRow}>
          {allInterests.map(interest => {
            const selected = interests.includes(interest);
            return (
              <Pressable
                key={interest}
                style={[s.chip, selected && s.chipSelected]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[s.chipText, selected && s.chipTextSelected]}>{interest}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable style={[s.btnBase, s.btnPrimary, shadows.button]}>
        <Feather name="search" size={16} color={colors.textInverse} style={{ marginRight: 6 }} />
        <Text style={[s.btnText, { color: colors.textInverse }]}>SEARCH</Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 5. TEXT INPUTS
// ---------------------------------------------------------------------------
function TextInputStates() {
  const [focusedValue, setFocusedValue] = useState('Focused input');

  return (
    <View style={{ gap: 12 }}>
      <View>
        <Text style={s.inputLabel}>DEFAULT</Text>
        <TextInput
          style={s.inputDefault}
          placeholder="Enter text..."
          placeholderTextColor={colors.textLight}
        />
      </View>
      <View>
        <Text style={s.inputLabel}>FOCUSED</Text>
        <TextInput
          style={[s.inputDefault, s.inputFocused]}
          value={focusedValue}
          onChangeText={setFocusedValue}
        />
      </View>
      <View>
        <Text style={s.inputLabel}>ERROR</Text>
        <TextInput style={[s.inputDefault, s.inputError]} value="Invalid email" />
        <Text style={s.inputErrorText}>Please enter a valid email address</Text>
      </View>
      <View>
        <Text style={s.inputLabel}>DISABLED</Text>
        <TextInput
          style={[s.inputDefault, s.inputDisabled]}
          value="Cannot edit"
          editable={false}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 6. BUTTONS
// ---------------------------------------------------------------------------
function ButtonVariants() {
  return (
    <View style={{ gap: 12 }}>
      <Pressable style={[s.btnBase, s.btnPrimary, shadows.button]}>
        <Text style={[s.btnText, { color: colors.textInverse }]}>PRIMARY</Text>
      </Pressable>
      <Pressable style={[s.btnBase, s.btnSecondary, shadows.button]}>
        <Text style={[s.btnText, { color: colors.text }]}>SECONDARY</Text>
      </Pressable>
      <Pressable style={[s.btnBase, s.btnGhost]}>
        <Text style={[s.btnText, { color: colors.text }]}>GHOST</Text>
      </Pressable>
      <Pressable style={[s.btnBase, s.btnDisabledStyle]} disabled>
        <Text style={[s.btnText, { color: colors.textLight }]}>DISABLED</Text>
      </Pressable>
      <View style={s.btnRowSmall}>
        <Pressable style={[s.btnBase, s.btnPrimary, shadows.sm, { flex: 1 }]}>
          <Feather name="heart" size={14} color={colors.textInverse} style={{ marginRight: 4 }} />
          <Text style={[s.btnText, { color: colors.textInverse, fontSize: 13 }]}>LIKE</Text>
        </Pressable>
        <Pressable style={[s.btnBase, s.btnSecondary, shadows.sm, { flex: 1 }]}>
          <Feather name="message-circle" size={14} color={colors.text} style={{ marginRight: 4 }} />
          <Text style={[s.btnText, { color: colors.text, fontSize: 13 }]}>MESSAGE</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 7. SELECT / DROPDOWN
// ---------------------------------------------------------------------------
function SelectDropdown() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('Tbilisi');
  const options = ['Tbilisi', 'Batumi', 'Kutaisi', 'Yerevan', 'Baku'];

  return (
    <View>
      <Text style={s.inputLabel}>SELECT CITY</Text>
      <Pressable
        style={[s.inputDefault, s.selectTrigger]}
        onPress={() => setOpen(!open)}
      >
        <Text style={[typography.body, { color: colors.text }]}>{selected}</Text>
        <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text} />
      </Pressable>
      {open && (
        <View style={s.dropdownList}>
          {options.map(opt => (
            <Pressable
              key={opt}
              style={[s.dropdownItem, opt === selected && s.dropdownItemActive]}
              onPress={() => { setSelected(opt); setOpen(false); }}
            >
              <Text style={[typography.body, { color: opt === selected ? colors.primary : colors.text }]}>
                {opt}
              </Text>
              {opt === selected && <Feather name="check" size={16} color={colors.primary} />}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// 8. CARDS (Profile Card, Event Card)
// ---------------------------------------------------------------------------
function Cards() {
  return (
    <View style={{ gap: 16 }}>
      {/* Profile Card */}
      <View>
        <Text style={s.subLabel}>PROFILE CARD</Text>
        <View style={[s.card, shadows.md]}>
          <View style={s.cardImagePlaceholder}>
            <Feather name="image" size={32} color={colors.textLight} />
            <Text style={[typography.caption, { color: colors.textLight, marginTop: 4 }]}>Photo</Text>
          </View>
          <View style={s.cardBody}>
            <View style={s.cardNameRow}>
              <Text style={[typography.h3, { color: colors.text }]}>Natalia, 26</Text>
              <View style={s.verifiedBadge}>
                <Feather name="check-circle" size={14} color={colors.success} />
              </View>
            </View>
            <View style={s.cardLocationRow}>
              <Feather name="map-pin" size={12} color={colors.textMuted} />
              <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>Tbilisi</Text>
            </View>
            <View style={s.chipRow}>
              <View style={[s.chip, s.chipSelected]}>
                <Text style={[s.chipText, s.chipTextSelected]}>Travel</Text>
              </View>
              <View style={[s.chip, s.chipSelected]}>
                <Text style={[s.chipText, s.chipTextSelected]}>Art</Text>
              </View>
              <View style={[s.chip, s.chipSelected]}>
                <Text style={[s.chipText, s.chipTextSelected]}>Music</Text>
              </View>
            </View>
            <View style={s.cardActions}>
              <Pressable style={[s.btnSmall, s.btnPrimary, shadows.sm]}>
                <Feather name="heart" size={14} color={colors.textInverse} />
                <Text style={[typography.caption, { color: colors.textInverse, fontWeight: '700', marginLeft: 4 }]}>LIKE</Text>
              </Pressable>
              <Pressable style={[s.btnSmall, s.btnSecondary, shadows.sm]}>
                <Feather name="message-circle" size={14} color={colors.text} />
                <Text style={[typography.caption, { color: colors.text, fontWeight: '700', marginLeft: 4 }]}>MESSAGE</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      {/* Event Card */}
      <View>
        <Text style={s.subLabel}>EVENT CARD</Text>
        <View style={[s.card, shadows.md]}>
          <View style={[s.cardImagePlaceholder, { height: 100 }]}>
            <Feather name="calendar" size={32} color={colors.textLight} />
            <Text style={[typography.caption, { color: colors.textLight, marginTop: 4 }]}>Event Photo</Text>
          </View>
          <View style={s.cardBody}>
            <Text style={[typography.h3, { color: colors.text }]}>Wine Tasting Evening</Text>
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="clock" size={12} color={colors.textMuted} />
                <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>Sat, 8 PM</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="map-pin" size={12} color={colors.textMuted} />
                <Text style={[typography.caption, { color: colors.textMuted, marginLeft: 4 }]}>Tbilisi</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 8 }}>
              <View style={[s.badge, { backgroundColor: colors.badge.pink.bg, borderColor: colors.badge.pink.border }]}>
                <Text style={[s.badgeText, { color: colors.badge.pink.text }]}>12 SPOTS LEFT</Text>
              </View>
              <View style={[s.badge, { backgroundColor: colors.badge.purple.bg, borderColor: colors.badge.purple.border }]}>
                <Text style={[s.badgeText, { color: colors.badge.purple.text }]}>$45</Text>
              </View>
            </View>
            <Pressable style={[s.btnBase, s.btnPrimary, shadows.sm, { marginTop: 12 }]}>
              <Text style={[s.btnText, { color: colors.textInverse }]}>JOIN EVENT</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 9. BADGES / CHIPS
// ---------------------------------------------------------------------------
function BadgesChips() {
  return (
    <View style={{ gap: 16 }}>
      {/* Interest tags */}
      <View>
        <Text style={s.subLabel}>INTEREST TAGS</Text>
        <View style={s.chipRow}>
          {['Travel', 'Photography', 'Cooking', 'Yoga', 'Dancing', 'Wine'].map(tag => (
            <View key={tag} style={[s.chip, s.chipSelected]}>
              <Text style={[s.chipText, s.chipTextSelected]}>{tag}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Verified badge */}
      <View>
        <Text style={s.subLabel}>VERIFIED BADGE</Text>
        <View style={s.chipRow}>
          <View style={[s.badge, { backgroundColor: colors.badge.success.bg, borderColor: colors.badge.success.border, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <Feather name="check-circle" size={12} color={colors.badge.success.text} />
            <Text style={[s.badgeText, { color: colors.badge.success.text }]}>VERIFIED</Text>
          </View>
          <View style={[s.badge, { backgroundColor: colors.badge.purple.bg, borderColor: colors.badge.purple.border, flexDirection: 'row', alignItems: 'center', gap: 4 }]}>
            <Feather name="award" size={12} color={colors.badge.purple.text} />
            <Text style={[s.badgeText, { color: colors.badge.purple.text }]}>PREMIUM</Text>
          </View>
        </View>
      </View>

      {/* Online status */}
      <View>
        <Text style={s.subLabel}>ONLINE STATUS</Text>
        <View style={s.chipRow}>
          <View style={[s.statusBadge, { backgroundColor: colors.successLight }]}>
            <View style={[s.statusDot, { backgroundColor: colors.success }]} />
            <Text style={[typography.caption, { color: colors.success, fontWeight: '700' }]}>Online</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: colors.warningLight }]}>
            <View style={[s.statusDot, { backgroundColor: colors.warning }]} />
            <Text style={[typography.caption, { color: colors.warning, fontWeight: '700' }]}>Away</Text>
          </View>
          <View style={[s.statusBadge, { backgroundColor: colors.borderLight }]}>
            <View style={[s.statusDot, { backgroundColor: colors.textLight }]} />
            <Text style={[typography.caption, { color: colors.textLight, fontWeight: '700' }]}>Offline</Text>
          </View>
        </View>
      </View>

      {/* Status badges */}
      <View>
        <Text style={s.subLabel}>STATUS BADGES</Text>
        <View style={s.chipRow}>
          <View style={[s.badge, { backgroundColor: colors.badge.pink.bg, borderColor: colors.badge.pink.border }]}>
            <Text style={[s.badgeText, { color: colors.badge.pink.text }]}>PENDING</Text>
          </View>
          <View style={[s.badge, { backgroundColor: colors.badge.success.bg, borderColor: colors.badge.success.border }]}>
            <Text style={[s.badgeText, { color: colors.badge.success.text }]}>CONFIRMED</Text>
          </View>
          <View style={[s.badge, { backgroundColor: colors.badge.warning.bg, borderColor: colors.badge.warning.border }]}>
            <Text style={[s.badgeText, { color: colors.badge.warning.text }]}>REVIEW</Text>
          </View>
          <View style={[s.badge, { backgroundColor: colors.badge.gray.bg, borderColor: colors.badge.gray.border }]}>
            <Text style={[s.badgeText, { color: colors.badge.gray.text }]}>CANCELLED</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// 10. ALERTS
// ---------------------------------------------------------------------------
function Alerts() {
  const alerts = [
    { type: 'info', icon: 'info', bg: colors.infoLight, border: colors.info, text: colors.info, message: 'Your profile is visible to companions in your city.' },
    { type: 'success', icon: 'check-circle', bg: colors.successLight, border: colors.success, text: colors.success, message: 'Booking confirmed! Check your messages for details.' },
    { type: 'error', icon: 'alert-circle', bg: colors.errorLight, border: colors.error, text: colors.error, message: 'Payment failed. Please update your payment method.' },
    { type: 'warning', icon: 'alert-triangle', bg: colors.warningLight, border: colors.warning, text: colors.warning, message: 'Your verification expires in 7 days. Please renew.' },
  ];

  return (
    <View style={{ gap: 12 }}>
      {alerts.map(alert => (
        <View
          key={alert.type}
          style={[s.alertBox, { backgroundColor: alert.bg, borderColor: alert.border }]}
        >
          <Feather name={alert.icon as any} size={18} color={alert.text} />
          <Text style={[typography.bodySmall, { color: alert.text, flex: 1, marginLeft: 10 }]}>
            {alert.message}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ===========================================================================
// MAIN EXPORT
// ===========================================================================
export function ComponentsStates() {
  return (
    <View style={s.root}>
      <StateSection title="HEADER VARIANTS" description="Public nav, auth nav, user nav">
        <HeaderVariants />
      </StateSection>

      <StateSection title="BOTTOM TAB BAR" description="5 tabs: Discover, Matches, Chat, Events, Profile">
        <BottomTabBar />
      </StateSection>

      <StateSection title="BURGER / DRAWER MENU" description="Slide-out navigation">
        <BurgerDrawer />
      </StateSection>

      <StateSection title="SEARCH / FILTER" description="City, age range, interests">
        <SearchFilter />
      </StateSection>

      <StateSection title="TEXT INPUTS" description="Default, focused, error, disabled">
        <TextInputStates />
      </StateSection>

      <StateSection title="BUTTONS" description="Primary, secondary, ghost, disabled + icon variants">
        <ButtonVariants />
      </StateSection>

      <StateSection title="SELECT / DROPDOWN" description="Custom dropdown with check indicator">
        <SelectDropdown />
      </StateSection>

      <StateSection title="CARDS" description="Profile card, event card">
        <Cards />
      </StateSection>

      <StateSection title="BADGES / CHIPS" description="Interest tags, verified badge, online status">
        <BadgesChips />
      </StateSection>

      <StateSection title="ALERTS" description="Info, success, error, warning">
        <Alerts />
      </StateSection>
    </View>
  );
}

// ===========================================================================
// STYLES
// ===========================================================================
const s = StyleSheet.create({
  root: { paddingVertical: 16, width: '100%' },

  subLabel: {
    ...typography.label,
    color: colors.textMuted,
    marginBottom: 8,
  },

  // Header
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerLink: { paddingHorizontal: 8, paddingVertical: 4 },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },

  // Tab bar
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    gap: 2,
  },
  tabItemActive: {
    borderTopWidth: 3,
    borderTopColor: colors.primary,
  },
  tabLabel: {
    ...typography.caption,
    fontSize: 10,
  },

  // Drawer
  drawerPanel: {
    marginTop: 12,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    ...shadows.md,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },

  // Search / filter
  searchInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    ...typography.body,
    flex: 1,
    paddingVertical: 10,
    color: colors.text,
  },
  ageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: colors.textInverse,
  },

  // Inputs
  inputLabel: { ...typography.label, color: colors.textMuted, marginBottom: 4 },
  inputDefault: {
    ...typography.body,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  inputFocused: { borderColor: colors.primary },
  inputError: { borderColor: colors.error },
  inputErrorText: { ...typography.caption, color: colors.error, marginTop: 4 },
  inputDisabled: { backgroundColor: colors.borderLight, color: colors.textLight },

  // Buttons
  btnBase: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  btnSmall: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnPrimary: { backgroundColor: colors.primary },
  btnSecondary: { backgroundColor: colors.surface },
  btnGhost: { backgroundColor: 'transparent', borderColor: 'transparent' },
  btnDisabledStyle: { backgroundColor: colors.borderLight, borderColor: colors.borderLight },
  btnText: { ...typography.button },
  btnRowSmall: { flexDirection: 'row', gap: 12 },

  // Select / dropdown
  selectTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownList: {
    marginTop: 4,
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    ...shadows.md,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  dropdownItemActive: {
    backgroundColor: colors.badge.pink.bg,
  },

  // Cards
  card: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
  },
  cardImagePlaceholder: {
    height: 140,
    backgroundColor: colors.backgroundWarm,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  cardBody: { padding: 16 },
  cardNameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cardLocationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  verifiedBadge: {
    width: 22,
    height: 22,
    borderRadius: borderRadius.full,
    backgroundColor: colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Badges
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.border,
  },
  badgeText: { ...typography.label, fontSize: 10 },

  // Status
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  // Alerts
  alertBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: borderRadius.sm,
    borderWidth: borderWidth.normal,
  },
});
