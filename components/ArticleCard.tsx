import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
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
  index?: number;
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '';
  const date = new Date(dateString);

  const day = date.getDate();
  const month = date.toLocaleDateString('fr-FR', { month: 'short' });
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day} ${month} à ${hours}:${minutes}`;
}

export function ArticleCard({ article, onPress, isFavorite, onToggleFavorite, index = 0 }: ArticleCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const hasImage = !!article.image_url;

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
        {hasImage && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: article.image_url! }} style={styles.image} resizeMode="cover" />
            <View style={styles.imageOverlay} />
            {onToggleFavorite && (
              <AnimatedHeart
                isFavorite={isFavorite ?? false}
                onPress={onToggleFavorite}
                size={24}
                style={styles.favoriteButton}
                inactiveColor="#FFFFFF"
              />
            )}
          </View>
        )}

        <View style={styles.content}>
          <View style={styles.sourceRow}>
            <View style={styles.sourceInfo}>
              <View style={styles.sourceDot} />
              <Text style={styles.sourceName} numberOfLines={1}>
                {article.source?.name || 'Source inconnue'}
              </Text>
            </View>
            <View style={styles.rightActions}>
              <Text style={styles.date}>{formatDate(article.published_at)}</Text>
              {!hasImage && onToggleFavorite && (
                <AnimatedHeart
                  isFavorite={isFavorite ?? false}
                  onPress={onToggleFavorite}
                  size={20}
                  style={styles.favoriteInline}
                />
              )}
            </View>
          </View>

          <Text style={styles.title} numberOfLines={3}>
            {article.title}
          </Text>

          {article.summary && (
            <Text style={styles.summary} numberOfLines={2}>
              {article.summary}
            </Text>
          )}
        </View>
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
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    imageContainer: {
      position: 'relative',
    },
    image: {
      width: '100%',
      height: 180,
      backgroundColor: colors.background,
    },
    imageOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: 'transparent',
    },
    favoriteButton: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm,
      backgroundColor: 'rgba(0,0,0,0.3)',
      borderRadius: 20,
      padding: spacing.xs,
    },
    content: {
      padding: spacing.md,
    },
    sourceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    sourceInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    sourceDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
    },
    sourceName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
      flex: 1,
    },
    rightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    date: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '500',
    },
    favoriteInline: {
      padding: spacing.xxs,
    },
    title: {
      ...typography.titleMd,
      color: colors.textPrimary,
      marginBottom: spacing.xs,
      lineHeight: 24,
    },
    summary: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 20,
    },
  });
