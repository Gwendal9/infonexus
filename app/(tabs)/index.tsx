import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
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
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { ScrollToTopButton, useScrollToTop } from '@/components/ScrollToTopButton';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ArticleCard } from '@/components/ArticleCard';
import { SwipeableArticleCard } from '@/components/SwipeableArticleCard';
import { SearchResultCard } from '@/components/SearchResultCard';
import { ArticleCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { TopicArticleList } from '@/components/TopicArticleList';
import { AddTopicModal } from '@/components/AddTopicModal';
import { GroupedArticleList } from '@/components/GroupedArticleList';
import { SearchFiltersModal, SearchFilters } from '@/components/SearchFilters';
import { SearchHistory } from '@/components/SearchHistory';
import { TwoLevelNavigation } from '@/components/TwoLevelNavigation';
import { useArticles, ArticleWithSource } from '@/lib/queries/useArticles';
import { MainTab } from '@/types/database';
import { useSearchArticles } from '@/lib/queries/useSearchArticles';
import { useSearchHistory } from '@/contexts/SearchHistoryContext';
import { useFavoriteIds } from '@/lib/queries/useFavorites';
import { useThemes } from '@/lib/queries/useThemes';
import { useAllSourceThemes } from '@/lib/queries/useSourceThemes';
import { useReadArticleIds } from '@/lib/queries/useReadArticles';
import { useRefreshSources } from '@/lib/mutations/useRefreshSources';
import { useToggleFavorite } from '@/lib/mutations/useFavoriteMutations';
import { useMarkAsRead } from '@/lib/mutations/useReadMutations';
import { useAutoRefresh } from '@/lib/hooks/useAutoRefresh';
import { useColors } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { useTopics } from '@/contexts/TopicContext';
import { Topic } from '@/lib/topics/types';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function FeedScreen() {
  const colors = useColors();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  // New 2-level navigation state
  const [mainTab, setMainTab] = useState<MainTab>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  const MAIN_TABS: MainTab[] = ['all', 'categories', 'topics'];
  const currentTabIndexRef = useRef(0);
  currentTabIndexRef.current = MAIN_TABS.indexOf(mainTab);

  const swipeTabGesture = useMemo(() =>
    Gesture.Pan()
      .runOnJS(true)
      .activeOffsetX([-40, 40])
      .failOffsetY([-25, 25])
      .onEnd((event) => {
        const idx = currentTabIndexRef.current;
        if (Math.abs(event.translationX) > 60) {
          if (event.translationX < 0 && idx < MAIN_TABS.length - 1) {
            Haptics.selectionAsync();
            setMainTab(MAIN_TABS[idx + 1]);
          } else if (event.translationX > 0 && idx > 0) {
            Haptics.selectionAsync();
            setMainTab(MAIN_TABS[idx - 1]);
          }
        }
      }),
    [] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>();
  const [selectedSourceIds, setSelectedSourceIds] = useState<string[]>([]);
  const [filtersModalVisible, setFiltersModalVisible] = useState(false);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    dateRange: 'all',
    readStatus: 'all',
    favoriteOnly: false,
    sourceIds: [],
  });

  const styles = createStyles(colors);

  const { config: topicConfig, addTopic, updateTopic, deleteTopic } = useTopics();
  const { history, addSearch } = useSearchHistory();

  const { data: articlesData, isLoading, refetch, isRefetching, fetchNextPage } = useArticles();
  const articles = useMemo(() => articlesData?.pages.flat() ?? [], [articlesData]);
  const { data: favoriteIds } = useFavoriteIds();
  const { data: readArticleIds } = useReadArticleIds();
  const { data: themes } = useThemes();
  const { data: sourceThemes } = useAllSourceThemes();

  // Get all sources for filter modal
  const allSources = useMemo(() => {
    if (!articles) return [];
    const sourcesMap = new Map<string, { id: string; name: string }>();
    articles.forEach((article) => {
      if (article.source && !sourcesMap.has(article.source_id)) {
        sourcesMap.set(article.source_id, {
          id: article.source_id,
          name: article.source.name,
        });
      }
    });
    return Array.from(sourcesMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [articles]);
  // Filter articles by selected sources (for the "all" tab)
  const filteredFeedArticles = useMemo(() => {
    if (!articles) return [];
    if (selectedSourceIds.length === 0) return articles;
    return articles.filter((a) => selectedSourceIds.includes(a.source_id));
  }, [articles, selectedSourceIds]);

  const refreshSources = useRefreshSources();
  const toggleFavorite = useToggleFavorite();
  const markAsRead = useMarkAsRead();

  const { showSuccess, showError } = useToast();

  // Global search
  const isSearching = searchQuery.trim().length >= 2;
  const { data: searchResults, isLoading: isSearchLoading } = useSearchArticles(
    searchQuery,
    isSearching
  );

  // Track last search query to avoid duplicate additions
  const lastSearchQueryRef = useRef<string>('');
  const previousIsSearchLoadingRef = useRef(false);

  // Add search to history when search completes (loading goes from true to false)
  useEffect(() => {
    const trimmedQuery = searchQuery.trim();
    const searchJustCompleted = previousIsSearchLoadingRef.current && !isSearchLoading;

    // Update ref for next render
    previousIsSearchLoadingRef.current = isSearchLoading;

    // Only add when search just completed successfully
    if (searchJustCompleted && isSearching && trimmedQuery !== lastSearchQueryRef.current) {
      // Check if we have results (access searchResults directly, not as dependency)
      if (searchResults && searchResults.length > 0) {
        lastSearchQueryRef.current = trimmedQuery;
        addSearch(trimmedQuery);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearching, isSearchLoading, searchQuery, addSearch]);

  // Apply filters to search results
  const filteredSearchResults = useMemo(() => {
    if (!searchResults) return [];

    let filtered = [...searchResults];

    // Date range filter
    if (searchFilters.dateRange !== 'all') {
      const now = Date.now();
      const ranges = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000,
      };
      const maxAge = ranges[searchFilters.dateRange];
      filtered = filtered.filter((article) => {
        if (!article.published_at) return false;
        const age = now - new Date(article.published_at).getTime();
        return age <= maxAge;
      });
    }

    // Read status filter
    if (searchFilters.readStatus !== 'all' && readArticleIds) {
      filtered = filtered.filter((article) => {
        const isRead = readArticleIds.has(article.id);
        return searchFilters.readStatus === 'read' ? isRead : !isRead;
      });
    }

    // Favorite filter
    if (searchFilters.favoriteOnly && favoriteIds) {
      filtered = filtered.filter((article) => favoriteIds.has(article.id));
    }

    // Source filter
    if (searchFilters.sourceIds.length > 0) {
      filtered = filtered.filter((article) =>
        searchFilters.sourceIds.includes(article.source_id)
      );
    }

    return filtered;
  }, [searchResults, searchFilters, readArticleIds, favoriteIds]);

  const hasActiveFilters =
    searchFilters.dateRange !== 'all' ||
    searchFilters.readStatus !== 'all' ||
    searchFilters.favoriteOnly ||
    searchFilters.sourceIds.length > 0;

  // Auto-refresh sources when app becomes active
  useAutoRefresh({
    enabled: true,
    onRefreshComplete: (success) => {
      if (success) {
        refetch();
      }
    },
  });

  const handleRefresh = useCallback(async () => {
    try {
      const results = await refreshSources.mutateAsync();
      await refetch();

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
    } catch {
      showError('Erreur lors du rafraîchissement');
    }
  }, [refreshSources, refetch, showSuccess, showError]);

  const handleArticlePress = useCallback((article: ArticleWithSource) => {
    if (!readArticleIds?.has(article.id)) {
      markAsRead.mutate(article.id);
    }
    router.push(`/article/${article.id}`);
  }, [router, readArticleIds, markAsRead]);

  const handleToggleFavorite = useCallback(
    (articleId: string) => {
      const isFavorite = favoriteIds?.has(articleId) ?? false;
      toggleFavorite.mutate({ articleId, isFavorite });
    },
    [favoriteIds, toggleFavorite]
  );

  // Get articles for a specific theme
  const getArticlesForTheme = useCallback((themeId: string | null) => {
    if (!articles) return [];
    if (!themeId || !sourceThemes) return articles;

    const sourcesWithTheme = Array.from(sourceThemes.entries())
      .filter(([_, themeIds]) => themeIds.includes(themeId))
      .map(([sourceId]) => sourceId);
    return articles.filter((a) => sourcesWithTheme.includes(a.source_id));
  }, [articles, sourceThemes]);

  // Count unread articles per tab
  const unreadCounts = useMemo(() => {
    if (!articles || !readArticleIds) return new Map<string | null, number>();
    const counts = new Map<string | null, number>();

    // "Tous" tab
    counts.set(null, articles.filter(a => !readArticleIds.has(a.id)).length);

    // Theme tabs
    if (themes && sourceThemes) {
      for (const theme of themes) {
        const themeArticles = getArticlesForTheme(theme.id);
        counts.set(theme.id, themeArticles.filter(a => !readArticleIds.has(a.id)).length);
      }
    }

    return counts;
  }, [articles, readArticleIds, themes, sourceThemes, getArticlesForTheme]);

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

  // When user is typing in search (but hasn't reached 2 chars), show history
  const isTypingSearch = searchQuery.length > 0 && searchQuery.length < 2;
  if (isTypingSearch) {
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
              autoFocus
            />
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchAction}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <SearchHistory onSelectQuery={setSearchQuery} />
      </View>
    );
  }

  // When searching, show search results without pager
  if (isSearching) {
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
              <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.searchAction}>
                <Ionicons name="close-circle" size={20} color={colors.textMuted} />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setFiltersModalVisible(true);
              }}
              style={styles.filterButton}
            >
              <Ionicons
                name={hasActiveFilters ? 'options' : 'options-outline'}
                size={22}
                color={hasActiveFilters ? colors.primary : colors.textMuted}
              />
              {hasActiveFilters && <View style={styles.filterBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchResultsBanner}>
          <Ionicons name="search" size={16} color={colors.primary} />
          <Text style={styles.searchResultsText}>
            {isSearchLoading ? 'Recherche...' : `${filteredSearchResults.length} résultat${filteredSearchResults.length !== 1 ? 's' : ''}`}
            {hasActiveFilters && ' (filtrés)'}
          </Text>
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearch}>Effacer</Text>
          </TouchableOpacity>
        </View>

        {isSearchLoading ? (
          <View style={styles.searchLoading}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={filteredSearchResults}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <SearchResultCard
                article={item as unknown as ArticleWithSource}
                onPress={() => handleArticlePress(item as unknown as ArticleWithSource)}
                isFavorite={favoriteIds?.has(item.id)}
                onToggleFavorite={() => handleToggleFavorite(item.id)}
                isRead={readArticleIds?.has(item.id)}
                index={index}
                searchQuery={searchQuery}
              />
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <EmptyState
                icon="search-outline"
                title="Aucun résultat"
                description={
                  hasActiveFilters
                    ? 'Aucun article ne correspond aux filtres'
                    : `Aucun article trouvé pour "${searchQuery}"`
                }
              />
            }
          />
        )}

        <SearchFiltersModal
          visible={filtersModalVisible}
          onClose={() => setFiltersModalVisible(false)}
          filters={searchFilters}
          onApply={setSearchFilters}
          sources={allSources}
        />
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
        </View>
      </View>

      {/* Two-Level Navigation */}
      <TwoLevelNavigation
        mainTab={mainTab}
        onMainTabChange={setMainTab}
        categories={themes || []}
        topics={topicConfig.topics}
        selectedCategory={selectedCategory}
        selectedTopic={selectedTopic}
        onCategorySelect={setSelectedCategory}
        onTopicSelect={setSelectedTopic}
        onAddCategory={() => router.push('/(tabs)/sources')}
        onAddTopic={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          setEditingTopic(undefined);
          setTopicModalVisible(true);
        }}
        unreadCounts={unreadCounts}
      />

      {/* Source filter bar (visible only in "all" tab) */}
      {mainTab === 'all' && allSources.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sourceFilterBar}
          style={styles.sourceFilterBarContainer}
        >
          <TouchableOpacity
            style={[
              styles.sourceChip,
              selectedSourceIds.length === 0 && styles.sourceChipActive,
            ]}
            onPress={() => setSelectedSourceIds([])}
          >
            <Text
              style={[
                styles.sourceChipText,
                selectedSourceIds.length === 0 && styles.sourceChipTextActive,
              ]}
            >
              Toutes
            </Text>
          </TouchableOpacity>
          {allSources.map((source) => {
            const isSelected = selectedSourceIds.includes(source.id);
            return (
              <TouchableOpacity
                key={source.id}
                style={[styles.sourceChip, isSelected && styles.sourceChipActive]}
                onPress={() => {
                  setSelectedSourceIds((prev) =>
                    isSelected ? prev.filter((id) => id !== source.id) : [...prev, source.id]
                  );
                }}
              >
                <Text
                  style={[styles.sourceChipText, isSelected && styles.sourceChipTextActive]}
                  numberOfLines={1}
                >
                  {source.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* Swipeable content area */}
      <GestureDetector gesture={swipeTabGesture}>
        <View style={{ flex: 1 }}>
          {mainTab === 'all' && (
            <ThemeArticleList
              themeId={null}
              articles={filteredFeedArticles}
              favoriteIds={favoriteIds}
              readArticleIds={readArticleIds}
              isRefreshing={isRefreshing}
              isPending={refreshSources.isPending}
              onRefresh={handleRefresh}
              onArticlePress={handleArticlePress}
              onToggleFavorite={handleToggleFavorite}
              onMarkAsRead={(id: string) => markAsRead.mutate(id)}
              onEndReached={fetchNextPage}
              colors={colors}
            />
          )}

          {mainTab === 'categories' && (
            <ThemeArticleList
              themeId={selectedCategory}
              articles={getArticlesForTheme(selectedCategory)}
              favoriteIds={favoriteIds}
              readArticleIds={readArticleIds}
              isRefreshing={isRefreshing}
              isPending={refreshSources.isPending}
              onRefresh={handleRefresh}
              onArticlePress={handleArticlePress}
              onToggleFavorite={handleToggleFavorite}
              onMarkAsRead={(id: string) => markAsRead.mutate(id)}
              colors={colors}
            />
          )}

          {mainTab === 'topics' && selectedTopic && (
            <TopicArticleList topicId={selectedTopic} />
          )}

          {mainTab === 'topics' && !selectedTopic && (
            <EmptyState
              icon="bookmark-outline"
              title="Sélectionnez un sujet"
              description="Choisissez un sujet de veille ou créez-en un nouveau"
            >
              <Button
                title="Créer un sujet"
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setEditingTopic(undefined);
                  setTopicModalVisible(true);
                }}
              />
            </EmptyState>
          )}
        </View>
      </GestureDetector>

      <AddTopicModal
        visible={topicModalVisible}
        onClose={() => {
          setTopicModalVisible(false);
          setEditingTopic(undefined);
        }}
        onAdd={addTopic}
        onUpdate={(id, updates) => updateTopic(id, updates)}
        onDelete={deleteTopic}
        topic={editingTopic}
      />
    </View>
  );
}

