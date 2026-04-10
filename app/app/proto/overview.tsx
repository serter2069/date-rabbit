import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { pageRegistry } from '../../src/constants/pageRegistry';
import { protoMeta } from '../../src/constants/protoMeta';
import { colors } from '../../src/constants/theme';

const ROLE_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  seeker: 'search',
  companion: 'heart',
  guest: 'eye',
  admin: 'shield',
};

const TECH_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  frontend: 'smartphone',
  backend: 'server',
  payments: 'credit-card',
  auth: 'lock',
  icons: 'feather',
  styling: 'layout',
};

function StatusBadge({ text }: { text: string }) {
  return (
    <View style={styles.statusBadge}>
      <Feather name="check-circle" size={14} color={colors.success} />
      <Text style={styles.statusBadgeText}>{text}</Text>
    </View>
  );
}

function RoleCard({ role }: { role: typeof protoMeta.roles[0] }) {
  const icon = ROLE_ICONS[role.id] || 'user';
  return (
    <View style={[styles.roleCard, { borderLeftColor: role.color, borderLeftWidth: 5 }]}>
      <View style={styles.roleHeader}>
        <Feather name={icon} size={18} color={role.color} />
        <Text style={styles.roleTitle}>{role.name}</Text>
      </View>
      <Text style={styles.roleDesc}>{role.description}</Text>
    </View>
  );
}

function TechStackCard() {
  const entries = Object.entries(protoMeta.techStack) as [string, string][];
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Tech Stack</Text>
      <View style={styles.techGrid}>
        {entries.map(([key, value]) => {
          const icon = TECH_ICONS[key] || 'code';
          return (
            <View key={key} style={styles.techRow}>
              <Feather name={icon} size={14} color={colors.textMuted} />
              <Text style={styles.techLabel}>{key}</Text>
              <Text style={styles.techValue}>{value}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function FlowSection({ flow }: { flow: typeof protoMeta.flows[0] }) {
  return (
    <View style={styles.flowContainer}>
      <Text style={styles.flowTitle}>{flow.name}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flowScroll}>
        {flow.steps.map((stepId, i) => {
          const page = pageRegistry.find(p => p.id === stepId);
          const label = page?.title || stepId;
          return (
            <View key={stepId} style={styles.flowStepRow}>
              <Pressable
                style={styles.flowStep}
                onPress={() => router.push(`/proto/states/${stepId}` as any)}
              >
                <Text style={styles.flowStepNum}>{i + 1}</Text>
                <Text style={styles.flowStepLabel} numberOfLines={2}>{label}</Text>
              </Pressable>
              {i < flow.steps.length - 1 && (
                <View style={styles.flowArrow}>
                  <Feather name="chevron-right" size={16} color={colors.textMuted} />
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

function StatsSection() {
  const totalPages = pageRegistry.length;
  const totalStates = pageRegistry.reduce((sum, p) => sum + p.stateCount, 0);
  const groups = new Set(pageRegistry.map(p => p.group));

  const stats = [
    { label: 'Pages', value: totalPages, icon: 'file' as const },
    { label: 'States', value: totalStates, icon: 'layers' as const },
    { label: 'Groups', value: groups.size, icon: 'grid' as const },
  ];

  return (
    <View style={styles.statsRow}>
      {stats.map(s => (
        <View key={s.label} style={styles.statCard}>
          <Feather name={s.icon} size={20} color={colors.primary} />
          <Text style={styles.statValue}>{s.value}</Text>
          <Text style={styles.statLabel}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}

function GroupLinks() {
  const groupSet = new Set(pageRegistry.map(p => p.group));
  const groups = Array.from(groupSet);

  const GROUP_LABELS: Record<string, string> = {
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

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Page Groups</Text>
      <View style={styles.groupGrid}>
        {groups.map(group => {
          const count = pageRegistry.filter(p => p.group === group).length;
          return (
            <Pressable
              key={group}
              style={styles.groupCard}
              onPress={() => router.push('/proto' as any)}
            >
              <Text style={styles.groupCardTitle}>{GROUP_LABELS[group] || group}</Text>
              <Text style={styles.groupCardCount}>{count} pages</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function ProtoOverview() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.push('/proto' as any)}>
          <Feather name="arrow-left" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.title}>{protoMeta.projectName} Proto</Text>
        <Text style={styles.tagline}>{protoMeta.tagline}</Text>
        <StatusBadge text={protoMeta.status} />
        <Text style={styles.description}>{protoMeta.description}</Text>
        <Text style={styles.market}>
          <Feather name="map-pin" size={12} color={colors.textMuted} /> {protoMeta.market}
        </Text>
      </View>

      {/* Roles */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Roles</Text>
        <View style={styles.rolesGrid}>
          {protoMeta.roles.map(role => (
            <RoleCard key={role.id} role={role} />
          ))}
        </View>
      </View>

      {/* Tech Stack */}
      <TechStackCard />

      {/* Flows */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Happy Paths</Text>
        {protoMeta.flows.map(flow => (
          <FlowSection key={flow.id} flow={flow} />
        ))}
      </View>

      {/* Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Coverage</Text>
        <StatsSection />
      </View>

      {/* Group Links */}
      <GroupLinks />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingBottom: 60 },

  // Header
  header: { marginBottom: 32 },
  backBtn: {
    width: 40,
    height: 40,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  title: { fontSize: 32, fontWeight: '900', color: colors.text, letterSpacing: -1 },
  tagline: { fontSize: 16, color: colors.textSecondary, marginTop: 4, fontStyle: 'italic' },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successLight,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
  statusBadgeText: { fontSize: 12, fontWeight: '700', color: colors.success },
  description: { fontSize: 14, color: colors.textSecondary, marginTop: 12, lineHeight: 20 },
  market: { fontSize: 12, color: colors.textMuted, marginTop: 8 },

  // Section
  section: { marginBottom: 32 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
    paddingBottom: 8,
  },

  // Roles
  rolesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    width: Platform.OS === 'web' ? '48%' : '47%',
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  roleHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  roleTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  roleDesc: { fontSize: 12, color: colors.textSecondary, lineHeight: 16 },

  // Tech Stack
  techGrid: { gap: 8 },
  techRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  techLabel: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', width: 80 },
  techValue: { fontSize: 13, color: colors.text, flex: 1 },

  // Flows
  flowContainer: { marginBottom: 20 },
  flowTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: 10 },
  flowScroll: { alignItems: 'center', paddingVertical: 4 },
  flowStepRow: { flexDirection: 'row', alignItems: 'center' },
  flowStep: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 10,
    width: 100,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  flowStepNum: { fontSize: 10, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  flowStepLabel: { fontSize: 11, fontWeight: '600', color: colors.text, textAlign: 'center' },
  flowArrow: { paddingHorizontal: 4 },

  // Stats
  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    shadowColor: colors.shadow,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  statValue: { fontSize: 28, fontWeight: '900', color: colors.text, marginTop: 8 },
  statLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', marginTop: 4 },

  // Group Links
  groupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  groupCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.shadow,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  groupCardTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  groupCardCount: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
