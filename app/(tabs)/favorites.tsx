import { useCallback } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SwipeableArticleCard } from '@/components/SwipeableArticleCard';
import { ArticleCardSkeleton } from '@/components/Skeleton';
import { EmptyState } from '@/components/EmptyState';
import { useFavorites } from '@/lib/queries/useFavorites';
import { useReadArticleIds } from '@/lib/queries/useReadArticles';
import { useToggleFavorite } from '@/lib/mutations/useFavoriteMutations';
import { useMarkAsRead } from '@/lib/mutations/useReadMutations';
import { ArticleWithSource } from '@/lib/queries/useArticles';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';

export default function FavoritesScreen() {
  const colors = useColors();
  const router = useRouter();
  const { data: favorites, isLoading, refetch, isRefetching } = useFavorites();
  const { data: readArticleIds } = useReadArticleIds();
  const toggleFavorite = useToggleFavorite();
  const markAsRead = useMarkAsRead();

  const styles = createStyles(colors);

  const handleArticlePress = useCallback((article: ArticleWithSource) => {
    if (!readArticleIds?.has(article.id)) {
      markAsRead.mutate(article.id);
    }
    router.push(`/article/${article.id}`);
  }, [router, readArticleIds, markAsRead]);

  const handleRemoveFavorite = useCallback(
    (articleId: string) => {
      toggleFavorite.mutate({ articleId, isFavorite: true });
    },
    [toggleFavorite]
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.skeletonContainer}>
          <ArticleCardSkeleton />
          <ArticleCardSkeleton />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <SwipeableArticleCard
            article={item}
            onPress={() => handleArticlePress(item)}
            isFavorite={true}
            onToggleFavorite={() => handleRemoveFavorite(item.id)}
            onMarkAsRead={() => markAsRead.mutate(item.id)}
            isRead={readArticleIds?.has(item.id)}
            index={index}
          />
        )}
        contentContainerStyle={favorites?.length === 0 ? styles.emptyList : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="heart-outline"
            title="Aucun favori"
            description="Appuyez sur le cœur d'un article pour le sauvegarder ici."
          />
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
    list: {
      padding: spacing.md,
    },
    emptyList: {
      flexGrow: 1,
      padding: spacing.md,
    },
  });
