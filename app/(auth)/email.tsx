import { useState } from "react";
import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ActivityIndicator, useWindowDimensions } from "react-native";
import { router } from "expo-router";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

export default function EmailScreen() {
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { width } = useWindowDimensions()

  const isValid = email.trim().length > 0 && agreed;

  const handleContinue = async () => {
    if (!isValid || loading) return;
    setError(null);
    setLoading(true);

    const trimmedEmail = email.trim().toLowerCase();

    try {
      const res = await fetch(`${API_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        setError(data.error || "Something went wrong");
        return;
      }

      router.push({ pathname: "/(auth)/otp", params: { email: trimmedEmail } });
    } catch {
      if (__DEV__) {
        router.push({ pathname: "/(auth)/otp", params: { email: trimmedEmail } });
      } else {
        setError("Could not connect to server. Please try again later.");
      }
    } finally {
      setLoading(false);
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
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 16,
          elevation: 4,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        }}>
          <Text className="text-3xl font-bold text-[#201317] mb-2">Welcome</Text>
          <Text className="text-base text-[#81656E] mb-8">
            Enter your email to continue
          </Text>

          <TextInput
            className="h-14 rounded-xl bg-[#FBF9FA] px-4 text-base text-[#201317]"
            style={{ borderWidth: 1, borderColor: '#E6D5DC', outlineWidth: 0 } as object}
            placeholder="your@email.com"
            placeholderTextColor="#81656E"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            onSubmitEditing={handleContinue}
          />

          {error && (
            <Text className="text-sm text-[#DC2626] mt-2">{error}</Text>
          )}

          {/* Privacy checkbox */}
          <Pressable
            onPress={() => setAgreed(!agreed)}
            className="flex-row items-start mt-4"
          >
            <View
              className={`w-5 h-5 rounded border mt-0.5 items-center justify-center ${
                agreed ? "border-[#C52660]" : "border-[#E6D5DC] bg-white"
              }`}
              style={agreed ? { backgroundColor: '#C52660' } : {}}
            >
              {agreed && <Text className="text-white text-xs font-bold">✓</Text>}
            </View>
            <Text className="flex-1 ml-3 text-sm text-[#81656E] leading-5">
              I agree to the{" "}
              <Text
                className="text-[#C52660] underline"
                onPress={() => router.push("/legal/privacy" as never)}
              >
                Privacy Policy
              </Text>
              {" "}and{" "}
              <Text
                className="text-[#C52660] underline"
                onPress={() => router.push("/legal/terms" as never)}
              >
                Terms of Service
              </Text>
            </Text>
          </Pressable>

          <Pressable
            onPress={handleContinue}
            disabled={!isValid || loading}
            className={`mt-6 h-14 rounded-xl items-center justify-center ${
              isValid && !loading ? "active:opacity-90" : ""
            }`}
            style={{ backgroundColor: isValid && !loading ? '#C52660' : '#E6D5DC' }}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text
                className={`text-base font-semibold ${isValid ? "text-white" : "text-[#81656E]"}`}
              >
                Continue
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
