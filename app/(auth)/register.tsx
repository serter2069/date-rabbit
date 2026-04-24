import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import { Input } from "@/components/ui";
import { colors } from "@/lib/theme";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

interface FormData {
  name: string;
  age: string;
  city: string;
  bio: string;
}

interface FormErrors {
  name?: string;
  age?: string;
  city?: string;
  bio?: string;
}

function validate(form: FormData): FormErrors {
  const errs: FormErrors = {};
  const name = form.name.trim();
  const age = parseInt(form.age, 10);
  const city = form.city.trim();
  const bio = form.bio.trim();

  if (!name || name.length < 2) errs.name = "Name must be at least 2 characters";
  else if (name.length > 50) errs.name = "Name must be 50 characters or less";

  if (!form.age) errs.age = "Age is required";
  else if (isNaN(age) || age < 18) errs.age = "Must be at least 18";
  else if (age > 60) errs.age = "Must be 60 or younger";

  if (!city || city.length < 1) errs.city = "City is required";

  if (bio.length > 500) errs.bio = "Bio must be 500 characters or less";

  return errs;
}

export default function RegisterScreen() {
  const { token, user } = useAuth();
  const [form, setForm] = useState<FormData>({ name: "", age: "", city: "", bio: "" });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [biofocused, setBioFocused] = useState(false);

  const update = (field: keyof FormData) => (val: string) => {
    setForm((f) => ({ ...f, [field]: val }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setServerError(null);
    setSubmitting(true);

    const payload = {
      name: form.name.trim(),
      age: parseInt(form.age, 10),
      city: form.city.trim(),
      bio: form.bio.trim() || undefined,
    };

    try {
      const res = await fetch(`${API_URL}/api/auth/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        setServerError(data.error || "Something went wrong");
        return;
      }

      const data = await res.json();
      const updatedUser = data.user || user;

      if (!updatedUser?.role) {
        router.replace("/(auth)/role-select");
      } else {
        router.replace("/(tabs)");
      }
    } catch {
      if (__DEV__) {
        // No role yet in dev — go to role-select
        router.replace("/(auth)/role-select");
      } else {
        setServerError("Could not connect to server. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const bioBorderColor = errors.bio
    ? colors.error
    : biofocused
    ? colors.primary
    : "#E6D5DC";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#FBF9FA]"
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 py-16 max-w-[480px] w-full self-center">
          <Text className="text-3xl font-extrabold text-[#201317] mb-2">
            Set up your profile
          </Text>
          <Text className="text-base text-[#81656E] mb-8 leading-6">
            Tell us a little about yourself
          </Text>

          <View className="gap-5">
            <Input
              label="Full name"
              placeholder="Your name"
              value={form.name}
              onChangeText={update("name")}
              error={errors.name}
              autoCapitalize="words"
            />

            <Input
              label="Age"
              placeholder="Your age"
              value={form.age}
              onChangeText={update("age")}
              error={errors.age}
              keyboardType="numeric"
            />

            <Input
              label="City"
              placeholder="Where are you based?"
              value={form.city}
              onChangeText={update("city")}
              error={errors.city}
              autoCapitalize="words"
            />

            {/* Bio textarea */}
            <View className="w-full">
              <Text className="text-sm font-semibold text-[#201317] mb-2">
                Bio{" "}
                <Text className="text-[#81656E] font-normal">(optional)</Text>
              </Text>
              <View
                style={{
                  borderColor: bioBorderColor,
                  borderWidth: 1,
                  borderRadius: 12,
                  backgroundColor: "#FFFFFF",
                  padding: 14,
                  minHeight: 100,
                }}
              >
                <TextInput
                  multiline
                  placeholder="A few words about you..."
                  placeholderTextColor={colors.textSecondary}
                  value={form.bio}
                  onChangeText={update("bio")}
                  onFocus={() => setBioFocused(true)}
                  onBlur={() => setBioFocused(false)}
                  style={{
                    fontSize: 16,
                    color: colors.text,
                    textAlignVertical: "top",
                    minHeight: 72,
                  }}
                  maxLength={500}
                />
              </View>
              <View className="flex-row justify-between mt-1">
                {errors.bio ? (
                  <Text className="text-xs text-[#DC2626]">{errors.bio}</Text>
                ) : (
                  <View />
                )}
                <Text className="text-xs text-[#81656E]">
                  {form.bio.length}/500
                </Text>
              </View>
            </View>
          </View>

          {serverError && (
            <Text className="text-sm text-[#DC2626] mt-4">{serverError}</Text>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={submitting}
            className={`mt-8 h-14 rounded-xl items-center justify-center ${
              submitting ? "bg-[#E6D5DC]" : "bg-[#C52660] active:opacity-90"
            }`}
          >
            {submitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-base font-bold text-white">Save & Continue</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
