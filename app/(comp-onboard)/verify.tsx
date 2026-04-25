import { useState } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3500";

type State = "idle" | "processing" | "error";

export default function CompOnboardVerifyScreen() {
  const { width } = useWindowDimensions();
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const startCheck = async () => {
    setState("processing");
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/verification/stripe-identity/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to start identity check");
      }

      const data = await res.json();
      // In production: open Stripe Identity SDK with data.clientSecret
      console.log("[CompVerify] clientSecret:", data.clientSecret);

      router.replace("/(comp-onboard)/pending");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerStyle={{ flexGrow: 1, maxWidth: 1200, alignSelf: 'center', width: '100%', paddingBottom: 40 }}>
      <View className="flex-1 px-6 py-10 max-w-lg w-full self-center items-center">
        <Text className="text-2xl font-bold text-[#201317] mb-3 self-start">
          Identity Verification
        </Text>
        <Text className="text-base text-[#81656E] leading-6 mb-8 self-start">
          Required for companion approval. This process is quick and secure.
        </Text>

        <View className="w-24 h-24 rounded-full bg-[#FBF9FA] border-2 border-[#C52660] items-center justify-center mb-8">
          <Text className="text-5xl">🛡️</Text>
        </View>

        <View className="bg-white rounded-2xl p-5 w-full mb-8 gap-3">
          {[
            "Upload a government-issued ID",
            "Quick automated document check",
            "Your data is encrypted and secure",
          ].map((point, idx) => (
            <View key={idx} className="flex-row items-start">
              <Text className="text-[#059669] font-bold mr-3 mt-0.5">✓</Text>
              <Text className="flex-1 text-base text-[#201317]">{point}</Text>
            </View>
          ))}
        </View>

        {errorMsg && (
          <Text className="text-sm text-[#DC2626] mb-4 text-center">{errorMsg}</Text>
        )}

        <Button
          label={state === "processing" ? "Starting..." : "Start Identity Check"}
          onPress={startCheck}
          variant="primary"
          size="lg"
          fullWidth
          disabled={state === "processing"}
          loading={state === "processing"}
        />
      </View>
    </ScrollView>
  );
}
