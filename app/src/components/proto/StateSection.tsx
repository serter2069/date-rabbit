import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function StateSection({ title, description, children }: Props) {
  const webProps = Platform.OS === 'web' ? { 'data-state-name': title } : {};

  return (
    <View {...webProps} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {description && <Text style={styles.description}>{description}</Text>}
      </View>
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 32 },
  header: {
    backgroundColor: '#000000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 12, fontWeight: '700', color: '#4DF0FF', textTransform: 'uppercase', letterSpacing: 1 },
  description: { fontSize: 12, color: '#999999', flex: 1 },
  content: { paddingHorizontal: 16 },
});
