import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  value?: string;
  accent?: boolean;
}

export function ProtoCard({ label, value, accent }: Props) {
  return (
    <View style={[styles.card, accent && styles.accent]}>
      <Text style={styles.label}>{label}</Text>
      {value && <Text style={styles.value}>{value}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  accent: { backgroundColor: '#FF2A5F' },
  label: { fontSize: 12, fontWeight: '700', color: '#666666', textTransform: 'uppercase' },
  value: { fontSize: 18, fontWeight: '900', color: '#000000', marginTop: 4 },
});
