import { useState } from "react";
import { View, Text, ScrollView, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3500";

type State = "idle" | "processing" | "error";

export default function StripeIdentityScreen() {
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
      // Here: simulate success
      console.log("[StripeIdentity] clientSecret:", data.clientSecret);

      router.push("/(seeker-verify)/consent");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 px-6 py-10 max-w-lg w-full self-center items-center">
        <Text className="text-sm text-[#81656E] font-medium mb-2 self-start">Step 3 of 4</Text>
        <Text className="text-2xl font-bold text-[#201317] mb-3 self-start">Identity Check</Text>

        <View className="w-20 h-20 rounded-full bg-[#FBF9FA] border-2 border-[#C52660] items-center justify-center my-8">
          <Text className="text-4xl">🛡️</Text>
        </View>

        <Text className="text-base text-[#81656E] text-center leading-6 mb-4">
          We use{" "}
          <Text className="font-semibold text-[#201317]">Stripe Identity</Text>{" "}
          for secure, automated document verification. Your information is encrypted and never stored on our servers.
        </Text>

        <View className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 w-full mb-10">
          <Text className="text-sm text-blue-700 text-center">
            This check typically takes under 60 seconds.
          </Text>
        </View>

        {errorMsg && (
          <Text className="text-sm text-[#DC2626] mb-4 text-center">{errorMsg}</Text>
        )}

        {state === "processing" ? (
          <View className="items-center mb-6">
            <Text className="text-base text-[#81656E] mb-2">Processing...</Text>
          </View>
        ) : null}

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
