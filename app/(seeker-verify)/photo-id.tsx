import { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Button } from "@/components/ui";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3500";

type State = "idle" | "picking" | "uploading" | "error";

export default function PhotoIdScreen() {
  const [state, setState] = useState<State>("idle");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const pickImage = async () => {
    setState("picking");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.9,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setState("idle");
      } else {
        setState("idle");
      }
    } catch {
      setState("error");
      setErrorMsg("Could not open image picker");
    }
  };

  const takePhoto = async () => {
    setState("picking");
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Permission needed", "Please allow camera access in Settings.");
        setState("idle");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        quality: 0.9,
        allowsEditing: true,
      });
      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setState("idle");
      } else {
        setState("idle");
      }
    } catch {
      setState("error");
      setErrorMsg("Could not open camera");
    }
  };

  const upload = async () => {
    if (!imageUri) return;
    setState("uploading");
    setErrorMsg(null);
    setProgress(0);

    try {
      const form = new FormData();
      const filename = imageUri.split("/").pop() || "photo-id.jpg";
      form.append("file", { uri: imageUri, name: filename, type: "image/jpeg" } as never);

      // Simulate progress
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 20, 80));
      }, 300);

      const res = await fetch(`${API_URL}/api/verification/photo-id`, {
        method: "POST",
        body: form,
      });

      clearInterval(interval);
      setProgress(100);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Upload failed");
      }

      router.push("/(seeker-verify)/selfie");
    } catch (err) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="flex-1 px-6 py-10 max-w-lg w-full self-center">
        {/* Step indicator */}
        <Text className="text-sm text-[#81656E] font-medium mb-2">Step 1 of 4</Text>
        <Text className="text-2xl font-bold text-[#201317] mb-3">Government ID</Text>
        <Text className="text-base text-[#81656E] leading-6 mb-8">
          Take a clear photo of your government-issued ID (front side). Make sure all text is readable and there is no glare.
        </Text>

        {/* Preview or placeholder */}
        {imageUri ? (
          <View className="w-full aspect-video rounded-2xl overflow-hidden mb-6 border border-gray-200">
            <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
          </View>
        ) : (
          <View className="w-full aspect-video rounded-2xl border-2 border-dashed border-gray-300 items-center justify-center mb-6 bg-white">
            <Text className="text-4xl mb-2">🪪</Text>
            <Text className="text-sm text-[#81656E]">No photo selected</Text>
          </View>
        )}

        {/* Picker buttons */}
        <View className="flex-row gap-3 mb-6">
          <View className="flex-1">
            <Button label="From Library" onPress={pickImage} variant="secondary" size="md" fullWidth />
          </View>
          <View className="flex-1">
            <Button label="Camera" onPress={takePhoto} variant="secondary" size="md" fullWidth />
          </View>
        </View>

        {/* Progress bar */}
        {state === "uploading" && (
          <View className="mb-4">
            <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <View
                className="h-2 bg-[#C52660] rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            <Text className="text-xs text-[#81656E] mt-1 text-center">Uploading... {progress}%</Text>
          </View>
        )}

        {errorMsg && (
          <Text className="text-sm text-[#DC2626] mb-4 text-center">{errorMsg}</Text>
        )}

        <Button
          label={state === "uploading" ? "Uploading..." : "Upload & Continue"}
          onPress={upload}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!imageUri || state === "uploading"}
          loading={state === "uploading"}
        />
      </View>
    </ScrollView>
  );
}
