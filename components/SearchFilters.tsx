import { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Button } from '@/components/Button';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export interface SearchFilters {
  dateRange: 'all' | 'today' | 'week' | 'month';
  readStatus: 'all' | 'read' | 'unread';
  favoriteOnly: boolean;
  sourceIds: string[];
}

interface SearchFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  filters: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  sources?: Array<{ id: string; name: string }>;
}

const DATE_RANGE_OPTIONS = [
  { value: 'all' as const, label: 'Tout', icon: 'calendar-outline' as const },
  { value: 'today' as const, label: "Aujourd'hui", icon: 'today-outline' as const },
  { value: 'week' as const, label: 'Cette semaine', icon: 'calendar-number-outline' as const },
  { value: 'month' as const, label: 'Ce mois', icon: 'calendar-clear-outline' as const },
];

const READ_STATUS_OPTIONS = [
  { value: 'all' as const, label: 'Tous', icon: 'list-outline' as const },
  { value: 'unread' as const, label: 'Non lus', icon: 'ellipse-outline' as const },
  { value: 'read' as const, label: 'Lus', icon: 'checkmark-circle-outline' as const },
];

export function SearchFiltersModal({
  visible,
  onClose,
  filters,
  onApply,
  sources = [],
}: SearchFiltersModalProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const [localFilters, setLocalFilters] = useState<SearchFilters>(filters);

  const handleApply = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const resetFilters: SearchFilters = {
      dateRange: 'all',
      readStatus: 'all',
      favoriteOnly: false,
      sourceIds: [],
    };
    setLocalFilters(resetFilters);
  };

  const toggleSource = (sourceId: string) => {
    Haptics.selectionAsync();
    setLocalFilters((prev) => {
      const sourceIds = prev.sourceIds.includes(sourceId)
        ? prev.sourceIds.filter((id) => id !== sourceId)
        : [...prev.sourceIds, sourceId];
      return { ...prev, sourceIds };
    });
  };

  const hasActiveFilters =
    localFilters.dateRange !== 'all' ||
    localFilters.readStatus !== 'all' ||
    localFilters.favoriteOnly ||
    localFilters.sourceIds.length > 0;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Filtres de recherche</Text>
          <View style={{ width: 28 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Date Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Période</Text>
            <View style={styles.optionsGrid}>
              {DATE_RANGE_OPTIONS.map((option) => {
                const isSelected = localFilters.dateRange === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.gridOption, isSelected && styles.gridOptionActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setLocalFilters((prev) => ({ ...prev, dateRange: option.value }));
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                    <Text
                      style={[styles.gridOptionText, isSelected && styles.gridOptionTextActive]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Read Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Statut de lecture</Text>
            <View style={styles.optionsGrid}>
              {READ_STATUS_OPTIONS.map((option) => {
                const isSelected = localFilters.readStatus === option.value;
                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[styles.gridOption, isSelected && styles.gridOptionActive]}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setLocalFilters((prev) => ({ ...prev, readStatus: option.value }));
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name={option.icon}
                      size={24}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                    <Text
                      style={[styles.gridOptionText, isSelected && styles.gridOptionTextActive]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Favorites */}
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.toggleOption, localFilters.favoriteOnly && styles.toggleOptionActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setLocalFilters((prev) => ({ ...prev, favoriteOnly: !prev.favoriteOnly }));
              }}
              activeOpacity={0.7}
            >
              <View style={styles.toggleLeft}>
                <Ionicons
                  name={localFilters.favoriteOnly ? 'heart' : 'heart-outline'}
                  size={24}
                  color={localFilters.favoriteOnly ? colors.primary : colors.textMuted}
                />
                <Text style={styles.toggleText}>Favoris uniquement</Text>
              </View>
              {localFilters.favoriteOnly && (
                <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
              )}
            </TouchableOpacity>
          </View>

          {/* Sources */}
          {sources.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Sources {localFilters.sourceIds.length > 0 && `(${localFilters.sourceIds.length})`}
              </Text>
              <View style={styles.sourcesList}>
                {sources.map((source) => {
                  const isSelected = localFilters.sourceIds.includes(source.id);
                  return (
                    <TouchableOpacity
                      key={source.id}
                      style={[styles.sourceChip, isSelected && styles.sourceChipActive]}
                      onPress={() => toggleSource(source.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.sourceChipText, isSelected && styles.sourceChipTextActive]}>
                        {source.name}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={16} color={colors.primary} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          {hasActiveFilters && (
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
              <Text style={styles.resetText}>Réinitialiser</Text>
            </TouchableOpacity>
          )}
          <Button title="Appliquer les filtres" onPress={handleApply} style={styles.applyButton} />
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xl,
      paddingBottom: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    closeButton: {
      padding: spacing.xs,
    },
    title: {
      ...typography.title,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      ...typography.subheading,
      color: colors.textPrimary,
      fontWeight: '700',
      marginBottom: spacing.md,
    },
    optionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    gridOption: {
      flex: 1,
      minWidth: '45%',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.lg,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    gridOptionActive: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary,
    },
    gridOptionText: {
      ...typography.body,
      color: colors.textMuted,
      fontWeight: '600',
    },
    gridOptionTextActive: {
      color: colors.primary,
    },
    toggleOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    toggleOptionActive: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary,
    },
    toggleLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    toggleText: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    sourcesList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    sourceChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: colors.surface,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    sourceChipActive: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary,
    },
    sourceChipText: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '600',
    },
    sourceChipTextActive: {
      color: colors.primary,
    },
    footer: {
      padding: spacing.lg,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      gap: spacing.sm,
    },
    resetButton: {
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    resetText: {
      ...typography.body,
      color: colors.textMuted,
      fontWeight: '600',
    },
    applyButton: {
      marginTop: 0,
    },
  });
