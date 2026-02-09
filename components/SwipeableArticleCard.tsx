import { useRef } from 'react';
import { Animated, Share, StyleSheet, Text } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ArticleCard } from './ArticleCard';
import { ArticleWithSource } from '@/lib/queries/useArticles';
import { useColors } from '@/contexts/ThemeContext';

interface SwipeableArticleCardProps {
  article: ArticleWithSource;
  onPress: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  onMarkAsRead?: () => void;
  isRead?: boolean;
  index?: number;
}

export function SwipeableArticleCard({
  article,
  onPress,
  isFavorite,
  onToggleFavorite,
  onMarkAsRead,
  isRead,
  index,
}: SwipeableArticleCardProps) {
  const colors = useColors();
  const swipeableRef = useRef<Swipeable>(null);

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (!onToggleFavorite) return null;

    const translateX = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [-80, 0],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const scale = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 0.8, 1],
    });

    return (
      <Animated.View
        style={[
          styles.leftAction,
          {
            backgroundColor: colors.statusError,
            opacity,
            transform: [{ translateX }, { scale }],
          },
        ]}
      >
        <Ionicons name={isFavorite ? 'heart-dislike' : 'heart'} size={24} color="#FFFFFF" />
        <Text style={styles.actionText}>{isFavorite ? 'Retirer' : 'Favori'}</Text>
      </Animated.View>
    );
  };

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (!onMarkAsRead || isRead) return null;

    const translateX = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [0, 80],
      extrapolate: 'clamp',
    });

    const opacity = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });

    const scale = progress.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0.5, 0.8, 1],
    });

    return (
      <Animated.View
        style={[
          styles.rightAction,
          {
            backgroundColor: colors.primary,
            opacity,
            transform: [{ translateX }, { scale }],
          },
        ]}
      >
        <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
        <Text style={styles.actionText}>Lu</Text>
      </Animated.View>
    );
  };

  const handleSwipeOpen = (direction: 'left' | 'right') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (direction === 'left' && onToggleFavorite) {
      setTimeout(() => {
        onToggleFavorite();
        swipeableRef.current?.close();
      }, 200);
    } else if (direction === 'right' && onMarkAsRead) {
      setTimeout(() => {
        onMarkAsRead();
        swipeableRef.current?.close();
      }, 200);
    }
  };

  const handleLongPress = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await Share.share({
        message: `${article.title}\n${article.url}`,
        title: article.title,
      });
    } catch {
      // User cancelled share, ignore
    }
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderLeftActions={onToggleFavorite ? renderLeftActions : undefined}
      renderRightActions={onMarkAsRead && !isRead ? renderRightActions : undefined}
      onSwipeableOpen={handleSwipeOpen}
      rightThreshold={40}
      leftThreshold={40}
      friction={2}
      overshootRight={false}
      overshootLeft={false}
    >
      <ArticleCard
        article={article}
        onPress={onPress}
        isFavorite={isFavorite}
        onToggleFavorite={onToggleFavorite}
        isRead={isRead}
        index={index}
        onLongPress={handleLongPress}
      />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  leftAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginRight: -12,
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 16,
    marginLeft: -12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
