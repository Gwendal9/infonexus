import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Image,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AnimatedHeart } from '@/components/AnimatedHeart';
import { useArticleById } from '@/lib/queries/useArticles';
import { useFavoriteIds } from '@/lib/queries/useFavorites';
import { useToggleFavorite } from '@/lib/mutations/useFavoriteMutations';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ArticleDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.top);

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: article, isLoading } = useArticleById(id);
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const isFavorite = favoriteIds?.has(id) ?? false;

  const handleOpenOriginal = async () => {
    if (article?.url) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(article.url);
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite.mutate({ articleId: id, isFavorite });
  };

  const handleShare = async () => {
    if (article?.url) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      // For now just open the URL, could add Share API later
      Linking.openURL(article.url);
    }
  };

  if (isLoading || !article) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <AnimatedHeart
            isFavorite={isFavorite}
            onPress={handleToggleFavorite}
            size={24}
            style={styles.headerButton}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Image */}
        {article.image_url && (
          <Animated.View entering={FadeIn.duration(300)}>
            <Image source={{ uri: article.image_url }} style={styles.image} resizeMode="cover" />
          </Animated.View>
        )}

        <View style={styles.content}>
          {/* Source & Date */}
          <Animated.View entering={FadeInUp.delay(100)} style={styles.meta}>
            <View style={styles.sourceInfo}>
              <View style={styles.sourceDot} />
              <Text style={styles.sourceName}>{article.source?.name || 'Source inconnue'}</Text>
            </View>
            <Text style={styles.date}>{formatDate(article.published_at)}</Text>
          </Animated.View>

          {/* Title */}
          <Animated.Text entering={FadeInUp.delay(200)} style={styles.title}>
            {article.title}
          </Animated.Text>

          {/* Author */}
          {article.author && (
            <Animated.Text entering={FadeInUp.delay(250)} style={styles.author}>
              Par {article.author}
            </Animated.Text>
          )}

          {/* Summary */}
          {article.summary && (
            <Animated.Text entering={FadeInUp.delay(300)} style={styles.summary}>
              {article.summary}
            </Animated.Text>
          )}

          {/* Read Original Button */}
          <Animated.View entering={FadeInUp.delay(400)}>
            <TouchableOpacity style={styles.readButton} onPress={handleOpenOriginal}>
              <Ionicons name="open-outline" size={20} color="#FFFFFF" />
              <Text style={styles.readButtonText}>Lire l'article complet</Text>
            </TouchableOpacity>
          </Animated.View>

          {/* URL Preview */}
          <Animated.Text entering={FadeInUp.delay(450)} style={styles.urlPreview} numberOfLines={1}>
            {article.url}
          </Animated.Text>
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>, topInset: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      ...typography.body,
      color: colors.textMuted,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: topInset + spacing.sm,
      paddingBottom: spacing.md,
      backgroundColor: colors.surface,
    },
    backButton: {
      padding: spacing.xs,
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    headerButton: {
      padding: spacing.xs,
    },
    scrollView: {
      flex: 1,
    },
    image: {
      width: '100%',
      height: 250,
      backgroundColor: colors.border,
    },
    content: {
      padding: spacing.lg,
    },
    meta: {
      marginBottom: spacing.md,
    },
    sourceInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    sourceDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    sourceName: {
      ...typography.body,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    date: {
      ...typography.caption,
      color: colors.textMuted,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.textPrimary,
      lineHeight: 32,
      marginBottom: spacing.md,
    },
    author: {
      ...typography.body,
      color: colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: spacing.md,
    },
    summary: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 26,
      marginBottom: spacing.xl,
    },
    readButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 12,
      marginBottom: spacing.md,
    },
    readButtonText: {
      ...typography.body,
      color: '#FFFFFF',
      fontWeight: '600',
    },
    urlPreview: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
