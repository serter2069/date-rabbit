import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput, Platform } from 'react-native';
import { router } from 'expo-router';
import { Search } from 'lucide-react-native';
import { pageRegistry, PageEntry } from '../../src/constants/pageRegistry';
import { colors } from '../../src/constants/theme';

type PageGroup = 'Brand' | 'Landing' | 'Auth' | 'SeekerVerify' | 'CompanionOnboard' | 'SeekerDashboard' | 'CompanionDashboard' | 'Booking' | 'Date' | 'Chat' | 'Reviews' | 'Settings' | 'Admin';

const GROUPS: PageGroup[] = ['Brand', 'Landing', 'Auth', 'SeekerVerify', 'CompanionOnboard', 'SeekerDashboard', 'CompanionDashboard', 'Booking', 'Reviews', 'Settings', 'Admin'];

const GROUP_LABELS: Record<PageGroup, string> = {
  Brand: 'Brand & Styles',
  Landing: 'Landing',
  Auth: 'Auth',
  SeekerVerify: 'Seeker Verification',
  CompanionOnboard: 'Companion Onboarding',
  SeekerDashboard: 'Seeker Dashboard',
  CompanionDashboard: 'Companion Dashboard',
  Booking: 'Booking & Payment',
  Date: 'Date Flow',
  Chat: 'Chat',
  Reviews: 'Reviews',
  Settings: 'Settings',
  Admin: 'Admin',
};

type ProtoStatus = 'none' | 'proto' | 'approved';

const STATUS_COLORS: Record<ProtoStatus, string> = {
  none: '#999999',
  proto: '#F9A825',
  approved: '#4CAF50',
};

const STATUS_LABELS: Record<ProtoStatus, string> = {
  none: '[ ]',
  proto: '[proto]',
  approved: '[approved]',
};

function PageCard({ page }: { page: PageEntry }) {
  return (
    <Pressable
      style={styles.card}
      onPress={() => router.push(`/proto/states/${page.id}` as any)}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.statusBadge, { color: STATUS_COLORS[page.status] }]}>
          {STATUS_LABELS[page.status]}
        </Text>
        <Text style={[styles.statCount, { color: colors.textMuted }]}>
          {page.stateCount} states
        </Text>
      </View>
      <Text style={styles.cardTitle}>{page.title}</Text>
      <Text style={styles.cardRoute}>{page.route}</Text>
    </Pressable>
  );
}

export default function ProtoIndex() {
  const [search, setSearch] = useState('');
  const filtered = pageRegistry.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.id.includes(search.toLowerCase())
  );

  const total = pageRegistry.length;
  const done = pageRegistry.filter(p => p.status === 'approved').length;
  const inProto = pageRegistry.filter(p => p.status === 'proto').length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>DateRabbit Proto</Text>
        <Text style={styles.subtitle}>
          {done} approved · {inProto} in progress · {total - done - inProto} pending
        </Text>
      </View>

      <View style={styles.searchBox}>
        <Search size={16} color={colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search pages..."
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={colors.textMuted}
        />
      </View>

      {GROUPS.map(group => {
        const pages = filtered.filter(p => p.group === group);
        if (pages.length === 0) return null;
        return (
          <View key={group} style={styles.group}>
            <Text style={styles.groupLabel}>{GROUP_LABELS[group]}</Text>
            <View style={styles.grid}>
              {pages.map(page => <PageCard key={page.id} page={page} />)}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA' },
  content: { padding: 20, paddingBottom: 60 },
  header: { marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: '#000000', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#666666', marginTop: 4 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 24,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#000000' },
  group: { marginBottom: 32 },
  groupLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#000000',
    paddingBottom: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 14,
    width: Platform.OS === 'web' ? 220 : '47%' as any,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  statusBadge: { fontSize: 11, fontWeight: '700' },
  statCount: { fontSize: 11 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: '#000000', marginBottom: 4 },
  cardRoute: { fontSize: 11, color: '#999999', fontFamily: 'monospace' },
});
