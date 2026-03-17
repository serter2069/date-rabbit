import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { activeDateApi } from '../../../src/services/activeDateApi';

interface Place {
  name: string;
  address: string;
  time?: string;
}

// Try to get user role from auth store, fallback to 'seeker'
let useAuthStore: any;
try {
  useAuthStore = require('../../../src/store/authStore').useAuthStore;
} catch {
  useAuthStore = () => ({ user: { role: 'seeker' } });
}

export default function DatePlanScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newTime, setNewTime] = useState('');

  const auth = useAuthStore?.() ?? { user: { role: 'seeker' } };
  const isSeeker = auth?.user?.role === 'seeker';

  useEffect(() => {
    activeDateApi.getPlan(bookingId)
      .then(r => setPlaces(r.places || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookingId]);

  const handleAdd = async () => {
    if (!newName.trim() || !newAddress.trim()) {
      Alert.alert('Name and address are required');
      return;
    }
    const updated = [...places, { name: newName.trim(), address: newAddress.trim(), time: newTime.trim() || undefined }];
    setSaving(true);
    try {
      await activeDateApi.savePlan(bookingId, updated);
      setPlaces(updated);
      setNewName('');
      setNewAddress('');
      setNewTime('');
      setAdding(false);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (index: number) => {
    const updated = places.filter((_, i) => i !== index);
    setSaving(true);
    try {
      await activeDateApi.savePlan(bookingId, updated);
      setPlaces(updated);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator color="#FF2A5F" size="large" />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <FlatList
        data={places}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.list}
        ListHeaderComponent={<Text style={styles.title}>Date Plan</Text>}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No plan yet.</Text>
            {isSeeker && <Text style={styles.emptySubtext}>Add places you'd like to visit!</Text>}
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.placeCard}>
            <View style={styles.placeNum}>
              <Text style={styles.placeNumText}>{index + 1}</Text>
            </View>
            <View style={styles.placeInfo}>
              <Text style={styles.placeName}>{item.name}</Text>
              <Text style={styles.placeAddress}>{item.address}</Text>
              {item.time && <Text style={styles.placeTime}>{item.time}</Text>}
            </View>
            {isSeeker && (
              <TouchableOpacity onPress={() => handleRemove(index)} style={styles.removeBtn}>
                <Text style={styles.removeText}>x</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        ListFooterComponent={
          isSeeker ? (
            adding ? (
              <View style={styles.addForm}>
                <TextInput
                  style={styles.input}
                  value={newName}
                  onChangeText={setNewName}
                  placeholder="Place name *"
                />
                <TextInput
                  style={styles.input}
                  value={newAddress}
                  onChangeText={setNewAddress}
                  placeholder="Address *"
                />
                <TextInput
                  style={styles.input}
                  value={newTime}
                  onChangeText={setNewTime}
                  placeholder="Time (e.g. 7:00 PM)"
                />
                <View style={styles.formBtns}>
                  <TouchableOpacity
                    style={[styles.saveBtn, saving && styles.btnDisabled]}
                    onPress={handleAdd}
                    disabled={saving}
                  >
                    <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Add Place'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setAdding(false)}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity style={styles.addBtn} onPress={() => setAdding(true)}>
                <Text style={styles.addBtnText}>+ Add Place</Text>
              </TouchableOpacity>
            )
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F0EA' },
  center: { flex: 1, backgroundColor: '#F4F0EA', justifyContent: 'center', alignItems: 'center' },
  list: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000', marginBottom: 20 },
  placeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 14, marginBottom: 10, shadowOffset: { width: 2, height: 2 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  placeNum: { backgroundColor: '#FF2A5F', width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#000', marginRight: 12 },
  placeNumText: { color: '#fff', fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', fontSize: 14 },
  placeInfo: { flex: 1 },
  placeName: { fontSize: 16, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  placeAddress: { fontSize: 13, color: '#555', marginTop: 2 },
  placeTime: { fontSize: 13, color: '#FF2A5F', marginTop: 4, fontFamily: 'SpaceGrotesk-Bold' },
  removeBtn: { padding: 8 },
  removeText: { fontSize: 18, color: '#FF2A5F', fontFamily: 'SpaceGrotesk-Bold' },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: 20, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  emptySubtext: { fontSize: 14, color: '#555', marginTop: 8 },
  addBtn: { backgroundColor: '#4DF0FF', borderWidth: 2, borderColor: '#000', paddingVertical: 16, alignItems: 'center', marginTop: 8, shadowOffset: { width: 3, height: 3 }, shadowColor: '#000', shadowOpacity: 1, shadowRadius: 0 },
  addBtnText: { fontSize: 16, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#000' },
  addForm: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', padding: 16, marginTop: 8 },
  input: { borderWidth: 2, borderColor: '#000', padding: 12, fontSize: 15, marginBottom: 10, backgroundColor: '#F4F0EA' },
  formBtns: { flexDirection: 'row', gap: 10 },
  saveBtn: { flex: 1, backgroundColor: '#FF2A5F', borderWidth: 2, borderColor: '#000', paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontFamily: 'SpaceGrotesk-Bold', fontWeight: '700', color: '#fff' },
  cancelBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 2, borderColor: '#000', paddingVertical: 12, alignItems: 'center' },
  cancelText: { fontSize: 15, color: '#000' },
  btnDisabled: { opacity: 0.6 },
});
