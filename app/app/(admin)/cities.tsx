import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { citiesApi, City } from '../../src/services/api';
import { colors } from '../../src/constants/theme';

export default function AdminCitiesScreen() {
  const router = useRouter();
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Add city modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [newState, setNewState] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const loadCities = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await citiesApi.adminGetAll();
      setCities(data as City[]);
    } catch (err: any) {
      setError(err.message || 'Failed to load cities');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCities();
  }, [loadCities]);

  const handleToggle = async (city: City) => {
    setTogglingId(city.id);
    try {
      const updated = await citiesApi.adminToggle(city.id, !city.isActive);
      setCities((prev: City[]) => prev.map((c: City) => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      const msg = err.message || 'Failed to update city';
      if (Platform.OS === 'web') {
        setError(msg);
      } else {
        Alert.alert('Error', msg);
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleAdd = async () => {
    const name = newName.trim();
    const state = newState.trim().toUpperCase();

    if (!name) {
      setFormError('City name is required');
      return;
    }
    if (!state || state.length !== 2) {
      setFormError('State must be a 2-character code (e.g. CA)');
      return;
    }

    setSaving(true);
    setFormError(null);
    try {
      const created = await citiesApi.adminCreate({ name, state });
      setCities((prev: City[]) => [...prev, created]);
      setModalVisible(false);
      setNewName('');
      setNewState('');
    } catch (err: any) {
      setFormError(err.message || 'Failed to create city');
    } finally {
      setSaving(false);
    }
  };

  const renderCity = ({ item }: { item: City }): JSX.Element => {
    const toggling = togglingId === item.id;
    return (
      <View style={styles.row}>
        <View style={styles.rowInfo}>
          <Text style={styles.cityName}>{item.name}</Text>
          <Text style={styles.cityState}>{item.state}</Text>
        </View>
        <TouchableOpacity
          style={[styles.toggleBtn, item.isActive ? styles.toggleActive : styles.toggleInactive]}
          onPress={() => handleToggle(item)}
          disabled={toggling}
        >
          {toggling ? (
            <ActivityIndicator size="small" color={colors.textInverse} />
          ) : (
            <Text style={styles.toggleText}>{item.isActive ? 'Active' : 'Inactive'}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cities</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadCities}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={cities}
          keyExtractor={(item) => item.id}
          renderItem={renderCity}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No cities yet.</Text>
            </View>
          }
        />
      )}

      {/* Add City Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add City</Text>

            <Text style={styles.label}>City Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Los Angeles"
              value={newName}
              onChangeText={setNewName}
              autoCapitalize="words"
              maxLength={64}
            />

            <Text style={styles.label}>State Code</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. CA"
              value={newState}
              onChangeText={setNewState}
              autoCapitalize="characters"
              maxLength={2}
            />

            {formError ? <Text style={styles.formError}>{formError}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setModalVisible(false);
                  setNewName('');
                  setNewState('');
                  setFormError(null);
                }}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
                onPress={handleAdd}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color={colors.textInverse} />
                ) : (
                  <Text style={styles.saveText}>Save</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 2,
    borderBottomColor: colors.border,
  },
  backBtn: {
    minWidth: 50,
  },
  backText: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_500Medium',
    color: colors.primary,
  },
  title: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.text,
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
  },
  addText: {
    fontSize: 14,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.textInverse,
  },
  list: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 14,
  },
  rowInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cityName: {
    fontSize: 16,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.text,
  },
  cityState: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.textMuted,
    backgroundColor: colors.backgroundWarm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    minWidth: 80,
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: colors.success,
  },
  toggleInactive: {
    backgroundColor: colors.textLight,
  },
  toggleText: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.textInverse,
  },
  separator: {
    height: 10,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
  },
  retryText: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.textInverse,
  },
  emptyText: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.textMuted,
  },
  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: colors.border,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: 16,
  },
  formError: {
    fontSize: 13,
    fontFamily: 'SpaceGrotesk_400Regular',
    color: colors.error,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_600SemiBold',
    color: colors.text,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveText: {
    fontSize: 15,
    fontFamily: 'SpaceGrotesk_700Bold',
    color: colors.textInverse,
  },
});
