import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface Props {
  title: string;
  route: string;
  children: React.ReactNode;
}

export function ProtoLayout({ title, route, children }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.route}>{route}</Text>
      </View>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA' },
  content: { paddingBottom: 60 },
  header: {
    backgroundColor: '#000000',
    padding: 16,
    marginBottom: 24,
  },
  title: { fontSize: 18, fontWeight: '900', color: '#FFFFFF' },
  route: { fontSize: 12, color: '#999999', fontFamily: 'monospace', marginTop: 2 },
});
