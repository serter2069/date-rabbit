import { useState } from "react";
import { View, Text, ScrollView, Pressable, Image, ActivityIndicator, useWindowDimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { Button } from "@/components/ui";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3500";
const MIN_PHOTOS = 4;

interface Photo {
  uri: string;
  url?: string;
  uploading?: boolean;
}

export default function CompOnboardStep2Screen() {
  const { width } = useWindowDimensions();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [mainIndex, setMainIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addPhoto = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: true,
        aspect: [3, 4],
      });
      if (result.canceled || !result.assets[0]) return;

      const uri = result.assets[0].uri;
      const newIndex = photos.length;
      setPhotos((prev) => [...prev, { uri, uploading: true }]);

      // Upload photo
      const form = new FormData();
      const filename = uri.split("/").pop() || "photo.jpg";
      form.append("file", { uri, name: filename, type: "image/jpeg" } as never);

      const res = await fetch(`${API_URL}/api/upload/photo`, {
        method: "POST",
        body: form,
      });

      let url = uri; // fallback to local uri
      if (res.ok) {
        const data = await res.json();
        url = data.url || data.imageUrl || uri;
      }

      setPhotos((prev) => {
        const updated = [...prev];
        updated[newIndex] = { uri, url, uploading: false };
        return updated;
      });

      // Auto-select first photo as main
      if (mainIndex === null) setMainIndex(0);
    } catch {
      // silent
    }
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    if (mainIndex === index) {
      setMainIndex(photos.length > 1 ? 0 : null);
    } else if (mainIndex !== null && mainIndex > index) {
      setMainIndex(mainIndex - 1);
    }
  };

  const canProceed =
    photos.length >= MIN_PHOTOS &&
    mainIndex !== null &&
    photos.every((p) => !p.uploading);

  const save = async () => {
    if (!canProceed) return;
    setSaving(true);
    setErrorMsg(null);
    try {
      const urls = photos.map((p) => p.url || p.uri);
      const avatar = mainIndex !== null ? urls[mainIndex] : urls[0];

      const res = await fetch(`${API_URL}/api/companion/profile`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: urls, avatar }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save photos");
      }

      router.push("/(comp-onboard)/verify");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const photosNeeded = Math.max(0, MIN_PHOTOS - photos.length);

  return (
    <ScrollView className="flex-1 bg-[#FBF9FA]" contentContainerStyle={{ flexGrow: 1, maxWidth: 1200, alignSelf: 'center', width: '100%', paddingBottom: 40 }}>
      <View className="flex-1 px-6 py-10 max-w-lg w-full self-center">
        <Text className="text-2xl font-bold text-[#201317] mb-2">Your Photos</Text>
        <Text className="text-base text-[#81656E] leading-6 mb-2">
          Add at least {MIN_PHOTOS} photos of yourself. Select one as your main profile photo.
        </Text>

        {/* Progress */}
        <View className="flex-row items-center mb-6">
          <View className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <View
              className="h-2 bg-[#C52660] rounded-full"
              style={{ width: `${Math.min(100, (photos.length / MIN_PHOTOS) * 100)}%` }}
            />
          </View>
          <Text className="ml-3 text-sm font-semibold text-[#81656E]">
            {photos.length}/{MIN_PHOTOS} minimum
          </Text>
        </View>

        {/* Photo grid */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {photos.map((photo, idx) => (
            <View key={idx} className="w-[calc(50%-6px)] aspect-[3/4] relative">
              <Image
                source={{ uri: photo.uri }}
                className="w-full h-full rounded-xl"
                resizeMode="cover"
              />
              {photo.uploading && (
                <View className="absolute inset-0 bg-black/40 rounded-xl items-center justify-center">
                  <ActivityIndicator color="white" />
                </View>
              )}
              {/* Main badge */}
              {mainIndex === idx && (
                <View className="absolute top-2 left-2 bg-[#C52660] rounded-full px-2 py-0.5">
                  <Text className="text-white text-xs font-semibold">Main</Text>
                </View>
              )}
              {/* Delete button */}
              <Pressable
                onPress={() => removePhoto(idx)}
                className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full items-center justify-center"
              >
                <Text className="text-white text-sm font-bold">×</Text>
              </Pressable>
              {/* Set main radio */}
              {mainIndex !== idx && !photo.uploading && (
                <Pressable
                  onPress={() => setMainIndex(idx)}
                  className="absolute bottom-2 left-2 bg-white/80 rounded-full px-2 py-0.5"
                >
                  <Text className="text-xs text-[#201317] font-medium">Set main</Text>
                </Pressable>
              )}
            </View>
          ))}

          {/* Add photo button */}
          <Pressable
            onPress={addPhoto}
            className="rounded-xl border-2 border-dashed border-gray-300 items-center justify-center bg-white"
            style={{ width: "calc(50% - 6px)" as never, aspectRatio: 3 / 4 }}
          >
            <Text className="text-3xl text-gray-400 mb-1">+</Text>
            <Text className="text-xs text-[#81656E]">Add photo</Text>
          </Pressable>
        </View>

        {photosNeeded > 0 && (
          <Text className="text-sm text-[#81656E] text-center mb-4">
            Add {photosNeeded} more photo{photosNeeded !== 1 ? "s" : ""} to continue
          </Text>
        )}

        {errorMsg && (
          <Text className="text-sm text-[#DC2626] mb-4 text-center">{errorMsg}</Text>
        )}

        <Button
          label="Next"
          onPress={save}
          variant="primary"
          size="lg"
          fullWidth
          disabled={!canProceed || saving}
          loading={saving}
        />
      </View>
    </ScrollView>
  );
}
