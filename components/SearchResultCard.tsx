import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { AnimatedHeart } from '@/components/AnimatedHeart';
import { HighlightedText } from '@/components/HighlightedText';
import { ArticleWithSource } from '@/lib/queries/useArticles';
import { useColors } from '@/contexts/ThemeContext';
import { useDisplayDensity } from '@/contexts/DisplayDensityContext';
import { getDensityValues } from '@/lib/utils/densityValues';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface SearchResultCardProps {
  article: ArticleWithSource;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isRead?: boolean;
  index?: number;
  searchQuery: string;
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
  const estimatedTotal = words * 3;
  const minutes = Math.max(1, Math.round(estimatedTotal / 200));
  return `${minutes} min`;
}

export function SearchResultCard({
  article,
  onPress,
  isFavorite,
  onToggleFavorite,
  isRead,
  index = 0,
  searchQuery,
}: SearchResultCardProps) {
  const colors = useColors();
  const { density } = useDisplayDensity();
  const densityValues = getDensityValues(density);
  const styles = createStyles(colors, densityValues);
  const hasImage = !!article.image_url;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity
        testID="search-result-card"
        style={[styles.card, isRead && styles.cardRead]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        {hasImage ? (
          <>
            <View style={styles.imageContainer}>
              <Image source={{ uri: article.image_url! }} style={[styles.image, { height: densityValues.imageHeight }]} resizeMode="cover" />
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

              <HighlightedText
                text={article.title}
                highlight={searchQuery}
                style={[styles.title, isRead && styles.titleRead]}
                numberOfLines={densityValues.titleLines}
              />

              {article.summary && (
                <HighlightedText
                  text={article.summary}
                  highlight={searchQuery}
                  style={[styles.summary, isRead && styles.textRead]}
                  numberOfLines={densityValues.summaryLines}
                />
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

              <HighlightedText
                text={article.title}
                highlight={searchQuery}
                style={[styles.title, isRead && styles.titleRead]}
                numberOfLines={densityValues.titleLines}
              />

              {article.summary && (
                <HighlightedText
                  text={article.summary}
                  highlight={searchQuery}
                  style={[styles.summary, isRead && styles.textRead]}
                  numberOfLines={densityValues.summaryLines}
                />
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

const createStyles = (colors: ReturnType<typeof useColors>, densityValues: ReturnType<typeof getDensityValues>) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      marginBottom: densityValues.cardMargin,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
      borderWidth: 1,
      borderColor: colors.border + '40',
    },
    cardRead: {
      opacity: 0.6,
      shadowOpacity: 0.04,
      elevation: 2,
    },
    imageContainer: {
      position: 'relative',
    },
    image: {
      width: '100%',
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
      padding: densityValues.cardPadding,
      gap: spacing.xs,
    },
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
      padding: densityValues.cardPadding,
      gap: spacing.xs,
    },
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
      fontSize: densityValues.fontSize.title,
      fontWeight: '700',
      color: colors.textPrimary,
      lineHeight: densityValues.lineHeight.title,
    },
    titleRead: {
      color: colors.textSecondary,
    },
    summary: {
      fontSize: densityValues.fontSize.body,
      color: colors.textMuted,
      lineHeight: densityValues.lineHeight.body,
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
