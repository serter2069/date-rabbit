import { useState, useRef, useCallback } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function OtpScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { signIn } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<TextInput>(null);

  const handleVerify = useCallback(async (otpCode?: string) => {
    const codeToVerify = otpCode || code;
    if (codeToVerify.length !== 6 || loading) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: codeToVerify }),
      });

      const data = await res.json().catch(() => ({ error: "Verification failed" }));

      if (!res.ok) {
        setError(data.error || "Invalid or expired code");
        setCode("");
        return;
      }

      await signIn(data.accessToken, data.refreshToken, data.user);
      if (!data.user?.name) {
        router.replace("/(auth)/register");
      } else {
        router.replace("/(tabs)");
      }
    } catch {
      // Backend unavailable — in dev mode, allow login with 000000
      if (__DEV__ && codeToVerify === "000000") {
        console.warn("[DEV] Backend unavailable, mock login with 000000");
        const mockUser = { id: "dev-user", email: email || "dev@test.com", name: null, avatar: null, role: "USER" };
        await signIn("dev-mock-token", "dev-mock-refresh", mockUser);
        router.replace("/(auth)/register");
      } else {
        setError("Could not connect to server. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  }, [code, email, loading, signIn]);

  const handleCodeChange = (text: string) => {
    const cleaned = text.replace(/[^0-9]/g, "").slice(0, 6);
    setCode(cleaned);
    setError(null);
    if (cleaned.length === 6) {
      setTimeout(() => handleVerify(cleaned), 100);
    }
  };

  const handleResend = async () => {
    try {
      await fetch(`${API_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setError(null);
      setCode("");
    } catch {
      // Silently fail resend
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FBF9FA]"
    >
      <View className="flex-1 justify-center px-6">
        <View style={{
          maxWidth: 480,
          alignSelf: 'center',
          width: '100%',
          backgroundColor: '#FFFFFF',
          borderRadius: 24,
          padding: 32,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        } as object}>
        <Pressable onPress={() => router.back()} className="mb-8">
          <Text className="text-[#C52660] text-base font-medium">← Back</Text>
        </Pressable>

        <Text className="text-3xl font-bold text-[#201317] mb-2">
          Enter code
        </Text>
        <Text className="text-base text-[#81656E] mb-8">
          We sent a 6-digit code to {email}
        </Text>

        <Pressable onPress={() => inputRef.current?.focus()}>
          <View className="flex-row justify-between mb-6" pointerEvents="none">
            {/* static list — no empty state */}
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <View
                key={i}
                className={`w-12 h-14 rounded-xl items-center justify-center ${
                  code.length === i
                    ? "border-2 border-[#C52660] bg-[#FFF0F5]"
                    : error
                    ? "bg-[#FEF2F2] border border-[#FECACA]"
                    : "bg-[#FBF9FA]"
                }`}
              >
                <Text className="text-2xl font-bold text-gray-900">
                  {code[i] || ""}
                </Text>
              </View>
            ))}
          </View>
        </Pressable>

        {/* Hidden input - positioned off-screen to prevent doubled rendering */}
        <TextInput
          ref={inputRef}
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={handleCodeChange}
          autoFocus
          style={{ position: "absolute", opacity: 0, width: 0, height: 0 }}
        />

        {error && (
          <Text className="text-sm text-red-500 mb-4 text-center">{error}</Text>
        )}

        <Pressable
          onPress={() => handleVerify()}
          disabled={code.length !== 6 || loading}
          className="h-14 rounded-xl items-center justify-center active:opacity-90"
          style={{ backgroundColor: code.length === 6 && !loading ? '#C52660' : '#E6D5DC' }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-base font-semibold text-white">
              Verify
            </Text>
          )}
        </Pressable>

        <Pressable className="mt-4 items-center" onPress={handleResend}>
          <Text className="text-[#C52660] text-sm font-medium">Resend code</Text>
        </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
