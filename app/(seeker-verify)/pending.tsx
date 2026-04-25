import { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, Linking, useWindowDimensions, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { EmptyState, Button } from "@/components/ui";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3500";
const POLL_INTERVAL = 30_000;
const SUPPORT_EMAIL = "support@daterabbit.app";

type Status = "pending" | "approved" | "rejected";

export default function SeekerVerifyPendingScreen() {
  const { width } = useWindowDimensions();
  const [status, setStatus] = useState<Status>("pending");
  const [reason, setReason] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const poll = async () => {
    try {
      const res = await fetch(`${API_URL}/api/verification/status`);
      if (!res.ok) return;
      const data = await res.json();
      if (data.status === "approved") {
        setStatus("approved");
        clearInterval(intervalRef.current!);
        router.replace("/(tabs)/male/browse");
      } else if (data.status === "rejected") {
        setStatus("rejected");
        setReason(data.reason || null);
        clearInterval(intervalRef.current!);
      }
    } catch {
      // silent — will retry on next tick
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
      <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerStyle={{ flexGrow: 1, maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
        <View className="flex-1 items-center justify-center px-6 py-12 max-w-lg w-full self-center">
          <EmptyState
            title="Verification Not Approved"
            message={reason || "Your verification was not successful. Please review the requirements and try again."}
          />
          {reason && (
            <View className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 w-full mb-6">
              <Text className="text-sm text-red-700">{reason}</Text>
            </View>
          )}
          <View className="w-full mb-3">
            <Button
              label="Try Again"
              onPress={() => router.replace("/(seeker-verify)/intro")}
              variant="primary"
              size="lg"
              fullWidth
            />
          </View>
          <Pressable onPress={openSupport} className="py-2">
            <Text className="text-base text-[#C52660]">Contact Support</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerStyle={{ flexGrow: 1, maxWidth: 1200, alignSelf: 'center', width: '100%' }}>
      <View className="flex-1 items-center justify-center px-6 py-12 max-w-lg w-full self-center">
        <View className="w-24 h-24 rounded-full bg-amber-100 items-center justify-center mb-6">
          <Text className="text-5xl">⏳</Text>
        </View>

        <EmptyState
          title="Under Review"
          message="We're reviewing your documents. This usually takes 24-48 hours. You'll receive an email when the review is complete."
        />

        <View className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 w-full mt-4 mb-8">
          <Text className="text-sm text-amber-700 text-center">
            Checking status every 30 seconds...
          </Text>
        </View>

        <Pressable onPress={openSupport} className="py-2">
          <Text className="text-base text-[#C52660]">
            Need help? Email {SUPPORT_EMAIL}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
