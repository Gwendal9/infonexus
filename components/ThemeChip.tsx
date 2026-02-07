import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/types/database';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ThemeChipProps {
  theme: Theme;
  selected?: boolean;
  onPress?: () => void;
  onDelete?: () => void;
  showDelete?: boolean;
}

export function ThemeChip({ theme, selected, onPress, onDelete, showDelete }: ThemeChipProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const handlePress = () => {
    Haptics.selectionAsync();
    onPress?.();
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDelete?.();
  };

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { borderColor: theme.color },
        selected && { backgroundColor: theme.color },
      ]}
      onPress={handlePress}
      activeOpacity={0.7}>
      <Text style={[styles.text, selected && styles.textSelected]}>{theme.name}</Text>
      {showDelete && onDelete && (
        <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
          <Ionicons name="close-circle" size={18} color={selected ? colors.surface : theme.color} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 20,
      borderWidth: 1.5,
      backgroundColor: colors.surface,
      marginRight: spacing.sm,
      marginBottom: spacing.sm,
    },
    text: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    textSelected: {
      color: colors.surface,
    },
    deleteButton: {
      marginLeft: spacing.xs,
    },
  });
