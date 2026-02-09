import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { sourceCatalog, categories, CatalogSource } from '@/lib/data/sourceCatalog';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface StepSelectSourcesProps {
  selectedSourceIds: string[];
  onSourcesChange: (sourceIds: string[]) => void;
}

export function StepSelectSources({ selectedSourceIds, onSourcesChange }: StepSelectSourcesProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const toggleSource = (id: string) => {
    Haptics.selectionAsync();
    if (selectedSourceIds.includes(id)) {
      onSourcesChange(selectedSourceIds.filter((s) => s !== id));
    } else {
      onSourcesChange([...selectedSourceIds, id]);
    }
  };

  const getSourcesByCategory = (category: string): CatalogSource[] => {
    return sourceCatalog.filter((s) => s.category === category);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.delay(100)}>
        <Text style={styles.title}>Sélectionnez vos sources</Text>
        <Text style={styles.subtitle}>
          {selectedSourceIds.length} source{selectedSourceIds.length !== 1 ? 's' : ''} sélectionnée{selectedSourceIds.length !== 1 ? 's' : ''}
        </Text>
      </Animated.View>

      {categories.map((category, catIndex) => {
        const sources = getSourcesByCategory(category);
        if (sources.length === 0) return null;

        return (
          <Animated.View key={category} entering={FadeInDown.delay(200 + catIndex * 50)} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            <View style={styles.sourceGrid}>
              {sources.map((source) => {
                const isSelected = selectedSourceIds.includes(source.id);
                return (
                  <TouchableOpacity
                    key={source.id}
                    style={[
                      styles.sourceChip,
                      { borderColor: isSelected ? colors.primary : colors.border },
                      isSelected && { backgroundColor: colors.primary + '15' },
                    ]}
                    onPress={() => toggleSource(source.id)}
                  >
                    <Ionicons
                      name={source.type === 'youtube' ? 'logo-youtube' : 'globe-outline'}
                      size={16}
                      color={isSelected ? colors.primary : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.sourceName,
                        { color: isSelected ? colors.primary : colors.textPrimary },
                      ]}
                      numberOfLines={1}
                    >
                      {source.name}
                    </Text>
                    {isSelected && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    title: {
      ...typography.titleLg,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    categorySection: {
      marginBottom: spacing.lg,
    },
    categoryTitle: {
      ...typography.body,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    sourceGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    sourceChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    sourceName: {
      fontSize: 13,
      fontWeight: '500',
      maxWidth: 140,
    },
  });
