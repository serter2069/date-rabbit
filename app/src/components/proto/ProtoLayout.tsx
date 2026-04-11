import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { colors } from '../../constants/theme';

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
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: 60 },
});
