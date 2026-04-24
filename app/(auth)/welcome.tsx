import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui";

export default function WelcomeScreen() {
  return (
    <View className="flex-1 bg-[#FBF9FA] justify-between px-6 py-16">
      {/* Logo + tagline */}
      <View className="flex-1 items-center justify-center gap-4">
        <View className="w-20 h-20 rounded-full bg-[#C52660] items-center justify-center mb-2">
          <Text className="text-4xl">🐇</Text>
        </View>
        <Text className="text-4xl font-extrabold text-[#201317] text-center leading-[48px]">
          DateRabbit
        </Text>
        <Text className="text-base text-[#81656E] text-center leading-6 max-w-xs">
          Find your perfect companion
        </Text>
      </View>

      {/* Buttons */}
      <View className="gap-3 w-full max-w-[480px] self-center">
        <Button
          label="Sign up"
          variant="primary"
          size="lg"
          fullWidth
          onPress={() => router.push("/(auth)/email")}
        />
        <Button
          label="Log in"
          variant="secondary"
          size="lg"
          fullWidth
          onPress={() => router.push("/(auth)/email")}
        />

        {/* Legal links */}
        <View className="flex-row justify-center gap-1 mt-2">
          <Pressable onPress={() => router.push("/(legal)/terms" as never)}>
            <Text className="text-sm text-[#81656E] underline">Terms</Text>
          </Pressable>
          <Text className="text-sm text-[#81656E]">·</Text>
          <Pressable onPress={() => router.push("/(legal)/privacy" as never)}>
            <Text className="text-sm text-[#81656E] underline">Privacy Policy</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
