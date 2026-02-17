import React, { useState } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Icon } from './Icon';
import { useTheme } from '../constants/theme';

interface UserImageProps {
  uri?: string | null;
  name?: string;
  size?: number;
  style?: ViewStyle;
  borderRadius?: number;
  showVerified?: boolean;
}

const blurhash = '|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7teleadaye@j[j[j[ayfQj[ayayayj[ayfjayj[aeayj[j[j[fQay';

export function UserImage({
  uri,
  name,
  size = 72,
  style,
  borderRadius,
  showVerified = false,
}: UserImageProps) {
  const { colors, spacing } = useTheme();
  const [hasError, setHasError] = useState(false);

  const actualBorderRadius = borderRadius ?? size / 2;

  // Get initials from name
  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || '?';
  };

  const styles = StyleSheet.create({
    container: {
      width: size,
      height: size,
      borderRadius: actualBorderRadius,
      overflow: 'hidden',
      position: 'relative',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    placeholder: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    initialsText: {
      fontSize: size * 0.4,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    verifiedBadge: {
      position: 'absolute',
      bottom: 0,
      right: 0,
      width: size * 0.3,
      height: size * 0.3,
      borderRadius: size * 0.15,
      backgroundColor: colors.success,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors.background,
    },
  });

  const showPlaceholder = !uri || hasError;

  return (
    <View style={[styles.container, style]}>
      {showPlaceholder ? (
        <View style={styles.placeholder}>
          <Icon
            name="user"
            size={size * 0.5}
            color={colors.textMuted}
          />
        </View>
      ) : (
        <Image
          source={{ uri }}
          style={styles.image}
          placeholder={blurhash}
          contentFit="cover"
          transition={250}
          onError={() => setHasError(true)}
        />
      )}
      {showVerified && (
        <View style={styles.verifiedBadge}>
          <Icon
            name="check"
            size={size * 0.18}
            color={colors.white}
            strokeWidth={3}
          />
        </View>
      )}
    </View>
  );
}
