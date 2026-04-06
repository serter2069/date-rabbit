import { Stack } from 'expo-router';
import { colors, typography } from '../../src/constants/theme';

export default function DateLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: '#000',
        headerTitleStyle: { fontFamily: typography.fonts.heading, fontWeight: '700' },
        headerShadowVisible: false,
        headerBackTitle: '',
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
