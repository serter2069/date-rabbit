import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

interface UseImagePickerOptions {
  allowsMultipleSelection?: boolean;
  maxImages?: number;
  quality?: number;
  aspect?: [number, number];
}

interface UseImagePickerResult {
  images: string[];
  loading: boolean;
  pickFromLibrary: () => Promise<string[]>;
  takePhoto: () => Promise<string | null>;
  removeImage: (uri: string) => void;
  clearImages: () => void;
  setImages: (images: string[]) => void;
}

export function useImagePicker(options: UseImagePickerOptions = {}): UseImagePickerResult {
  const {
    allowsMultipleSelection = true,
    maxImages = 6,
    quality = 0.8,
    aspect = [4, 5],
  } = options;

  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const requestPermission = useCallback(async (type: 'library' | 'camera') => {
    if (Platform.OS === 'web') return true;

    if (type === 'library') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to upload photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow camera access to take photos.',
          [{ text: 'OK' }]
        );
        return false;
      }
    }
    return true;
  }, []);

  const pickFromLibrary = useCallback(async (): Promise<string[]> => {
    const hasPermission = await requestPermission('library');
    if (!hasPermission) return [];

    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection,
        allowsEditing: !allowsMultipleSelection,
        aspect,
        quality,
        selectionLimit: maxImages - images.length,
      });

      if (!result.canceled && result.assets) {
        const newImages = result.assets.map((asset: ImagePicker.ImagePickerAsset) => asset.uri);
        const availableSlots = maxImages - images.length;
        const imagesToAdd = newImages.slice(0, availableSlots);

        if (newImages.length > availableSlots) {
          Alert.alert(
            'Limit Reached',
            `You can only add ${maxImages} photos. Some photos were not added.`
          );
        }

        setImages(prev => [...prev, ...imagesToAdd]);
        return imagesToAdd;
      }
    } catch (error) {
      console.error('Error picking images:', error);
      Alert.alert('Error', 'Failed to pick images. Please try again.');
    } finally {
      setLoading(false);
    }
    return [];
  }, [images.length, maxImages, allowsMultipleSelection, aspect, quality, requestPermission]);

  const takePhoto = useCallback(async (): Promise<string | null> => {
    if (images.length >= maxImages) {
      Alert.alert('Limit Reached', `You can only add ${maxImages} photos.`);
      return null;
    }

    const hasPermission = await requestPermission('camera');
    if (!hasPermission) return null;

    setLoading(true);
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect,
        quality,
      });

      if (!result.canceled && result.assets[0]) {
        const newImage = result.assets[0].uri;
        setImages(prev => [...prev, newImage]);
        return newImage;
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setLoading(false);
    }
    return null;
  }, [images.length, maxImages, aspect, quality, requestPermission]);

  const removeImage = useCallback((uri: string) => {
    setImages(prev => prev.filter(img => img !== uri));
  }, []);

  const clearImages = useCallback(() => {
    setImages([]);
  }, []);

  return {
    images,
    loading,
    pickFromLibrary,
    takePhoto,
    removeImage,
    clearImages,
    setImages,
  };
}
