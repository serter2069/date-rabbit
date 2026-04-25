import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { router } from "expo-router";
import { EmptyState, Button } from "@/components/ui";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3500";
const POLL_INTERVAL = 30_000;
const SUPPORT_EMAIL = "support@daterabbit.app";

type Status = "pending" | "approved" | "rejected";

export default function CompOnboardPendingScreen() {
  const [status, setStatus] = useState<Status>("pending");
  const [reason, setReason] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(`${API_URL}/api/companion/status`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "approved") {
        setStatus("approved");
        clearInterval(intervalRef.current!);
        router.replace("/(tabs)/female");
      } else if (data.status === "rejected") {
        setStatus("rejected");
        setReason(data.reason || null);
        clearInterval(intervalRef.current!);
      }
    } catch {
      // silent
    }
  };

  useEffect(() => {
    poll();
    intervalRef.current = setInterval(poll, POLL_INTERVAL);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const openSupport = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}`);
  };

  if (status === "rejected") {
    return (
      <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 items-center justify-center px-6 py-12 max-w-lg w-full self-center">
          <EmptyState
            title="Application Not Approved"
            message={reason || "Your application was not approved at this time."}
          />
          {reason && (
            <View className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 w-full mb-6">
              <Text className="text-sm text-red-700">{reason}</Text>
            </View>
          )}
          <Button
            label="Contact Support"
            onPress={openSupport}
            variant="secondary"
            size="lg"
            fullWidth
          />
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 items-center justify-center px-6 py-12 max-w-lg w-full self-center">
        <View className="w-24 h-24 rounded-full bg-amber-100 items-center justify-center mb-6">
          <Text className="text-5xl">📋</Text>
        </View>

        <EmptyState
          title="Application Under Review"
          message="We're reviewing your profile and documents. Companion approval takes 1-3 business days. You'll receive an email with the result."
        />

        <View className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 w-full mt-4 mb-8">
          <Text className="text-sm text-amber-700 text-center">
            Checking status every 30 seconds...
          </Text>
        </View>

        <Pressable onPress={openSupport} className="py-2">
          <Text className="text-base text-[#C52660]">
            Questions? Email {SUPPORT_EMAIL}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
