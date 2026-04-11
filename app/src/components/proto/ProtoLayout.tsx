import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';

interface Props {
  title: string;
  route: string;
  children: React.ReactNode;
}

export function ProtoLayout({ children }: Props) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA' },
  content: { paddingBottom: 60 },
});
