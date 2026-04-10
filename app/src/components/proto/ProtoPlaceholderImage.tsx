import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { User, Image as ImageIcon, FileText, Star, Maximize2 } from 'lucide-react-native';

type ImageType = 'avatar' | 'photo' | 'document' | 'illustration' | 'banner';

interface Props {
  type?: ImageType;
  width?: DimensionValue;
  height?: DimensionValue;
  label?: string;
}

const TYPE_CONFIG = {
  avatar: { icon: User, color: '#FF2A5F', bg: '#FFF0F3', label: 'Avatar' },
  photo: { icon: ImageIcon, color: '#4DF0FF', bg: '#E8FFFE', label: 'Photo' },
  document: { icon: FileText, color: '#F9A825', bg: '#FEF3C7', label: 'Document' },
  illustration: { icon: Star, color: '#7B61FF', bg: '#F0EEFF', label: 'Illustration' },
  banner: { icon: Maximize2, color: '#4CAF50', bg: '#D1FAE5', label: 'Banner' },
};

export function ProtoPlaceholderImage({ type = 'photo', width = 80, height = 80, label }: Props) {
  const config = TYPE_CONFIG[type];
  const Icon = config.icon;
  return (
    <View style={[styles.container, { width, height, backgroundColor: config.bg }]}>
      <Icon size={24} color={config.color} />
      <Text style={[styles.label, { color: config.color }]}>{label || config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: '#000000',
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: { fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
});
