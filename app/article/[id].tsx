import { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Linking,
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AnimatedHeart } from '@/components/AnimatedHeart';
import { ReaderView } from '@/components/ReaderView';
import { useArticleById } from '@/lib/queries/useArticles';
import { useFavoriteIds } from '@/lib/queries/useFavorites';
import { useToggleFavorite } from '@/lib/mutations/useFavoriteMutations';
import { extractArticleContent, ArticleContent } from '@/lib/services/articleReader';
import { useColors } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { usePaywallBypass } from '@/contexts/PaywallBypassContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const FONT_SIZE_KEY = '@infonexus_reader_font_size';
const DEFAULT_FONT_SIZE = 17;

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

function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return '';
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH}h`;
  if (diffD === 1) return 'Hier';
  if (diffD < 7) return `Il y a ${diffD} jours`;
  return formatDate(dateString);
}

function estimateReadTime(title: string, summary: string | null): string {
  const words = (title + ' ' + (summary || '')).split(/\s+/).length;
  const minutes = Math.max(1, Math.round((words * 3) / 200));
  return `${minutes} min de lecture`;
}

export default function ArticleDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const styles = createStyles(colors, insets.top);
  const { showError, showSuccess } = useToast();
  const { bypassEnabled } = usePaywallBypass();

  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: article, isLoading } = useArticleById(id);
  const { data: favoriteIds } = useFavoriteIds();
  const toggleFavorite = useToggleFavorite();

  const isFavorite = favoriteIds?.has(id) ?? false;

  // Reader mode state
  const [readerMode, setReaderMode] = useState(false);
  const [articleContent, setArticleContent] = useState<ArticleContent | null>(null);
  const [loadingContent, setLoadingContent] = useState(false);
  const [fontSize, setFontSize] = useState(DEFAULT_FONT_SIZE);

  // Load saved font size
  useEffect(() => {
    AsyncStorage.getItem(FONT_SIZE_KEY).then((value) => {
      if (value) setFontSize(parseInt(value, 10));
    });
  }, []);

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    AsyncStorage.setItem(FONT_SIZE_KEY, String(size));
  };

  const handleReadInApp = async () => {
    if (articleContent) {
      setReaderMode(true);
      return;
    }

    if (!article?.url) return;

    setLoadingContent(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const content = await extractArticleContent(article.url, bypassEnabled);

    if (content) {
      setArticleContent(content);
      setReaderMode(true);
      if (bypassEnabled && content.bypassUsed) {
        showSuccess('Article complet récupéré');
      }
    } else {
      // Fallback: afficher le résumé RSS plutôt que d'ouvrir le navigateur
      const summary = article.summary ?? null;
      const fallbackHtml = summary
        ? `<p>${summary}</p><p><em>Le contenu complet n'a pas pu être extrait. Utilisez « Ouvrir dans le navigateur » pour lire l'article entier.</em></p>`
        : `<p><em>Le contenu de cet article n'est pas disponible en lecture intégrée. Utilisez « Ouvrir dans le navigateur » pour le lire.</em></p>`;

      setArticleContent({
        title: article.title,
        content: fallbackHtml,
        textContent: summary ?? '',
        author: article.author ?? null,
        siteName: article.source?.name ?? null,
        estimatedReadTime: 1,
      });
      setReaderMode(true);
    }

    setLoadingContent(false);
  };

  const handleOpenOriginal = async () => {
    if (article?.url) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Linking.openURL(article.url);
    }
  };

  const handleToggleFavorite = () => {
    toggleFavorite.mutate({ articleId: id, isFavorite });
  };

  const handleToggleReaderMode = () => {
    Haptics.selectionAsync();
    if (readerMode) {
      setReaderMode(false);
    } else {
      handleReadInApp();
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
        <TouchableOpacity testID="back-button" onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleToggleReaderMode} style={styles.headerButton}>
            <Ionicons
              name={readerMode ? 'document-text' : 'reader-outline'}
              size={22}
              color={readerMode ? colors.primary : colors.textPrimary}
            />
          </TouchableOpacity>
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
        {article.image_url && !readerMode && (
          <Animated.View entering={FadeIn.duration(300)}>
            <Image source={{ uri: article.image_url }} style={styles.image} resizeMode="cover" />
          </Animated.View>
        )}

        <View style={styles.content}>
          {/* Source & Date */}
          <Animated.View entering={FadeInUp.delay(100)} style={styles.meta}>
            <View style={styles.sourceRow}>
              <View style={styles.sourceInfo}>
                <View style={styles.sourceDot} />
                <Text style={styles.sourceName}>{article.source?.name || 'Source inconnue'}</Text>
              </View>
              <Text style={styles.relativeDate}>{formatRelativeDate(article.published_at)}</Text>
            </View>
            <Text style={styles.date}>{formatDate(article.published_at)}</Text>
            <Text style={styles.readTimeLabel}>{estimateReadTime(article.title, article.summary)}</Text>
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

          {readerMode && articleContent ? (
            /* Reader mode content */
            <Animated.View entering={FadeIn.duration(300)}>
              <ReaderView
                content={articleContent}
                fontSize={fontSize}
                onFontSizeChange={handleFontSizeChange}
              />
            </Animated.View>
          ) : (
            <>
              {/* Summary */}
              {article.summary && (
                <Animated.Text entering={FadeInUp.delay(300)} style={styles.summary}>
                  {article.summary}
                </Animated.Text>
              )}

              {/* Action buttons */}
              <Animated.View entering={FadeInUp.delay(400)} style={styles.buttonGroup}>
                {/* Read in-app button */}
                <TouchableOpacity
                  style={styles.readInAppButton}
                  onPress={handleReadInApp}
                  disabled={loadingContent}
                >
                  {loadingContent ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons name="reader-outline" size={20} color={colors.primary} />
                  )}
                  <Text style={styles.readInAppText}>Lire ici</Text>
                </TouchableOpacity>

                {/* Open in browser button */}
                <TouchableOpacity style={styles.readButton} onPress={handleOpenOriginal}>
                  <Ionicons name="open-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.readButtonText}>Ouvrir dans le navigateur</Text>
                </TouchableOpacity>
              </Animated.View>

              {/* URL Preview */}
              <Animated.Text entering={FadeInUp.delay(450)} style={styles.urlPreview} numberOfLines={1}>
                {article.url}
              </Animated.Text>
            </>
          )}
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
      gap: spacing.xxs,
    },
    sourceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sourceInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    relativeDate: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    readTimeLabel: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '500',
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
    buttonGroup: {
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    readInAppButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      borderWidth: 2,
      borderColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: 12,
    },
    readInAppText: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '600',
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
