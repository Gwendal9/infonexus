import { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetContainer } from './WidgetContainer';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface TrendingRepo {
  name: string;
  fullName: string;
  description: string;
  stars: number;
  language: string;
  url: string;
}

const LANGUAGE_COLORS: Record<string, string> = {
  JavaScript: '#f1e05a',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  Java: '#b07219',
  Go: '#00ADD8',
  Rust: '#dea584',
  'C++': '#f34b7d',
  C: '#555555',
  Swift: '#F05138',
  Kotlin: '#A97BFF',
  Ruby: '#701516',
  PHP: '#4F5D95',
  Dart: '#00B4AB',
  Shell: '#89e051',
};

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

interface GitHubWidgetProps {
  compact?: boolean;
  expanded?: boolean;
}

export function GitHubWidget({ compact, expanded }: GitHubWidgetProps) {
  const colors = useColors();
  const styles = createStyles(colors, compact, expanded);
  const [repos, setRepos] = useState<TrendingRepo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrending();
  }, []);

  const fetchTrending = async () => {
    try {
      const since = new Date();
      since.setDate(since.getDate() - 7);
      const dateStr = since.toISOString().split('T')[0];
      const res = await fetch(
        `https://api.github.com/search/repositories?q=created:>${dateStr}&sort=stars&order=desc&per_page=10`
      );
      const data = await res.json();
      if (data.items) {
        setRepos(
          data.items.map((item: any) => ({
            name: item.name,
            fullName: item.full_name,
            description: item.description || '',
            stars: item.stargazers_count,
            language: item.language || 'Unknown',
            url: item.html_url,
          }))
        );
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  const topRepo = repos[0];

  if (compact) {
    return (
      <WidgetContainer title="GitHub" icon="logo-github" iconColor="#333" compact>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : topRepo ? (
          <View style={styles.compactContent}>
            <Text style={styles.compactName} numberOfLines={1}>{topRepo.name}</Text>
            <Text style={styles.compactDesc} numberOfLines={2}>{topRepo.description}</Text>
            <View style={styles.compactMeta}>
              <Ionicons name="star" size={10} color="#FFB800" />
              <Text style={styles.compactStars}>{formatStars(topRepo.stars)}</Text>
              <View style={[styles.langDot, { backgroundColor: LANGUAGE_COLORS[topRepo.language] || colors.textMuted }]} />
              <Text style={styles.compactLang}>{topRepo.language}</Text>
            </View>
          </View>
        ) : (
          <Text style={styles.compactDesc}>Indisponible</Text>
        )}
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title="GitHub Trending" icon="logo-github" iconColor="#333" expanded={expanded}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View style={styles.list}>
          {repos.slice(0, expanded ? 10 : 5).map((repo, i) => (
            <TouchableOpacity
              key={repo.fullName}
              style={styles.repoItem}
              onPress={() => Linking.openURL(repo.url)}
              activeOpacity={0.7}
            >
              <View style={styles.repoHeader}>
                <Text style={styles.repoRank}>#{i + 1}</Text>
                <Text style={styles.repoName} numberOfLines={1}>{repo.fullName}</Text>
              </View>
              <Text style={styles.repoDesc} numberOfLines={2}>{repo.description}</Text>
              <View style={styles.repoMeta}>
                <Ionicons name="star" size={12} color="#FFB800" />
                <Text style={styles.repoStars}>{formatStars(repo.stars)}</Text>
                <View style={[styles.langDot, { backgroundColor: LANGUAGE_COLORS[repo.language] || colors.textMuted }]} />
                <Text style={styles.repoLang}>{repo.language}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </WidgetContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>, compact?: boolean, expanded?: boolean) =>
  StyleSheet.create({
    compactContent: { flex: 1, justifyContent: 'center', gap: 2 },
    compactName: { ...typography.caption, fontWeight: '700', color: colors.textPrimary },
    compactDesc: { ...typography.small, color: colors.textMuted, lineHeight: 14 },
    compactMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
    compactStars: { ...typography.small, color: colors.textMuted, fontSize: 10 },
    compactLang: { ...typography.small, color: colors.textMuted, fontSize: 10 },
    langDot: { width: 8, height: 8, borderRadius: 4 },
    list: { gap: spacing.sm },
    repoItem: {
      padding: spacing.md,
      backgroundColor: colors.background,
      borderRadius: 12,
      gap: spacing.xxs,
    },
    repoHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
    repoRank: { ...typography.caption, fontWeight: '700', color: colors.primary },
    repoName: { ...typography.body, fontWeight: '600', color: colors.textPrimary, flex: 1 },
    repoDesc: { ...typography.caption, color: colors.textSecondary, lineHeight: 18 },
    repoMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginTop: spacing.xxs },
    repoStars: { ...typography.caption, color: colors.textMuted },
    repoLang: { ...typography.caption, color: colors.textMuted },
  });
