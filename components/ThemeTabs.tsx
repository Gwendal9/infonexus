import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/types/database';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';

interface ThemeTabsProps {
  themes: Theme[];
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string | null) => void;
}

export function ThemeTabs({ themes, selectedThemeId, onSelectTheme }: ThemeTabsProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const scrollRef = useRef<ScrollView>(null);

  const allTabs = [{ id: null, name: 'Tous', color: colors.primary }, ...themes];

  const handlePress = (themeId: string | null) => {
    Haptics.selectionAsync();
    onSelectTheme(themeId);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {allTabs.map((tab) => {
          const isSelected = tab.id === selectedThemeId;
          return (
            <TouchableOpacity
              key={tab.id ?? 'all'}
              style={styles.tab}
              onPress={() => handlePress(tab.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  isSelected && styles.tabTextActive,
                  isSelected && tab.id && { color: tab.color },
                ]}
              >
                {tab.name}
              </Text>
              {isSelected && (
                <View
                  style={[
                    styles.indicator,
                    { backgroundColor: tab.id ? tab.color : colors.primary },
                  ]}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
    },
    tab: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      position: 'relative',
    },
    tabText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textMuted,
    },
    tabTextActive: {
      color: colors.primary,
    },
    indicator: {
      position: 'absolute',
      bottom: 0,
      left: spacing.lg,
      right: spacing.lg,
      height: 3,
      borderRadius: 1.5,
    },
  });
