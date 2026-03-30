import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '../../src/components/Icon';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useTheme, spacing, typography, borderRadius } from '../../src/constants/theme';
import { showAlert } from '../../src/utils/alert';
import { packagesApi, DatePackageTemplate, DatePackage } from '../../src/services/api';

export default function MyPackagesScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [templates, setTemplates] = useState<DatePackageTemplate[]>([]);
  const [packages, setPackages] = useState<DatePackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Create form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [price, setPrice] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit mode
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [t, p] = await Promise.all([
        packagesApi.getTemplates(),
        packagesApi.getMyPackages(),
      ]);
      setTemplates(t);
      setPackages(p);
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to load packages');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Templates that the companion hasn't created a package for yet
  const availableTemplates = templates.filter(
    (t) => !packages.some((p) => p.templateId === t.id),
  );

  const handleCreate = async () => {
    if (!selectedTemplateId || !price) {
      showAlert('Missing Info', 'Select a template and set a price.');
      return;
    }
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      showAlert('Invalid Price', 'Price must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await packagesApi.createPackage({
        templateId: selectedTemplateId,
        price: priceNum,
        customDescription: customDescription.trim() || undefined,
      });
      setSelectedTemplateId(null);
      setPrice('');
      setCustomDescription('');
      fetchData();
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to create package');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (id: string) => {
    const priceNum = parseFloat(editPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      showAlert('Invalid Price', 'Price must be a positive number.');
      return;
    }
    try {
      await packagesApi.updatePackage(id, {
        price: priceNum,
        customDescription: editDescription.trim() || undefined,
      });
      setEditingId(null);
      fetchData();
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to update package');
    }
  };

  const handleDelete = (id: string) => {
    showAlert('Delete Package', 'Are you sure you want to delete this package?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await packagesApi.deletePackage(id);
            fetchData();
          } catch (err: any) {
            showAlert('Error', err.message || 'Failed to delete');
          }
        },
      },
    ]);
  };

  const handleToggleActive = async (pkg: DatePackage) => {
    try {
      await packagesApi.updatePackage(pkg.id, { isActive: !pkg.isActive });
      fetchData();
    } catch (err: any) {
      showAlert('Error', err.message || 'Failed to update');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm, backgroundColor: colors.white, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: colors.surface }]} onPress={() => router.back()}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Packages</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Existing packages */}
        {packages.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Your Packages</Text>
            {packages.map((pkg) => {
              const isEditing = editingId === pkg.id;
              return (
                <Card key={pkg.id} style={styles.packageCard}>
                  <View style={styles.packageHeader}>
                    <View style={[styles.packageIcon, { backgroundColor: colors.primary + '15' }]}>
                      <Icon name={pkg.template?.icon || 'package'} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.packageInfo}>
                      <Text style={[styles.packageName, { color: colors.text }]}>
                        {pkg.template?.name || 'Package'}
                      </Text>
                      <Text style={[styles.packageDuration, { color: colors.textSecondary }]}>
                        {pkg.template?.defaultDuration}h {pkg.template?.defaultActivity}
                      </Text>
                    </View>
                    <View style={styles.packageActions}>
                      {!isEditing && (
                        <>
                          <Text style={[styles.packagePrice, { color: colors.primary }]}>${Number(pkg.price)}</Text>
                          {!pkg.isActive && (
                            <Text style={[styles.inactiveBadge, { color: colors.textSecondary }]}>Inactive</Text>
                          )}
                        </>
                      )}
                    </View>
                  </View>
                  {pkg.customDescription && !isEditing ? (
                    <Text style={[styles.customDesc, { color: colors.textSecondary }]}>{pkg.customDescription}</Text>
                  ) : null}

                  {isEditing ? (
                    <View style={styles.editForm}>
                      <TextInput
                        style={[styles.input, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        placeholder="Price ($)"
                        value={editPrice}
                        onChangeText={setEditPrice}
                        keyboardType="numeric"
                        placeholderTextColor={colors.textSecondary}
                      />
                      <TextInput
                        style={[styles.input, styles.textArea, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text }]}
                        placeholder="Custom description (optional)"
                        value={editDescription}
                        onChangeText={setEditDescription}
                        multiline
                        placeholderTextColor={colors.textSecondary}
                      />
                      <View style={styles.editButtons}>
                        <Button title="Save" onPress={() => handleUpdate(pkg.id)} style={{ flex: 1 }} />
                        <Button title="Cancel" variant="outline" onPress={() => setEditingId(null)} style={{ flex: 1 }} />
                      </View>
                    </View>
                  ) : (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.surface }]}
                        onPress={() => {
                          setEditingId(pkg.id);
                          setEditPrice(String(Number(pkg.price)));
                          setEditDescription(pkg.customDescription || '');
                        }}
                      >
                        <Icon name="edit-2" size={16} color={colors.primary} />
                        <Text style={[styles.actionText, { color: colors.primary }]}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.surface }]}
                        onPress={() => handleToggleActive(pkg)}
                      >
                        <Icon name={pkg.isActive ? 'eye-off' : 'eye'} size={16} color={colors.textSecondary} />
                        <Text style={[styles.actionText, { color: colors.textSecondary }]}>
                          {pkg.isActive ? 'Deactivate' : 'Activate'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.surface }]}
                        onPress={() => handleDelete(pkg.id)}
                      >
                        <Icon name="trash-2" size={16} color={colors.error} />
                        <Text style={[styles.actionText, { color: colors.error }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </Card>
              );
            })}
          </View>
        )}

        {/* Create new package */}
        {availableTemplates.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Add a Package</Text>
            <Text style={[styles.sectionDesc, { color: colors.textSecondary }]}>
              Choose a template and set your total price. Seekers see this as a fixed-price option.
            </Text>

            {availableTemplates.map((t) => {
              const isSelected = selectedTemplateId === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[
                    styles.templateCard,
                    { backgroundColor: colors.white, borderColor: colors.border },
                    isSelected && { borderColor: colors.primary, backgroundColor: colors.primary + '10' },
                  ]}
                  onPress={() => setSelectedTemplateId(isSelected ? null : t.id)}
                >
                  <View style={[styles.templateIcon, { backgroundColor: colors.primary + '15' }]}>
                    <Icon name={t.icon || 'package'} size={24} color={colors.primary} />
                  </View>
                  <View style={styles.templateInfo}>
                    <Text style={[styles.templateName, { color: colors.text }]}>{t.name}</Text>
                    <Text style={[styles.templateDesc, { color: colors.textSecondary }]}>
                      {t.defaultDuration}h — {t.description}
                    </Text>
                  </View>
                  <View style={[
                    styles.radio,
                    { borderColor: isSelected ? colors.primary : colors.border },
                  ]}>
                    {isSelected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {selectedTemplateId && (
              <View style={styles.createForm}>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
                  placeholder="Your price for this package ($)"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  placeholderTextColor={colors.textSecondary}
                />
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: colors.white, borderColor: colors.border, color: colors.text }]}
                  placeholder="Custom description (optional)"
                  value={customDescription}
                  onChangeText={setCustomDescription}
                  multiline
                  placeholderTextColor={colors.textSecondary}
                />
                <Button
                  title={isSubmitting ? 'Creating...' : 'Create Package'}
                  onPress={handleCreate}
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  fullWidth
                />
              </View>
            )}
          </View>
        )}

        {packages.length === 0 && availableTemplates.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xxl }}>
            <Icon name="package" size={48} color={colors.textSecondary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No packages yet</Text>
            <Button
              title="Create Package"
              variant="pink"
              onPress={() => {
                // TODO: navigate to dedicated package creation screen when available
                router.push('/settings/edit-profile');
              }}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        )}

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
  },
  scrollView: { flex: 1 },
  content: { padding: spacing.lg },
  section: { marginBottom: spacing.xl },
  sectionTitle: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  sectionDesc: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginBottom: spacing.md,
  },
  packageCard: { marginBottom: spacing.md },
  packageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  packageIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  packageInfo: { flex: 1 },
  packageName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  packageDuration: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
  },
  packageActions: { alignItems: 'flex-end' },
  packagePrice: {
    fontFamily: typography.fonts.heading,
    fontSize: typography.sizes.xl,
    fontWeight: '700',
  },
  inactiveBadge: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.xs,
  },
  customDesc: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  actionText: {
    fontFamily: typography.fonts.bodyMedium,
    fontSize: typography.sizes.sm,
    fontWeight: '500',
  },
  editForm: { marginTop: spacing.md, gap: spacing.sm },
  editButtons: { flexDirection: 'row', gap: spacing.sm },
  templateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    marginBottom: spacing.sm,
  },
  templateIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  templateInfo: { flex: 1 },
  templateName: {
    fontFamily: typography.fonts.bodySemiBold,
    fontSize: typography.sizes.md,
    fontWeight: '600',
  },
  templateDesc: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  createForm: { marginTop: spacing.md, gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: typography.sizes.md,
    minHeight: 48,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  emptyText: {
    fontFamily: typography.fonts.body,
    fontSize: typography.sizes.md,
    marginTop: spacing.md,
  },
});
