import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSearchHistory } from '@/contexts/SearchHistoryContext';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface SearchHistoryProps {
  onSelectQuery: (query: string) => void;
}

export function SearchHistory({ onSelectQuery }: SearchHistoryProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const { history, removeSearch, clearHistory } = useSearchHistory();

  if (history.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recherches récentes</Text>
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            clearHistory();
          }}
          style={styles.clearButton}
        >
          <Text style={styles.clearText}>Effacer tout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyList}>
        {history.map((query, index) => (
          <View key={query} style={styles.historyItem}>
            <TouchableOpacity
              style={styles.historyItemMain}
              onPress={() => {
                Haptics.selectionAsync();
                onSelectQuery(query);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="time-outline" size={18} color={colors.textMuted} />
              <Text style={styles.historyText} numberOfLines={1}>
                {query}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                removeSearch(query);
              }}
              style={styles.removeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      padding: spacing.md,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    title: {
      ...typography.subheading,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    clearButton: {
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.sm,
    },
    clearText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    historyList: {
      gap: spacing.xs,
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      overflow: 'hidden',
    },
    historyItemMain: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.md,
      paddingLeft: spacing.md,
      paddingRight: spacing.sm,
    },
    historyText: {
      ...typography.body,
      color: colors.textPrimary,
      flex: 1,
    },
    removeButton: {
      padding: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
