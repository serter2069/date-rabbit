import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3500";

const STEPS = [
  { num: 1, label: "Government ID" },
  { num: 2, label: "Selfie" },
  { num: 3, label: "Identity Check" },
  { num: 4, label: "Consent" },
];

export default function SeekerVerifyIntroScreen() {
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [alreadyStarted, setAlreadyStarted] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/api/verification/status`)
      .then((r) => r.json())
      .then((data) => {
        if (data.status && data.status !== "pending") {
          setAlreadyStarted(true);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 bg-[#FBF9FA] items-center justify-center">
        <ActivityIndicator color="#C52660" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerStyle={{ flexGrow: 1, maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
      <View className="flex-1 items-center px-6 py-12 max-w-lg w-full self-center">
        {/* Header */}
        <Text className="text-3xl font-bold text-[#201317] text-center mb-3">
          Identity Verification
        </Text>
        <Text className="text-base text-[#81656E] text-center mb-10 leading-6">
          We verify all seekers to ensure companion safety and build a trusted community.
        </Text>

        {alreadyStarted && (
          <View className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-6 w-full">
            <Text className="text-sm text-amber-700 font-medium">
              You have a verification in progress. You can continue from where you left off.
            </Text>
          </View>
        )}

        {/* Steps list */}
        <View className="w-full bg-white rounded-2xl p-5 mb-8">
          {STEPS.map((step, idx) => (
            <View
              key={step.num}
              className={`flex-row items-center py-3 ${idx < STEPS.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <View className="w-8 h-8 rounded-full bg-[#C52660] items-center justify-center mr-4">
                <Text className="text-white text-sm font-bold">{step.num}</Text>
              </View>
              <Text className="text-base text-[#201317] font-medium">{step.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View className="w-full mb-4">
          <Button
            label="Start Verification"
            onPress={() => router.push("/(seeker-verify)/photo-id")}
            variant="primary"
            size="lg"
            fullWidth
          />
        </View>

        {/* Exit link */}
        <Pressable onPress={() => router.back()} className="py-3">
          <Text className="text-base text-[#81656E]">I'll do this later</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
