import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors, borderRadius } from '../../constants/theme';

type ImageType = 'avatar' | 'photo' | 'document' | 'illustration' | 'banner';

interface Props {
  type?: ImageType;
  width?: DimensionValue;
  height?: DimensionValue;
  label?: string;
}

const TYPE_CONFIG: { icon: keyof typeof Feather.glyphMap; color: string; bg: string; label: string }[] = {
  avatar: { icon: 'user', color: colors.primary, bg: colors.badge.pink.bg, label: 'Avatar' },
  photo: { icon: 'image', color: colors.accent, bg: colors.infoLight, label: 'Photo' },
  document: { icon: 'file-text', color: colors.warning, bg: colors.warningLight, label: 'Document' },
  illustration: { icon: 'star', color: '#7B61FF', bg: '#F0EEFF', label: 'Illustration' },
  banner: { icon: 'maximize', color: colors.success, bg: colors.successLight, label: 'Banner' },
};

export function ProtoPlaceholderImage({ type = 'photo', width = 80, height = 80, label }: Props) {
  const config = TYPE_CONFIG[type];
  return (
    <View style={[styles.container, { width, height, backgroundColor: config.bg }]}>
      <Feather name={config.icon} size={24} color={config.color} />
      <Text style={[styles.label, { color: config.color }]}>{label || config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
});
