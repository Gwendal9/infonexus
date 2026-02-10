import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedHeart } from '@/components/AnimatedHeart';
import { ArticleWithSource } from '@/lib/queries/useArticles';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ArticleCardProps {
  article: ArticleWithSource;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isRead?: boolean;
  index?: number;
  onLongPress?: () => void;
}

function formatRelativeDate(dateString: string | null): string {
  if (!dateString) return '';
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  if (diffH < 24) return `il y a ${diffH}h`;
  if (diffD === 1) return 'hier';
  if (diffD < 7) return `il y a ${diffD}j`;
  if (diffD < 30) return `il y a ${Math.floor(diffD / 7)} sem`;
  return `il y a ${Math.floor(diffD / 30)} mois`;
}

function estimateReadTime(title: string, summary: string | null): string {
  const words = (title + ' ' + (summary || '')).split(/\s+/).length;
  // Articles have full content beyond summary, estimate ~3x the visible text
  const estimatedTotal = words * 3;
  const minutes = Math.max(1, Math.round(estimatedTotal / 200));
  return `${minutes} min`;
}

export function ArticleCard({ article, onPress, isFavorite, onToggleFavorite, isRead, index = 0, onLongPress }: ArticleCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const hasImage = !!article.image_url;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity
        testID="article-card"
        style={[styles.card, isRead && styles.cardRead]}
        onPress={handlePress}
        onLongPress={onLongPress}
        delayLongPress={400}
        activeOpacity={0.8}
      >
        {hasImage ? (
          <>
            <View style={styles.imageContainer}>
              <Image source={{ uri: article.image_url! }} style={styles.image} resizeMode="cover" />
              {onToggleFavorite && (
                <AnimatedHeart
                  isFavorite={isFavorite ?? false}
                  onPress={onToggleFavorite}
                  size={22}
                  style={styles.favoriteOnImage}
                  inactiveColor="#FFFFFF"
                />
              )}
            </View>

            <View style={styles.content}>
              <View style={styles.metaRow}>
                {!isRead && <View style={styles.unreadDot} />}
                <Text style={[styles.sourceName, isRead && styles.textRead]} numberOfLines={1}>
                  {article.source?.name || 'Source inconnue'}
                </Text>
                <Text style={styles.separator}>·</Text>
                <Text style={styles.date}>{formatRelativeDate(article.published_at)}</Text>
              </View>

              <Text style={[styles.title, isRead && styles.titleRead]} numberOfLines={3}>
                {article.title}
              </Text>

              {article.summary && (
                <Text style={[styles.summary, isRead && styles.textRead]} numberOfLines={2}>
                  {article.summary}
                </Text>
              )}

              <Text style={styles.readTime}>
                {estimateReadTime(article.title, article.summary)}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.noImageLayout}>
            <View style={[styles.accentBar, { backgroundColor: colors.primary }]} />
            <View style={styles.noImageContent}>
              <View style={styles.metaRow}>
                {!isRead && <View style={styles.unreadDot} />}
                <Text style={[styles.sourceName, isRead && styles.textRead]} numberOfLines={1}>
                  {article.source?.name || 'Source inconnue'}
                </Text>
                <Text style={styles.separator}>·</Text>
                <Text style={styles.date}>{formatRelativeDate(article.published_at)}</Text>
              </View>

              <Text style={[styles.title, isRead && styles.titleRead]} numberOfLines={3}>
                {article.title}
              </Text>

              {article.summary && (
                <Text style={[styles.summary, isRead && styles.textRead]} numberOfLines={2}>
                  {article.summary}
                </Text>
              )}

              <View style={styles.footer}>
                <Text style={styles.readTime}>
                  {estimateReadTime(article.title, article.summary)}
                </Text>
                {onToggleFavorite && (
                  <AnimatedHeart
                    isFavorite={isFavorite ?? false}
                    onPress={onToggleFavorite}
                    size={20}
                  />
                )}
              </View>
            </View>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: spacing.md,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
    cardRead: {
      opacity: 0.65,
    },
    // --- Image layout ---
    imageContainer: {
      position: 'relative',
    },
    image: {
      width: '100%',
      height: 160,
      backgroundColor: colors.background,
    },
    favoriteOnImage: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 20,
      padding: spacing.xs,
    },
    content: {
      padding: spacing.md,
      gap: spacing.xs,
    },
    // --- No-image layout ---
    noImageLayout: {
      flexDirection: 'row',
    },
    accentBar: {
      width: 4,
      borderTopLeftRadius: 16,
      borderBottomLeftRadius: 16,
    },
    noImageContent: {
      flex: 1,
      padding: spacing.md,
      gap: spacing.xs,
    },
    // --- Shared ---
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    unreadDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    sourceName: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.textSecondary,
      flexShrink: 1,
    },
    separator: {
      ...typography.caption,
      color: colors.textMuted,
    },
    date: {
      ...typography.caption,
      color: colors.textMuted,
    },
    title: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.textPrimary,
      lineHeight: 23,
    },
    titleRead: {
      color: colors.textSecondary,
    },
    summary: {
      ...typography.body,
      color: colors.textMuted,
      lineHeight: 20,
    },
    readTime: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '500',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.xxs,
    },
    textRead: {
      color: colors.textMuted,
    },
  });
