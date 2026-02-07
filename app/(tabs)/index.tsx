import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ArticleCard } from '@/components/ArticleCard';
import { ArticleCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { ThemeTabs } from '@/components/ThemeTabs';
import { Button } from '@/components/Button';
import { useArticles, ArticleWithSource } from '@/lib/queries/useArticles';
import { useSources } from '@/lib/queries/useSources';
import { useFavoriteIds } from '@/lib/queries/useFavorites';
import { useThemes } from '@/lib/queries/useThemes';
import { useAllSourceThemes } from '@/lib/queries/useSourceThemes';
import { useRefreshSources } from '@/lib/mutations/useRefreshSources';
import { useToggleFavorite } from '@/lib/mutations/useFavoriteMutations';
import { useColors } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function FeedScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  const styles = createStyles(colors);

  const { data: articles, isLoading, refetch, isRefetching } = useArticles();
  const { data: sources } = useSources();
  const { data: favoriteIds } = useFavoriteIds();
  const { data: themes } = useThemes();
  const { data: sourceThemes } = useAllSourceThemes();
  const refreshSources = useRefreshSources();
  const toggleFavorite = useToggleFavorite();

  const { showSuccess, showError } = useToast();

  const handleRefresh = useCallback(async () => {
    try {
      const results = await refreshSources.mutateAsync();
      await refetch();

      // Count results
      const successCount = results.filter((r) => r.success).length;
      const errorCount = results.filter((r) => !r.success).length;
      const totalArticles = results.reduce((sum, r) => sum + r.articlesCount, 0);

      if (results.length === 0) {
        showError('Aucune source configurée');
      } else if (errorCount === 0) {
        showSuccess(`${totalArticles} article${totalArticles !== 1 ? 's' : ''} récupéré${totalArticles !== 1 ? 's' : ''}`);
      } else if (successCount === 0) {
        showError(`Toutes les sources en erreur (${errorCount})`);
      } else {
        showSuccess(`${totalArticles} articles • ${errorCount} source${errorCount !== 1 ? 's' : ''} en erreur`);
      }
    } catch (err) {
      showError('Erreur lors du rafraîchissement');
    }
  }, [refreshSources, refetch, showSuccess, showError]);

  const handleArticlePress = useCallback((article: ArticleWithSource) => {
    router.push(`/article/${article.id}`);
  }, [router]);

  const handleToggleFavorite = useCallback(
    (articleId: string) => {
      const isFavorite = favoriteIds?.has(articleId) ?? false;
      toggleFavorite.mutate({ articleId, isFavorite });
    },
    [favoriteIds, toggleFavorite]
  );

  const handleSourcePress = useCallback((sourceId: string | null) => {
    Haptics.selectionAsync();
    setSelectedSourceId(sourceId);
  }, []);

  const isSearching = searchQuery.trim().length > 0;

  const filteredArticles = useMemo(() => {
    if (!articles) return [];

    let result = articles;

    // When searching, search ALL articles (ignore theme/source filters)
    if (isSearching) {
      const query = searchQuery.toLowerCase();
      return result.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.summary?.toLowerCase().includes(query) ||
          a.source?.name.toLowerCase().includes(query)
      );
    }

    // Filter by theme
    if (selectedThemeId && sourceThemes) {
      const sourcesWithTheme = Array.from(sourceThemes.entries())
        .filter(([_, themeIds]) => themeIds.includes(selectedThemeId))
        .map(([sourceId]) => sourceId);
      result = result.filter((a) => sourcesWithTheme.includes(a.source_id));
    }

    // Filter by source
    if (selectedSourceId) {
      result = result.filter((a) => a.source_id === selectedSourceId);
    }

    return result;
  }, [articles, selectedSourceId, selectedThemeId, sourceThemes, searchQuery, isSearching]);

  // Get sources for current theme
  const filteredSources = useMemo(() => {
    if (!sources) return [];
    if (!selectedThemeId || !sourceThemes) return sources;

    return sources.filter((source) => {
      const themeIds = sourceThemes.get(source.id) ?? [];
      return themeIds.includes(selectedThemeId);
    });
  }, [sources, selectedThemeId, sourceThemes]);

  const isRefreshing = isRefetching || refreshSources.isPending;

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonContainer}>
          <ArticleCardSkeleton index={0} />
          <ArticleCardSkeleton index={1} />
          <ArticleCardSkeleton index={2} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search Results Banner */}
      {isSearching && (
        <View style={styles.searchResultsBanner}>
          <Ionicons name="search" size={16} color={colors.primary} />
          <Text style={styles.searchResultsText}>
            {filteredArticles.length} résultat{filteredArticles.length !== 1 ? 's' : ''} dans tous les articles
          </Text>
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearch}>Effacer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Theme Tabs */}
      {!isSearching && themes && themes.length > 0 && (
        <ThemeTabs
          themes={themes}
          selectedThemeId={selectedThemeId}
          onSelectTheme={setSelectedThemeId}
        />
      )}

      {/* Source Filters */}
      {!isSearching && filteredSources.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.sourceFiltersContainer}
          contentContainerStyle={styles.filtersContent}>
          <TouchableOpacity
            style={[styles.sourceChip, !selectedSourceId && styles.sourceChipActive]}
            onPress={() => handleSourcePress(null)}>
            <Text style={[styles.sourceText, !selectedSourceId && styles.sourceTextActive]}>
              Toutes
            </Text>
          </TouchableOpacity>
          {filteredSources.map((source) => (
            <TouchableOpacity
              key={source.id}
              style={[styles.sourceChip, selectedSourceId === source.id && styles.sourceChipActive]}
              onPress={() => handleSourcePress(selectedSourceId === source.id ? null : source.id)}>
              <Text
                style={[
                  styles.sourceText,
                  selectedSourceId === source.id && styles.sourceTextActive,
                ]}
                numberOfLines={1}>
                {source.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <FlatList
        data={filteredArticles}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <ArticleCard
            article={item}
            onPress={() => handleArticlePress(item)}
            isFavorite={favoriteIds?.has(item.id)}
            onToggleFavorite={() => handleToggleFavorite(item.id)}
            index={index}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon={isSearching || selectedSourceId || selectedThemeId ? 'search-outline' : 'newspaper-outline'}
            title={isSearching ? 'Aucun résultat' : selectedSourceId || selectedThemeId ? 'Aucun article' : 'Aucun article'}
            description={
              isSearching
                ? `Aucun article trouvé pour "${searchQuery}"`
                : selectedSourceId || selectedThemeId
                  ? 'Aucun article pour ce filtre.'
                  : 'Ajoutez des sources puis appuyez sur le bouton pour charger les articles.'
            }
          >
            {!isSearching && !selectedSourceId && !selectedThemeId && (
              <Button
                title="Charger les articles"
                onPress={handleRefresh}
                loading={isRefreshing}
              />
            )}
          </EmptyState>
        }
        contentContainerStyle={filteredArticles.length === 0 ? styles.emptyList : styles.list}
        ListHeaderComponent={
          refreshSources.isPending ? (
            <Animated.View entering={FadeIn} style={styles.refreshBanner}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.refreshText}>Récupération des articles...</Text>
            </Animated.View>
          ) : null
        }
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    skeletonContainer: {
      padding: spacing.md,
    },
    searchContainer: {
      padding: spacing.md,
      paddingBottom: spacing.sm,
      backgroundColor: colors.surface,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    searchInput: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      padding: 0,
    },
    sourceFiltersContainer: {
      backgroundColor: colors.background,
      height: 44,
    },
    filtersContent: {
      paddingHorizontal: spacing.md,
      alignItems: 'center',
      height: '100%',
    },
    sourceChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 14,
      backgroundColor: colors.surface,
      marginRight: spacing.sm,
      height: 28,
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    sourceChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    sourceText: {
      fontSize: 12,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    sourceTextActive: {
      color: colors.surface,
    },
    list: {
      padding: spacing.md,
    },
    emptyList: {
      flexGrow: 1,
      padding: spacing.md,
    },
    refreshBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
      backgroundColor: colors.primary + '15',
      borderRadius: 8,
    },
    refreshText: {
      ...typography.body,
      color: colors.primary,
    },
    searchResultsBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.primary + '10',
      borderBottomWidth: 1,
      borderBottomColor: colors.primary + '20',
    },
    searchResultsText: {
      ...typography.body,
      color: colors.primary,
      flex: 1,
    },
    clearSearch: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '600',
    },
  });
