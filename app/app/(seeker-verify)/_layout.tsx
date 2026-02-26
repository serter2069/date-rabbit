import { Stack } from 'expo-router';
import { colors } from '../../src/constants/theme';

export default function SeekerVerifyLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="intro" />
      <Stack.Screen name="ssn" />
      <Stack.Screen name="photo-id" />
      <Stack.Screen name="selfie" />
      <Stack.Screen name="consent" />
      <Stack.Screen name="pending" />
      <Stack.Screen name="approved" />
    </Stack>
  );
}
