import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../src/constants/theme';

// Navigation is handled by NavigationGuard in _layout.tsx
export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});
