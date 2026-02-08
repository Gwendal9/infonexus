import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetContainer } from './WidgetContainer';
import { useColors } from '@/contexts/ThemeContext';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  sourceName: string;
}

interface NewsWidgetProps {
  compact?: boolean;
  expanded?: boolean;
}

const getRelativeTime = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `il y a ${diffMin}min`;
  const diffH = Math.floor(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  return `il y a ${diffD}j`;
};

export function NewsWidget({ compact, expanded }: NewsWidgetProps) {
  const colors = useColors();
  const { config } = useWidgetConfig();
  const { category, apiKey } = config.settings.news;

  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchNews = useCallback(async () => {
    if (!apiKey) return;
    try {
      setLoading(true);
      setError(false);

      const response = await fetch(
        `https://gnews.io/api/v4/top-headlines?lang=fr&country=fr&max=10&category=${encodeURIComponent(category)}&token=${encodeURIComponent(apiKey)}`
      );

      if (!response.ok) throw new Error('Failed to fetch news');

      const data = await response.json();

      const newsData: NewsArticle[] = (data.articles ?? []).map((article: any) => ({
        title: article.title,
        description: article.description ?? '',
        url: article.url,
        publishedAt: article.publishedAt,
        sourceName: article.source?.name ?? '',
      }));

      setArticles(newsData);
    } catch (err) {
      console.error('[NewsWidget] Error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [apiKey, category]);

  useEffect(() => {
    if (apiKey) {
      fetchNews();
      const interval = setInterval(fetchNews, 30 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchNews, apiKey]);

  const styles = createStyles(colors, compact, expanded);

  if (!apiKey) {
    return (
      <WidgetContainer title="Actu" icon="newspaper" compact={compact} expanded={expanded}>
        <Text style={styles.errorText}>Clé API requise (Réglages)</Text>
      </WidgetContainer>
    );
  }

  if (loading && articles.length === 0) {
    return (
      <WidgetContainer title="Actu" icon="newspaper" compact={compact} expanded={expanded}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </WidgetContainer>
    );
  }

  if (error || articles.length === 0) {
    return (
      <WidgetContainer title="Actu" icon="newspaper" compact={compact} expanded={expanded}>
        <Text style={styles.errorText}>Indisponible</Text>
      </WidgetContainer>
    );
  }

  if (compact) {
    const main = articles[0];
    return (
      <WidgetContainer title="Actu" icon="newspaper" compact>
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>{main.title}</Text>
          <Text style={styles.compactSource}>{main.sourceName}</Text>
        </View>
      </WidgetContainer>
    );
  }

  const displayArticles = expanded ? articles : articles.slice(0, 3);

  return (
    <WidgetContainer title="Actu" icon="newspaper" expanded={expanded}>
      <View style={styles.content}>
        {displayArticles.map((article, index) => (
          <View key={index}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.articleRow}>
              <View style={styles.articleInfo}>
                <Text style={styles.articleTitle} numberOfLines={expanded ? 3 : 2}>
                  {article.title}
                </Text>
                {expanded && article.description ? (
                  <Text style={styles.articleDescription} numberOfLines={2}>
                    {article.description}
                  </Text>
                ) : null}
                <View style={styles.articleMeta}>
                  <Text style={styles.articleSource}>{article.sourceName}</Text>
                  <Text style={styles.articleTime}>{getRelativeTime(article.publishedAt)}</Text>
                </View>
              </View>
              {expanded && (
                <TouchableOpacity
                  style={styles.readButton}
                  onPress={() => Linking.openURL(article.url)}
                >
                  <Ionicons name="open-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
              )}
            </View>
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
      justifyContent: 'center',
      gap: spacing.xs,
    },
    compactTitle: {
      ...typography.caption,
      color: colors.textPrimary,
      fontWeight: '600',
      lineHeight: 16,
    },
    compactSource: {
      fontSize: 10,
      color: colors.textMuted,
    },
    content: {
      gap: expanded ? spacing.sm : spacing.xs,
    },
    articleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: expanded ? spacing.sm : spacing.xs,
      gap: spacing.sm,
    },
    articleInfo: {
      flex: 1,
      gap: 4,
    },
    articleTitle: {
      ...(expanded ? typography.body : typography.caption),
      color: colors.textPrimary,
      fontWeight: '600',
    },
    articleDescription: {
      ...typography.caption,
      color: colors.textSecondary,
      lineHeight: 18,
    },
    articleMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: 2,
    },
    articleSource: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
      fontSize: 11,
    },
    articleTime: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 11,
    },
    readButton: {
      padding: spacing.xs,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    errorText: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
