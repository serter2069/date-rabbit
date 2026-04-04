import { Stack } from 'expo-router';
import { typography } from '../../src/constants/theme';

export default function DateLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerStyle: { backgroundColor: '#F4F0EA' },
        headerTintColor: '#000',
        headerTitleStyle: { fontFamily: typography.fonts.heading, fontWeight: '700' },
        headerShadowVisible: false,
        headerBackTitle: '',
        contentStyle: { backgroundColor: '#F4F0EA' },
      }}
    />
  );
}
