import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius, borderWidth, shadows } from '../../../constants/theme';
import { StateSection } from '../StateSection';
import { pageRegistry } from '../../../constants/pageRegistry';

// Count pages by status
function getProgress() {
  const total = pageRegistry.length;
  const proto = pageRegistry.filter(p => p.qaCycles && p.qaCycles < 5).length;
  const review = pageRegistry.filter(p => p.status === 'review').length;
  const approved = pageRegistry.filter(p => p.status === 'approved').length;
  return { total, proto, review, approved };
}

export function OverviewStates() {
  const progress = getProgress();
  const pct = Math.round(((progress.review + progress.approved) / progress.total) * 100);

  return (
    <StateSection title="PROJECT_OVERVIEW" description="DateRabbit — Project overview, roles and flows">
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          {/* Header */}
          <View style={styles.heroCard}>
            <Text style={styles.title}>DateRabbit</Text>
            <Text style={styles.tagline}>Real dates. Real connection.</Text>
            <Text style={styles.subtitle}>
              Premium companion dating platform. Companions set their price, Seekers book and pay. USA, 21+ only.
            </Text>
          </View>

          {/* Progress */}
          <View style={styles.progressCard}>
            <Text style={styles.sectionTitle}>Progress</Text>
            <View style={styles.progressRow}>
              <Text style={styles.progressStat}>{progress.total} pages</Text>
              <Text style={styles.progressMeta}>
                {progress.proto} proto | {progress.review} review | {progress.approved} approved
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${pct}%` }]} />
            </View>
            <Text style={styles.progressPct}>{pct}% complete</Text>
          </View>

          {/* Roles */}
          <Text style={styles.sectionTitle}>Roles</Text>
          <View style={styles.roleCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.roleBadge, { backgroundColor: colors.accent }]}>
                <Text style={styles.roleBadgeText}>SEEKER</Text>
              </View>
              <Text style={styles.rolePages}>{pageRegistry.filter(p => p.nav === 'seeker').length} screens</Text>
            </View>
            <Text style={styles.roleDesc}>Man looking for a companion date. Pays, books, verified via Stripe Identity + fingerprint.</Text>
          </View>
          <View style={styles.roleCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.roleBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.roleBadgeText}>COMPANION</Text>
              </View>
              <Text style={styles.rolePages}>{pageRegistry.filter(p => p.nav === 'companion').length} screens</Text>
            </View>
            <Text style={styles.roleDesc}>Woman offering paid dates. Sets price, controls schedule, receives same-day Stripe payouts.</Text>
          </View>
          <View style={styles.roleCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.roleBadge, { backgroundColor: colors.textMuted }]}>
                <Text style={styles.roleBadgeText}>GUEST</Text>
              </View>
              <Text style={styles.rolePages}>1 screen</Text>
            </View>
            <Text style={styles.roleDesc}>Unauthenticated visitor. Sees landing page only.</Text>
          </View>
          <View style={styles.roleCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={[styles.roleBadge, { backgroundColor: colors.warning }]}>
                <Text style={styles.roleBadgeText}>ADMIN</Text>
              </View>
              <Text style={styles.rolePages}>{pageRegistry.filter(p => p.nav === 'admin').length} screens</Text>
            </View>
            <Text style={styles.roleDesc}>Platform moderator. Manages users, cities, verifications, disputes.</Text>
          </View>

          {/* Flows */}
          <Text style={styles.sectionTitle}>Flows</Text>
          <View style={styles.flowCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Feather name="arrow-right" size={14} color={colors.accent} />
              <Text style={styles.flowTitle}>Seeker Happy Path</Text>
            </View>
            <View style={styles.flowStepRow}>
              {['landing', 'auth-welcome', 'auth-login', 'auth-otp', 'auth-role-select', 'auth-profile-setup', 'verify-intro', 'seeker-home'].map((id, i, arr) => (
                <React.Fragment key={id}>
                  <FlowLink id={id} />
                  {i < arr.length - 1 && <Feather name="chevron-right" size={10} color={colors.textLight} />}
                </React.Fragment>
              ))}
            </View>
          </View>
          <View style={styles.flowCard}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Feather name="arrow-right" size={14} color={colors.primary} />
              <Text style={styles.flowTitle}>Companion Happy Path</Text>
            </View>
            <View style={styles.flowStepRow}>
              {['landing', 'auth-welcome', 'auth-login', 'auth-otp', 'auth-role-select', 'auth-profile-setup', 'comp-onboard-step2', 'comp-home'].map((id, i, arr) => (
                <React.Fragment key={id}>
                  <FlowLink id={id} />
                  {i < arr.length - 1 && <Feather name="chevron-right" size={10} color={colors.textLight} />}
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* Tech Stack */}
          <Text style={styles.sectionTitle}>Tech Stack</Text>
          <View style={styles.techRow}>
            {[
              { icon: 'smartphone', label: 'React Native + Expo 52' },
              { icon: 'server', label: 'NestJS + PostgreSQL' },
              { icon: 'credit-card', label: 'Stripe Connect Express' },
              { icon: 'mail', label: 'Email OTP Auth' },
              { icon: 'pen-tool', label: 'Space Grotesk Font' },
              { icon: 'layers', label: 'Neo-Brutalism Design' },
            ].map(t => (
              <View key={t.label} style={styles.techChip}>
                <Feather name={t.icon as any} size={14} color={colors.primary} />
                <Text style={styles.techLabel}>{t.label}</Text>
              </View>
            ))}
          </View>

          {/* Pages list by group */}
          <Text style={styles.sectionTitle}>All Pages ({pageRegistry.length})</Text>
          {Array.from(new Set(pageRegistry.map(p => p.group))).map(group => {
            const pages = pageRegistry.filter(p => p.group === group);
            return (
              <View key={group} style={styles.groupCard}>
                <Text style={styles.groupTitle}>{group}</Text>
                {pages.map(p => (
                  <Pressable key={p.id} style={styles.pageRow} onPress={() => {
                    if (Platform.OS === 'web') {
                      window.open(`/proto/states/${p.id}`, '_self');
                    }
                  }}>
                    <Feather name="file" size={12} color={colors.textMuted} />
                    <Text style={styles.pageName}>{p.title}</Text>
                    <Text style={styles.pageMeta}>{p.stateCount} states</Text>
                    <View style={[styles.statusDot, {
                      backgroundColor: p.status === 'review' ? colors.warning : p.status === 'approved' ? colors.success : colors.textLight,
                    }]} />
                  </Pressable>
                ))}
              </View>
            );
          })}
        </ScrollView>
      </View>
    </StateSection>
  );
}

function FlowLink({ id }: { id: string }) {
  const entry = pageRegistry.find(p => p.id === id);
  return (
    <Pressable onPress={() => {
      if (Platform.OS === 'web') {
        window.open(`/proto/states/${id}`, '_self');
      }
    }}>
      <Text style={styles.flowLink}>{entry?.title || id}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: Platform.OS === 'web' ? ('100vh' as any) : 844, backgroundColor: colors.background },
  content: { padding: spacing.lg, maxWidth: 600 },
  heroCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...shadows.md as any,
  },
  title: { ...typography.h1, color: colors.text, marginBottom: spacing.xs },
  tagline: { ...typography.h3, color: colors.primary, marginBottom: spacing.sm },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.xl },

  progressCard: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressStat: { ...typography.h3, color: colors.text },
  progressMeta: { ...typography.caption, color: colors.textMuted },
  progressBar: {
    height: 8,
    backgroundColor: colors.backgroundWarm,
    borderRadius: borderRadius.full,
    borderWidth: borderWidth.thin,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.full,
  },
  progressPct: { ...typography.caption, color: colors.textMuted, marginTop: 4 },

  sectionTitle: { ...typography.h3, color: colors.text, marginBottom: spacing.sm, marginTop: spacing.lg },

  roleCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.xs,
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleBadgeText: { ...typography.label, color: colors.textInverse, fontSize: 10 },
  roleDesc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 4 },
  rolePages: { ...typography.caption, color: colors.textMuted },

  flowCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  flowTitle: { ...typography.bodyMedium, color: colors.text },
  flowStepRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4 },
  flowLink: { ...typography.caption, color: colors.primary, textDecorationLine: 'underline' },

  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  techChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.backgroundWarm,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  techLabel: { ...typography.caption, color: colors.text },

  groupCard: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  groupTitle: { ...typography.bodyMedium, color: colors.text, marginBottom: 4 },
  pageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  pageName: { ...typography.bodySmall, color: colors.textSecondary, flex: 1 },
  pageMeta: { ...typography.caption, color: colors.textLight },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  item: { ...typography.bodySmall, color: colors.textMuted, marginBottom: spacing.xs, paddingLeft: spacing.md },
});
