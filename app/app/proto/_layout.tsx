import { Stack } from 'expo-router';

export default function ProtoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="states/[page]" />
      <Stack.Screen name="brand" />
    </Stack>
  );
}
