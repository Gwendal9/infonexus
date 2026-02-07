import { StyleSheet, View } from 'react-native';
import { SourceCard } from '@/components/SourceCard';
import { ThemeChip } from '@/components/ThemeChip';
import { Source, Theme } from '@/types/database';
import { spacing } from '@/theme/spacing';

interface SourceItemProps {
  source: Source;
  themes: Theme[];
  assignedThemeIds: string[];
  onDeleteSource: () => void;
  onToggleTheme: (themeId: string) => void;
}

export function SourceItem({
  source,
  themes,
  assignedThemeIds,
  onDeleteSource,
  onToggleTheme,
}: SourceItemProps) {
  return (
    <View>
      <SourceCard source={source} onDelete={onDeleteSource} />
      {themes.length > 0 && (
        <View style={styles.sourceThemes}>
          {themes.map((theme) => (
            <ThemeChip
              key={`${source.id}-${theme.id}`}
              theme={theme}
              selected={assignedThemeIds.includes(theme.id)}
              onPress={() => onToggleTheme(theme.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  sourceThemes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
    paddingLeft: spacing.xs,
  },
});
