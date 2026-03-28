import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { activeDateApi } from '../../../src/services/activeDateApi';
import { colors, spacing, typography } from '../../../src/constants/theme';

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
    if (!isSeeker) return;
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
      <ActivityIndicator color={colors.primary} size="large" />
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
              <TouchableOpacity
                onPress={() => handleRemove(index)}
                style={styles.removeBtn}
                accessibilityLabel={`Remove ${item.name}`}
                accessibilityRole="button"
              >
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
                    accessibilityLabel="Add place"
                    accessibilityRole="button"
                    accessibilityState={{ disabled: saving }}
                  >
                    <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Add Place'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setAdding(false)}
                    accessibilityLabel="Cancel"
                    accessibilityRole="button"
                  >
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => setAdding(true)}
                accessibilityLabel="Add a place"
                accessibilityRole="button"
              >
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
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
  list: { padding: spacing.xl, paddingBottom: 40 },
  title: { fontSize: typography.sizes.xl, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text, marginBottom: spacing.lg },
  placeCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, padding: 14, marginBottom: 10, shadowOffset: { width: 2, height: 2 }, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 0 },
  placeNum: { backgroundColor: colors.primary, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border, marginRight: 12 },
  placeNumText: { color: colors.textInverse, fontFamily: typography.fonts.heading, fontWeight: '700', fontSize: typography.sizes.sm },
  placeInfo: { flex: 1 },
  placeName: { fontSize: typography.sizes.md, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  placeAddress: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: 2 },
  placeTime: { fontSize: typography.sizes.sm, color: colors.primary, marginTop: 4, fontFamily: typography.fonts.heading },
  removeBtn: { padding: spacing.sm },
  removeText: { fontSize: 18, color: colors.primary, fontFamily: typography.fonts.heading },
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyText: { fontSize: typography.sizes.lg, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  emptySubtext: { fontSize: typography.sizes.sm, color: colors.textMuted, marginTop: spacing.sm },
  addBtn: { backgroundColor: colors.accent, borderWidth: 2, borderColor: colors.border, paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm, shadowOffset: { width: 3, height: 3 }, shadowColor: colors.shadow, shadowOpacity: 1, shadowRadius: 0 },
  addBtnText: { fontSize: typography.sizes.md, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.text },
  addForm: { backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, padding: spacing.md, marginTop: spacing.sm },
  input: { borderWidth: 2, borderColor: colors.border, padding: 12, fontSize: typography.sizes.md, marginBottom: spacing.sm, backgroundColor: colors.background },
  formBtns: { flexDirection: 'row', gap: 10 },
  saveBtn: { flex: 1, backgroundColor: colors.primary, borderWidth: 2, borderColor: colors.border, paddingVertical: 12, alignItems: 'center' },
  saveBtnText: { fontSize: typography.sizes.md, fontFamily: typography.fonts.heading, fontWeight: '700', color: colors.textInverse },
  cancelBtn: { flex: 1, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, paddingVertical: 12, alignItems: 'center' },
  cancelText: { fontSize: typography.sizes.md, color: colors.text },
  btnDisabled: { opacity: 0.6 },
});
