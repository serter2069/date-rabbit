import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, Switch, StyleSheet , ScrollView, useWindowDimensions} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StateSection } from '../StateSection';
import { ProtoHeader, ProtoTabBar } from '../NavComponents';
import { colors, typography, borderRadius, shadows } from '../../../constants/theme';


// ---------------------------------------------------------------------------
// PageShell
// ---------------------------------------------------------------------------
function PageShell({ children }: { children: React.ReactNode }) {
  const { width: screenWidth } = useWindowDimensions();
  const isMobile = screenWidth < 768;
  return (
    <View style={{ minHeight: 844, flex: 1, backgroundColor: colors.background }}>
      <ProtoHeader variant="admin" />
      <ScrollView style={{ flex: 1 }}>
        <View style={{ flex: 1, maxWidth: 960, width: '100%', alignSelf: 'center', paddingHorizontal: isMobile ? 16 : 48 }}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------
const CITIES = [
  { name: 'New York', companions: 127, active: true },
  { name: 'Los Angeles', companions: 89, active: true },
  { name: 'Miami', companions: 64, active: true },
  { name: 'Chicago', companions: 45, active: true },
  { name: 'Las Vegas', companions: 38, active: false },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function CityRow({ name, companions, active, isLast }: { name: string; companions: number; active: boolean; isLast?: boolean }) {
  return (
    <View style={[s.cityRow, !isLast && s.cityRowBorder]}>
      <View style={s.cityInfo}>
        <Text style={s.cityName}>{name}</Text>
        <Text style={s.cityCompanions}>{companions} companions</Text>
      </View>
      <View style={[s.statusBadge, active ? s.statusActive : s.statusInactive]}>
        <Text style={[s.statusText, active ? s.statusActiveText : s.statusInactiveText]}>
          {active ? 'Active' : 'Inactive'}
        </Text>
      </View>
      <Pressable style={s.editBtn}>
        <Feather name={"edit-2" as any} size={14} color={colors.text} />
        <Text style={s.editBtnText}>Edit</Text>
      </Pressable>
      <Pressable>
        <Text style={[s.toggleLink, active ? s.disableLink : s.enableLink]}>
          {active ? 'Disable' : 'Enable'}
        </Text>
      </Pressable>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 1: DEFAULT
// ---------------------------------------------------------------------------
function DefaultState() {
  const [search, setSearch] = useState('');

  return (
    <View style={s.page}>
      <View style={s.headerRow}>
        <Text style={s.pageTitle}>City Management</Text>
        <Pressable style={[s.addBtn, shadows.sm]}>
          <Feather name={"plus" as any} size={16} color={colors.textInverse} />
          <Text style={s.addBtnText}>Add City</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={[s.searchBar, shadows.sm]}>
        <Feather name={"search" as any} size={16} color={colors.textMuted} />
        <TextInput
          style={s.searchInput}
          placeholder="Search cities..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* City list */}
      <View style={[s.card, shadows.sm]}>
        {CITIES.map((city, i) => (
          <CityRow
            key={city.name}
            name={city.name}
            companions={city.companions}
            active={city.active}
            isLast={i === CITIES.length - 1}
          />
        ))}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STATE 2: ADD CITY MODAL
// ---------------------------------------------------------------------------
function AddCityModalState() {
  const [cityName, setCityName] = useState('');
  const [stateName, setStateName] = useState('');
  const [isActive, setIsActive] = useState(true);

  return (
    <View style={s.page}>
      <View style={s.headerRow}>
        <Text style={s.pageTitle}>City Management</Text>
      </View>

      {/* Modal overlay card */}
      <View style={[s.modalCard, shadows.md]}>
        <Text style={s.modalTitle}>Add New City</Text>

        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>City Name</Text>
          <TextInput
            style={[s.input, shadows.sm]}
            placeholder="Enter city name..."
            placeholderTextColor={colors.textLight}
            value={cityName}
            onChangeText={setCityName}
          />
        </View>

        <View style={s.fieldGroup}>
          <Text style={s.fieldLabel}>State</Text>
          <TextInput
            style={[s.input, shadows.sm]}
            placeholder="State..."
            placeholderTextColor={colors.textLight}
            value={stateName}
            onChangeText={setStateName}
          />
        </View>

        <View style={s.toggleRow}>
          <Text style={s.fieldLabel}>Active</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: colors.borderLight, true: colors.primary }}
            thumbColor={colors.surface}
          />
        </View>

        <Pressable style={[s.primaryBtn, shadows.button]}>
          <Text style={s.primaryBtnText}>ADD CITY</Text>
        </Pressable>

        <Pressable style={[s.ghostBtn, shadows.sm]}>
          <Text style={s.ghostBtnText}>Cancel</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// MAIN EXPORT
// ---------------------------------------------------------------------------
export function AdminCitiesStates() {
  return (
    <View style={s.root}>
      <StateSection title="DEFAULT" description="City management list">
        <PageShell><DefaultState /></PageShell>
      </StateSection>
      <StateSection title="ADD_CITY_MODAL" description="Add new city form">
        <PageShell><AddCityModalState /></PageShell>
      </StateSection>
    </View>
  );
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------
const s = StyleSheet.create({
  root: { paddingVertical: 16 },
  page: { gap: 16 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pageTitle: { ...typography.h2, color: colors.text },

  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addBtnText: { ...typography.caption, color: colors.textInverse, fontWeight: '700' },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { ...typography.body, color: colors.text, flex: 1, padding: 0 },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },

  cityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cityRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
  cityInfo: { flex: 1 },
  cityName: { ...typography.bodyMedium, color: colors.text },
  cityCompanions: { ...typography.caption, color: colors.textMuted },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.border,
  },
  statusActive: { backgroundColor: colors.successLight },
  statusInactive: { backgroundColor: colors.borderLight },
  statusText: { ...typography.caption, fontWeight: '700', fontSize: 10 },
  statusActiveText: { color: colors.success },
  statusInactiveText: { color: colors.textMuted },

  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editBtnText: { ...typography.caption, color: colors.text },

  toggleLink: { ...typography.caption, fontWeight: '700' },
  disableLink: { color: colors.textMuted },
  enableLink: { color: colors.primary },

  // Modal
  modalCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: 20,
    gap: 16,
  },
  modalTitle: { ...typography.h3, color: colors.text },

  fieldGroup: { gap: 4 },
  fieldLabel: { ...typography.bodyMedium, color: colors.text },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  primaryBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  primaryBtnText: { ...typography.button, color: colors.textInverse },

  ghostBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: 14,
  },
  ghostBtnText: { ...typography.button, color: colors.text },
});
