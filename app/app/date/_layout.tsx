import { Stack } from 'expo-router';

export default function DateLayout() {
  return (
    <Stack
      screenOptions={{
        animation: 'slide_from_right',
        headerStyle: { backgroundColor: '#F4F0EA' },
        headerTintColor: '#000',
        headerTitleStyle: { fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700' },
        headerShadowVisible: false,
        headerBackTitle: '',
        contentStyle: { backgroundColor: '#F4F0EA' },
      }}
    />
  );
}
