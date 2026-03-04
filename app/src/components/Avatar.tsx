import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, borderRadius, borderWidth } from '../constants/theme';

interface AvatarProps {
  uri?: string;
  name?: string;
  size?: number;
  verified?: boolean;
}

export function Avatar({ uri, name, size = 48, verified = false }: AvatarProps) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {uri ? (
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
        </View>
      )}
      {verified && (
        <View style={[styles.badge, { right: 0, bottom: 0 }]}>
          <Check size={10} color={colors.white} strokeWidth={3} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    backgroundColor: colors.surface,
    borderWidth: borderWidth.normal,
    borderColor: colors.black,
  },
  placeholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: borderWidth.normal,
    borderColor: colors.black,
  },
  initials: {
    color: colors.white,
    fontWeight: '600',
  },
  badge: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.white,
  },
});

