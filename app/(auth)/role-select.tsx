import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

type Role = "seeker" | "companion";

interface RoleCardProps {
  title: string;
  description: string;
  role: Role;
  selected: boolean;
  onPress: () => void;
}

function RoleCard({ title, description, selected, onPress }: RoleCardProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`w-full rounded-2xl border-2 p-5 ${
        selected
          ? "border-[#C52660] bg-[#FBF9FA]"
          : "border-[#E6D5DC] bg-white"
      }`}
    >
      <Text className="text-lg font-bold text-[#201317] mb-1">{title}</Text>
      <Text className="text-sm text-[#81656E] leading-5">{description}</Text>
    </Pressable>
  );
}

export default function RoleSelectScreen() {
  const { token } = useAuth();
  const [selected, setSelected] = useState<Role | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!selected || submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ role: selected }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        setError(data.error || "Something went wrong");
        return;
      }

      router.replace("/(tabs)");
    } catch {
      if (__DEV__) {
        router.replace("/(tabs)");
      } else {
        setError("Could not connect to server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-[#FBF9FA] px-6 py-16">
      <View className="max-w-[480px] w-full self-center flex-1">
        <Text className="text-3xl font-extrabold text-[#201317] mb-2">
          How will you use DateRabbit?
        </Text>
        <Text className="text-base text-[#81656E] mb-8 leading-6">
          Choose your role. You can change this later.
        </Text>

        <View className="gap-4">
          <RoleCard
            role="seeker"
            title="I'm looking for a companion"
            description="Browse profiles, book dates, and find your perfect match."
            selected={selected === "seeker"}
            onPress={() => setSelected("seeker")}
          />
          <RoleCard
            role="companion"
            title="I want to offer companionship"
            description="Create a profile, set your availability, and meet interesting people."
            selected={selected === "companion"}
            onPress={() => setSelected("companion")}
          />
        </View>

        {error && (
          <Text className="text-sm text-[#DC2626] mt-4">{error}</Text>
        )}

        <Pressable
          onPress={handleConfirm}
          disabled={!selected || submitting}
          className={`mt-8 h-14 rounded-xl items-center justify-center ${
            selected && !submitting ? "bg-[#C52660] active:opacity-90" : "bg-[#E6D5DC]"
          }`}
        >
          {submitting ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text
              className={`text-base font-bold ${
                selected ? "text-white" : "text-[#81656E]"
              }`}
            >
              Continue
            </Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}
