import { useCallback, useRef } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ScrollToTopButton, useScrollToTop } from '@/components/ScrollToTopButton';
import { ArticleCard } from '@/components/ArticleCard';
import { EmptyState } from '@/components/EmptyState';
import { useTopicArticles, TopicArticle } from '@/lib/queries/useTopicArticles';
import { useFavoriteIds } from '@/lib/queries/useFavorites';
import { useReadArticleIds } from '@/lib/queries/useReadArticles';
import { useToggleFavorite } from '@/lib/mutations/useFavoriteMutations';
import { useMarkAsRead } from '@/lib/mutations/useReadMutations';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface TopicArticleListProps {
  topicId: string;
}

export function TopicArticleList({ topicId }: TopicArticleListProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const { articles, isLoading, isRefreshing, refresh, handleArticlePress } = useTopicArticles(topicId);
  const { data: favoriteIds } = useFavoriteIds();
  const { data: readArticleIds } = useReadArticleIds();
  const toggleFavorite = useToggleFavorite();
  const markAsRead = useMarkAsRead();

  const handlePress = useCallback((article: TopicArticle) => {
    if (!article.isGNews && !readArticleIds?.has(article.id)) {
      markAsRead.mutate(article.id);
    }
    handleArticlePress(article);
  }, [handleArticlePress, readArticleIds, markAsRead]);

  const handleToggleFavorite = useCallback(
    (articleId: string) => {
      const isFavorite = favoriteIds?.has(articleId) ?? false;
      toggleFavorite.mutate({ articleId, isFavorite });
    },
    [favoriteIds, toggleFavorite]
  );

  const renderItem = useCallback(({ item, index }: { item: TopicArticle; index: number }) => (
    <View>
      <ArticleCard
        article={item}
        onPress={() => handlePress(item)}
        isFavorite={!item.isGNews ? favoriteIds?.has(item.id) : undefined}
        onToggleFavorite={!item.isGNews ? () => handleToggleFavorite(item.id) : undefined}
        isRead={!item.isGNews ? readArticleIds?.has(item.id) : undefined}
        index={index}
      />
      {item.isGNews && (
        <View style={styles.gnewsBadge}>
          <Text style={styles.gnewsBadgeText}>GNews</Text>
        </View>
      )}
    </View>
  ), [handlePress, favoriteIds, readArticleIds, handleToggleFavorite, styles]);

  const listRef = useRef<FlatList>(null);
  const { showButton, onScroll } = useScrollToTop();

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        ref={listRef}
        data={articles}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          isLoading ? null : (
            <EmptyState
              icon="search-outline"
              title="Aucun article"
              description="Aucun article pour ce sujet. Modifiez les mots-clés."
            />
          )
        }
        contentContainerStyle={articles.length === 0 ? styles.emptyList : styles.list}
        onScroll={onScroll}
        scrollEventThrottle={100}
      />
      <ScrollToTopButton
        visible={showButton}
        onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
      />
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    list: {
      padding: spacing.md,
    },
    emptyList: {
      flexGrow: 1,
      padding: spacing.md,
    },
    gnewsBadge: {
      position: 'absolute',
      top: spacing.sm,
      left: spacing.sm,
      backgroundColor: colors.primary + '20',
      borderRadius: 6,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
    },
    gnewsBadgeText: {
      ...typography.small,
      color: colors.primary,
      fontWeight: '700',
      fontSize: 10,
    },
  });