// Separate component for article list in each theme page
interface ThemeArticleListProps {
  themeId: string | null;
  articles: ArticleWithSource[];
  favoriteIds: Set<string> | undefined;
  readArticleIds: Set<string> | undefined;
  isRefreshing: boolean;
  isPending: boolean;
  onRefresh: () => void;
  onArticlePress: (article: ArticleWithSource) => void;
  onToggleFavorite: (articleId: string) => void;
  onMarkAsRead: (articleId: string) => void;
  onEndReached?: () => void;
  colors: ReturnType<typeof useColors>;
}

function ThemeArticleList({
  themeId,
  articles,
  favoriteIds,
  readArticleIds,
  isRefreshing,
  isPending,
  onRefresh,
  onArticlePress,
  onToggleFavorite,
  onMarkAsRead,
  onEndReached,
  colors,
}: ThemeArticleListProps) {
  const styles = createStyles(colors);
  const listRef = useRef<any>(null);
  const { showButton, onScroll } = useScrollToTop();

  return (
    <View style={{ flex: 1 }}>
      <GroupedArticleList
        ref={listRef}
        articles={articles}
        favoriteIds={favoriteIds}
        readArticleIds={readArticleIds}
        onArticlePress={onArticlePress}
        onToggleFavorite={onToggleFavorite}
        onMarkAsRead={onMarkAsRead}
        onEndReached={onEndReached}
        onScroll={onScroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          isPending ? (
            <Animated.View entering={FadeIn} style={styles.refreshBanner}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.refreshText}>Récupération des articles...</Text>
            </Animated.View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            icon={themeId ? 'pricetag-outline' : 'newspaper-outline'}
            title="Aucun article"
            description={
              themeId
                ? 'Aucun article pour ce thème. Assignez des sources à ce thème.'
                : 'Ajoutez des sources puis tirez pour rafraîchir.'
            }
          >
            {!themeId && (
              <Button
                title="Charger les articles"
                onPress={onRefresh}
                loading={isRefreshing}
              />
            )}
          </EmptyState>
        }
      />
      <ScrollToTopButton
        visible={showButton}
        onPress={() => listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true })}
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
    searchAction: {
      padding: spacing.xs,
    },
    filterButton: {
      padding: spacing.xs,
      marginLeft: spacing.xs,
      position: 'relative',
    },
    filterBadge: {
      position: 'absolute',
      top: 4,
      right: 4,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
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
    searchLoading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingTop: spacing.xxl,
    },
    sourceFilterBarContainer: {
      maxHeight: 44,
      backgroundColor: colors.surface,
    },
    sourceFilterBar: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      gap: spacing.xs,
      flexDirection: 'row',
    },
    sourceChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    sourceChipActive: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '15',
    },
    sourceChipText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    sourceChipTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
  });
