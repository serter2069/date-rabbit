import { Stack } from 'expo-router';
import { colors } from '../../src/constants/theme';

export default function CompOnboardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="step1" />
      <Stack.Screen name="step2" />
      <Stack.Screen name="verify" />
      <Stack.Screen name="video" />
      <Stack.Screen name="refs" />
      <Stack.Screen name="pending" />
    </Stack>
  );
}
