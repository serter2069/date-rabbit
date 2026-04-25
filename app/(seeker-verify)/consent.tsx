import { useState } from "react";
import { View, Text, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3500";

const CONSENTS = [
  { id: "genuine", label: "I confirm my identity documents are genuine" },
  { id: "terms", label: "I agree to the Terms of Service and Privacy Policy" },
  { id: "data", label: "I understand my data will be used for verification purposes" },
];

export default function ConsentScreen() {
  const { width } = useWindowDimensions();
  const [checked, setChecked] = useState<Record<string, boolean>>({
    genuine: false,
    terms: false,
    data: false,
  });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const allChecked = CONSENTS.every((c) => checked[c.id]);

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const submit = async () => {
    if (!allChecked) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${API_URL}/api/verification/consent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consented: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit consent");
      }

      router.replace("/(seeker-verify)/pending");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerStyle={{ flexGrow: 1, maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
      <View className="flex-1 px-6 py-10 max-w-lg w-full self-center">
        <Text className="text-sm text-[#81656E] font-medium mb-2">Step 4 of 4</Text>
        <Text className="text-2xl font-bold text-[#201317] mb-3">Consent</Text>
        <Text className="text-base text-[#81656E] leading-6 mb-8">
          Please review and confirm each statement below to complete your verification.
        </Text>

        <View className="bg-white rounded-2xl p-5 mb-8 gap-4">
          {/* static list — no empty state */}
          {CONSENTS.map((item, idx) => (
            <Pressable
              key={item.id}
              onPress={() => toggle(item.id)}
              className={`flex-row items-start ${idx < CONSENTS.length - 1 ? "pb-4 border-b border-gray-100" : ""}`}
            >
              <View
                className={`w-6 h-6 rounded border-2 items-center justify-center mt-0.5 mr-3 flex-shrink-0 ${
                  checked[item.id]
                    ? "bg-[#C52660] border-[#C52660]"
                    : "border-gray-300 bg-white"
                }`}
              >
                {checked[item.id] && (
                  <Text className="text-white text-xs font-bold">✓</Text>
                )}
              </View>
              <Text className="flex-1 text-base text-[#201317] leading-6">{item.label}</Text>
            </Pressable>
          ))}
        </View>

        {errorMsg && (
          <Text className="text-sm text-[#DC2626] mb-4 text-center">{errorMsg}</Text>
        )}

        <Button
          label="Agree & Complete"
          onPress={submit}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!allChecked || loading}
          loading={loading}
        />

        {!allChecked && (
          <Text className="text-xs text-[#81656E] text-center mt-3">
            Please check all boxes to continue
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
