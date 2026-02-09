import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/contexts/ThemeContext';
import { COLOR_PALETTE } from '@/theme/palette';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export interface OnboardingTheme {
  name: string;
  color: string;
}

interface StepChooseThemesProps {
  themes: OnboardingTheme[];
  onThemesChange: (themes: OnboardingTheme[]) => void;
}

const SUGGESTIONS = [
  { name: 'Actualités', color: '#F44336' },
  { name: 'Tech', color: '#2196F3' },
  { name: 'Sport', color: '#4CAF50' },
  { name: 'Science', color: '#673AB7' },
  { name: 'Culture', color: '#FF9800' },
  { name: 'Finance', color: '#009688' },
  { name: 'International', color: '#3F51B5' },
];

export function StepChooseThemes({ themes, onThemesChange }: StepChooseThemesProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const [customName, setCustomName] = useState('');
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

  const addTheme = (theme: OnboardingTheme) => {
    if (themes.length >= 7) return;
    if (themes.some((t) => t.name.toLowerCase() === theme.name.toLowerCase())) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onThemesChange([...themes, theme]);
  };

  const removeTheme = (name: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onThemesChange(themes.filter((t) => t.name !== name));
  };

  const handleAddCustom = () => {
    const name = customName.trim();
    if (!name) return;
    addTheme({ name, color: COLOR_PALETTE[selectedColorIndex] });
    setCustomName('');
  };

  const availableSuggestions = SUGGESTIONS.filter(
    (s) => !themes.some((t) => t.name.toLowerCase() === s.name.toLowerCase())
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.delay(100)}>
        <Text style={styles.title}>Choisissez vos thèmes</Text>
        <Text style={styles.subtitle}>Organisez vos sources par catégories (1 à 7 thèmes)</Text>
      </Animated.View>

      {/* Selected themes */}
      {themes.length > 0 && (
        <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
          <Text style={styles.sectionTitle}>Vos thèmes ({themes.length}/7)</Text>
          <View style={styles.chipContainer}>
            {themes.map((theme) => (
              <TouchableOpacity
                key={theme.name}
                style={[styles.chip, { backgroundColor: theme.color + '20', borderColor: theme.color }]}
                onPress={() => removeTheme(theme.name)}
              >
                <View style={[styles.chipDot, { backgroundColor: theme.color }]} />
                <Text style={[styles.chipText, { color: theme.color }]}>{theme.name}</Text>
                <Ionicons name="close" size={16} color={theme.color} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Suggestions */}
      {availableSuggestions.length > 0 && (
        <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
          <Text style={styles.sectionTitle}>Suggestions</Text>
          <View style={styles.chipContainer}>
            {availableSuggestions.map((suggestion) => (
              <TouchableOpacity
                key={suggestion.name}
                style={[styles.suggestionChip, { borderColor: colors.border }]}
                onPress={() => addTheme(suggestion)}
              >
                <View style={[styles.chipDot, { backgroundColor: suggestion.color }]} />
                <Text style={[styles.chipText, { color: colors.textPrimary }]}>{suggestion.name}</Text>
                <Ionicons name="add" size={16} color={colors.textMuted} />
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      )}

      {/* Custom theme */}
      <Animated.View entering={FadeInDown.delay(400)} style={styles.section}>
        <Text style={styles.sectionTitle}>Thème personnalisé</Text>
        <View style={styles.customRow}>
          <TextInput
            style={styles.input}
            placeholder="Nom du thème..."
            placeholderTextColor={colors.textMuted}
            value={customName}
            onChangeText={setCustomName}
            onSubmitEditing={handleAddCustom}
            maxLength={20}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={handleAddCustom}
            disabled={!customName.trim()}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Color picker */}
        <View style={styles.colorGrid}>
          {COLOR_PALETTE.slice(0, 12).map((color, index) => (
            <TouchableOpacity
              key={color}
              style={[
                styles.colorCell,
                { backgroundColor: color },
                selectedColorIndex === index && styles.colorCellSelected,
              ]}
              onPress={() => setSelectedColorIndex(index)}
            >
              {selectedColorIndex === index && (
                <Ionicons name="checkmark" size={14} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
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
    section: {
      marginBottom: spacing.lg,
    },
    sectionTitle: {
      ...typography.body,
      fontWeight: '600',
      color: colors.textPrimary,
      marginBottom: spacing.sm,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
    },
    suggestionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      borderWidth: 1,
      borderStyle: 'dashed',
    },
    chipDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    chipText: {
      fontSize: 14,
      fontWeight: '500',
    },
    customRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    input: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      backgroundColor: colors.surface,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    addButton: {
      width: 44,
      height: 44,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    colorCell: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorCellSelected: {
      borderWidth: 3,
      borderColor: '#FFFFFF',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 4,
    },
  });
