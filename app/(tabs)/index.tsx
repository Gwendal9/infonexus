import { useCallback, useMemo, useState, useRef } from 'react';
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
  useWindowDimensions,
} from 'react-native';
import PagerView from 'react-native-pager-view';
import { useRouter } from 'expo-router';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ArticleCard } from '@/components/ArticleCard';
import { SwipeableArticleCard } from '@/components/SwipeableArticleCard';
import { ArticleCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { Button } from '@/components/Button';
import { TopicArticleList } from '@/components/TopicArticleList';
import { AddTopicModal } from '@/components/AddTopicModal';
import { useArticles, ArticleWithSource } from '@/lib/queries/useArticles';
import { useSearchArticles } from '@/lib/queries/useSearchArticles';
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

type FeedTab = { id: string | null; name: string; color: string; type: 'all' | 'theme' | 'topic' };

export default function FeedScreen() {
  const colors = useColors();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>();
  const pagerRef = useRef<PagerView>(null);
  const tabsScrollRef = useRef<ScrollView>(null);

  const styles = createStyles(colors);

  const { config: topicConfig, addTopic, updateTopic, deleteTopic } = useTopics();

  const { data: articles, isLoading, refetch, isRefetching } = useArticles();
  const { data: favoriteIds } = useFavoriteIds();
  const { data: readArticleIds } = useReadArticleIds();
  const { data: themes } = useThemes();
  const { data: sourceThemes } = useAllSourceThemes();
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

  // Auto-refresh sources when app becomes active
  useAutoRefresh({
    enabled: true,
    onRefreshComplete: (success) => {
      if (success) {
        refetch();
      }
    },
  });

  // Build tabs: "Tous" + themes + topics
  const allTabs = useMemo(() => {
    const tabs: FeedTab[] = [
      { id: null, name: 'Tous', color: colors.primary, type: 'all' },
    ];
    if (themes) {
      themes.forEach((t) => tabs.push({ id: t.id, name: t.name, color: t.color, type: 'theme' }));
    }
    topicConfig.topics.forEach((t) => tabs.push({ id: t.id, name: t.name, color: t.color, type: 'topic' }));
    return tabs;
  }, [themes, colors.primary, topicConfig.topics]);

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

  const handleTabPress = useCallback((index: number) => {
    Haptics.selectionAsync();
    pagerRef.current?.setPage(index);
    setCurrentPage(index);
  }, []);

  const handlePageSelected = useCallback((e: { nativeEvent: { position: number } }) => {
    const position = e.nativeEvent.position;
    setCurrentPage(position);
    Haptics.selectionAsync();

    // Scroll tabs to show selected tab
    const tabWidth = 80;
    const scrollX = Math.max(0, position * tabWidth - width / 2 + tabWidth / 2);
    tabsScrollRef.current?.scrollTo({ x: scrollX, animated: true });
  }, [width]);

  // Get articles for a specific theme
  const getArticlesForTheme = useCallback((themeId: string | null) => {
    if (!articles) return [];
    if (!themeId || !sourceThemes) return articles;

    const sourcesWithTheme = Array.from(sourceThemes.entries())
      .filter(([_, themeIds]) => themeIds.includes(themeId))
      .map(([sourceId]) => sourceId);
    return articles.filter((a) => sourcesWithTheme.includes(a.source_id));
  }, [articles, sourceThemes]);

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
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchResultsBanner}>
          <Ionicons name="search" size={16} color={colors.primary} />
          <Text style={styles.searchResultsText}>
            {isSearchLoading ? 'Recherche...' : `${searchResults?.length ?? 0} résultat${(searchResults?.length ?? 0) !== 1 ? 's' : ''}`}
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
            data={searchResults ?? []}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <SwipeableArticleCard
                article={item as unknown as ArticleWithSource}
                onPress={() => handleArticlePress(item as unknown as ArticleWithSource)}
                isFavorite={favoriteIds?.has(item.id)}
                onToggleFavorite={() => handleToggleFavorite(item.id)}
                onMarkAsRead={() => markAsRead.mutate(item.id)}
                isRead={readArticleIds?.has(item.id)}
                index={index}
              />
            )}
            contentContainerStyle={styles.list}
            ListEmptyComponent={
              <EmptyState
                icon="search-outline"
                title="Aucun résultat"
                description={`Aucun article trouvé pour "${searchQuery}"`}
              />
            }
          />
        )}
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

      {/* Tabs: Tous + themes + topics */}
      {(allTabs.length > 1 || topicConfig.topics.length > 0) && (
        <View style={styles.tabsContainer}>
          <ScrollView
            ref={tabsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {allTabs.map((tab, index) => {
              const isSelected = index === currentPage;
              const tabKey = tab.type === 'topic' ? `topic-${tab.id}` : tab.type === 'theme' ? `theme-${tab.id}` : 'all';
              return (
                <TouchableOpacity
                  key={tabKey}
                  style={styles.tab}
                  onPress={() => handleTabPress(index)}
                  onLongPress={tab.type === 'topic' ? () => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    const t = topicConfig.topics.find((tp) => tp.id === tab.id);
                    if (t) {
                      setEditingTopic(t);
                      setTopicModalVisible(true);
                    }
                  } : undefined}
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
                        styles.tabIndicator,
                        { backgroundColor: tab.id ? tab.color : colors.primary },
                      ]}
                    />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Add topic button */}
            <TouchableOpacity
              style={styles.addTopicTab}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setEditingTopic(undefined);
                setTopicModalVisible(true);
              }}
            >
              <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </ScrollView>

          {/* Swipe hint */}
          <View style={styles.swipeHint}>
            <Ionicons name="swap-horizontal" size={14} color={colors.textMuted} />
          </View>
        </View>
      )}

      {/* Pager View */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {allTabs.map((tab) => {
          const tabKey = tab.type === 'topic' ? `topic-${tab.id}` : tab.type === 'theme' ? `theme-${tab.id}` : 'all';
          return (
            <View key={tabKey} style={styles.page}>
              {tab.type === 'topic' && tab.id ? (
                <TopicArticleList topicId={tab.id} />
              ) : (
                <ThemeArticleList
                  themeId={tab.id}
                  articles={getArticlesForTheme(tab.id)}
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
            </View>
          );
        })}
      </PagerView>

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
  colors,
}: ThemeArticleListProps) {
  const styles = createStyles(colors);

  return (
    <FlatList
      data={articles}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => (
        <SwipeableArticleCard
          article={item}
          onPress={() => onArticlePress(item)}
          isFavorite={favoriteIds?.has(item.id)}
          onToggleFavorite={() => onToggleFavorite(item.id)}
          onMarkAsRead={() => onMarkAsRead(item.id)}
          isRead={readArticleIds?.has(item.id)}
          index={index}
        />
      )}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
        />
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
      contentContainerStyle={articles.length === 0 ? styles.emptyList : styles.list}
      ListHeaderComponent={
        isPending ? (
          <Animated.View entering={FadeIn} style={styles.refreshBanner}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.refreshText}>Récupération des articles...</Text>
          </Animated.View>
        ) : null
      }
    />
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
    tabsContainer: {
      backgroundColor: colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    tabsContent: {
      paddingHorizontal: spacing.sm,
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
    tabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: spacing.lg,
      right: spacing.lg,
      height: 3,
      borderRadius: 1.5,
    },
    addTopicTab: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      justifyContent: 'center',
    },
    swipeHint: {
      paddingRight: spacing.md,
      opacity: 0.5,
    },
    pager: {
      flex: 1,
    },
    page: {
      flex: 1,
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
  });
