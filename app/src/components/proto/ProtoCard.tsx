import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, shadows, borderRadius } from '../../constants/theme';

interface Props {
  label: string;
  value?: string;
  accent?: boolean;
}

export function ProtoCard({ label, value, accent }: Props) {
  return (
    <View style={[styles.card, accent && styles.accent, shadows.sm]}>
      <Text style={styles.label}>{label}</Text>
      {value && <Text style={styles.value}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    padding: 12,
  },
  accent: { backgroundColor: colors.primary },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  value: { fontSize: 18, fontWeight: '900', color: colors.text, marginTop: 4 },
});
