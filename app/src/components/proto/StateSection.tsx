import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors } from '../../constants/theme';

interface Props {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function StateSection({ title, description, children }: Props) {
  const ref = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS === 'web' && ref.current) {
      (ref.current as unknown as HTMLElement).setAttribute('data-state-name', title);
    }
  }, [title]);

  return (
    <View ref={ref} style={styles.container}>
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
  container: { marginBottom: 80 },
  header: {
    backgroundColor: colors.black,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: { fontSize: 12, fontWeight: '700', color: colors.accent, textTransform: 'uppercase', letterSpacing: 1 },
  description: { fontSize: 12, color: colors.textLight, flex: 1 },
  content: { paddingHorizontal: 16 },
});
