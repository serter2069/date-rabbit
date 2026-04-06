import { Stack } from 'expo-router';
import { colors } from '../../src/constants/theme';

export default function CompOnboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="step2" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="pending" />
      <Stack.Screen name="approved" />
    </Stack>
  );
}
