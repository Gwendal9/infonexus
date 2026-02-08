import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { WidgetContainer } from './WidgetContainer';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { getWordOfDay } from '@/lib/widgets/words';

interface WordMeaning {
  partOfSpeech: string;
  definitions: {
    definition: string;
    synonyms: string[];
    example?: string;
  }[];
}

interface WordData {
  word: string;
  meanings: WordMeaning[];
}

interface WordWidgetProps {
  compact?: boolean;
  expanded?: boolean;
}

export function WordWidget({ compact, expanded }: WordWidgetProps) {
  const colors = useColors();

  const [wordData, setWordData] = useState<WordData | null>(null);
  const [loading, setLoading] = useState(true);

  const todayEntry = getWordOfDay();

  const fetchWord = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `https://api.dictionaryapi.dev/api/v2/entries/fr/${encodeURIComponent(todayEntry.word)}`
      );

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const entry = data[0];
          const meanings: WordMeaning[] = (entry.meanings ?? []).map((m: any) => ({
            partOfSpeech: m.partOfSpeech ?? '',
            definitions: (m.definitions ?? []).map((d: any) => ({
              definition: d.definition ?? '',
              synonyms: d.synonyms ?? [],
              example: d.example,
            })),
          }));
          // Only use API data if it has actual definitions
          if (meanings.length > 0 && meanings.some(m => m.definitions.length > 0)) {
            setWordData({ word: entry.word, meanings });
            return;
          }
        }
      }

      // Fallback to embedded definition
      setWordData({
        word: todayEntry.word,
        meanings: [{
          partOfSpeech: todayEntry.partOfSpeech,
          definitions: [{
            definition: todayEntry.definition,
            synonyms: [],
          }],
        }],
      });
    } catch {
      // Fallback to embedded definition on any error
      setWordData({
        word: todayEntry.word,
        meanings: [{
          partOfSpeech: todayEntry.partOfSpeech,
          definitions: [{
            definition: todayEntry.definition,
            synonyms: [],
          }],
        }],
      });
    } finally {
      setLoading(false);
    }
  }, [todayEntry]);

  useEffect(() => {
    fetchWord();
  }, [fetchWord]);

  const styles = createStyles(colors, compact, expanded);

  if (loading) {
    return (
      <WidgetContainer title="Mot du jour" icon="book" compact={compact} expanded={expanded}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </WidgetContainer>
    );
  }

  const word = wordData?.word ?? todayEntry.word;
  const firstMeaning = wordData?.meanings?.[0];
  const firstDef = firstMeaning?.definitions?.[0];

  if (compact) {
    return (
      <WidgetContainer title="Mot du jour" icon="book" compact>
        <View style={styles.compactContent}>
          <Text style={styles.compactWord}>{word}</Text>
          {firstMeaning && (
            <Text style={styles.compactPos}>{firstMeaning.partOfSpeech}</Text>
          )}
        </View>
      </WidgetContainer>
    );
  }

  // Normal mode
  if (!expanded) {
    return (
      <WidgetContainer title="Mot du jour" icon="book">
        <View style={styles.content}>
          <Text style={styles.word}>{word}</Text>
          {firstMeaning && (
            <Text style={styles.partOfSpeech}>{firstMeaning.partOfSpeech}</Text>
          )}
          {firstDef && (
            <Text style={styles.definition} numberOfLines={3}>{firstDef.definition}</Text>
          )}
        </View>
      </WidgetContainer>
    );
  }

  // Expanded mode
  return (
    <WidgetContainer title="Mot du jour" icon="book" expanded>
      <View style={styles.content}>
        <Text style={styles.wordExpanded}>{word}</Text>
        {wordData?.meanings?.map((meaning, mi) => (
          <View key={mi} style={styles.meaningBlock}>
            <Text style={styles.partOfSpeechExpanded}>{meaning.partOfSpeech}</Text>
            {meaning.definitions.map((def, di) => (
              <View key={di} style={styles.defBlock}>
                <Text style={styles.definitionExpanded}>
                  {meaning.definitions.length > 1 ? `${di + 1}. ` : ''}{def.definition}
                </Text>
                {def.example && (
                  <Text style={styles.example}>{'\u00AB'} {def.example} {'\u00BB'}</Text>
                )}
                {def.synonyms.length > 0 && (
                  <Text style={styles.synonyms}>
                    Synonymes : {def.synonyms.slice(0, 5).join(', ')}
                  </Text>
                )}
              </View>
            ))}
          </View>
        ))}
      </View>
    </WidgetContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>, compact?: boolean, expanded?: boolean) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    compactContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    compactWord: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
      textTransform: 'capitalize',
    },
    compactPos: {
      ...typography.caption,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
    content: {
      gap: spacing.sm,
    },
    word: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.textPrimary,
      textTransform: 'capitalize',
    },
    wordExpanded: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.textPrimary,
      textTransform: 'capitalize',
      marginBottom: spacing.sm,
    },
    partOfSpeech: {
      ...typography.caption,
      color: colors.primary,
      fontStyle: 'italic',
    },
    partOfSpeechExpanded: {
      ...typography.body,
      color: colors.primary,
      fontStyle: 'italic',
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    definition: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 22,
    },
    definitionExpanded: {
      ...typography.body,
      color: colors.textPrimary,
      lineHeight: 24,
    },
    meaningBlock: {
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    defBlock: {
      marginBottom: spacing.sm,
    },
    example: {
      ...typography.caption,
      color: colors.textMuted,
      fontStyle: 'italic',
      marginTop: 4,
    },
    synonyms: {
      ...typography.caption,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });
