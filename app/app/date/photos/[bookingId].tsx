import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  Image, Modal, Alert, ActivityIndicator, Dimensions
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { activeDateApi } from '../../../src/services/activeDateApi';

const SCREEN_W = Dimensions.get('window').width;
const PHOTO_SIZE = (SCREEN_W - 48 - 12) / 2; // 2 columns with gaps

interface Photo {
  id: string;
  url: string;
  uploadedBy: string;
  createdAt: string;
}

export default function DatePhotosScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [fullscreen, setFullscreen] = useState<string | null>(null);

  const loadPhotos = useCallback(async () => {
    try {
      const resp = await activeDateApi.getPhotos(bookingId);
      setPhotos(resp.photos);
    } catch (e) {}
    setLoading(false);
  }, [bookingId]);

  useEffect(() => { loadPhotos(); }, [loadPhotos]);

  const handleAddPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow photo access to add photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });
    if (result.canceled || !result.assets[0]) return;

    setUploading(true);
    try {
      await activeDateApi.uploadPhoto(bookingId, result.assets[0].uri);
      await loadPhotos(); // refresh
    } catch (e: any) {
      Alert.alert('Upload failed', e.message || 'Please try again');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={photos}
        keyExtractor={p => p.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text style={styles.title}>Date Photos</Text>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color="#FF2A5F" size="large" style={{ marginTop: 60 }} />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No photos yet</Text>
              <Text style={styles.emptySubtext}>Be the first to add one!</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setFullscreen(item.url)}
            style={styles.photoWrap}
            accessibilityLabel="View photo"
            accessibilityRole="button"
          >
            <Image source={{ uri: item.url }} style={styles.photo} />
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={[styles.addBtn, uploading && styles.btnDisabled]}
        onPress={handleAddPhoto}
        disabled={uploading}
        accessibilityLabel="Add photo"
        accessibilityRole="button"
        accessibilityState={{ disabled: uploading }}
      >
        {uploading
          ? <ActivityIndicator color="#000" />
          : <Text style={styles.addBtnText}>+ Add Photo</Text>
        }
      </TouchableOpacity>

      {/* Fullscreen modal */}
      <Modal visible={!!fullscreen} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modal}
          activeOpacity={1}
          onPress={() => setFullscreen(null)}
          accessibilityLabel="Close photo"
          accessibilityRole="button"
        >
          {fullscreen && (
            <Image
              source={{ uri: fullscreen }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          )}
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA' },
  list: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 28, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', marginBottom: 20 },
  row: { justifyContent: 'space-between', marginBottom: 12 },
  photoWrap: { width: PHOTO_SIZE, height: PHOTO_SIZE, borderWidth: 2, borderColor: '#000' },
  photo: { width: '100%', height: '100%' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyTitle: { fontSize: 20, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  emptySubtext: { fontSize: 14, color: '#555', marginTop: 8 },
  addBtn: {
    position: 'absolute', bottom: 24, left: 24, right: 24,
    backgroundColor: '#FF5A85', borderWidth: 2, borderColor: '#000',
    paddingVertical: 16, alignItems: 'center',
    shadowOffset: { width: 4, height: 4 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0,
  },
  addBtnText: { fontSize: 18, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  btnDisabled: { opacity: 0.6 },
  modal: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  fullscreenImage: { width: SCREEN_W, height: SCREEN_W },
});
