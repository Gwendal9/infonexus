import { useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Source } from '@/types/database';
import { SourceCard } from './SourceCard';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';

interface SwipeableSourceCardProps {
  source: Source;
  onDelete: () => void;
  onRefresh?: () => void;
  onPress?: () => void;
  onHealthPress?: () => void;
}

export function SwipeableSourceCard({
  source,
  onDelete,
  onRefresh,
  onPress,
  onHealthPress,
}: SwipeableSourceCardProps) {
  const colors = useColors();
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
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
            backgroundColor: colors.statusError,
            opacity,
            transform: [{ translateX }, { scale }],
          },
        ]}
      >
        <Ionicons name="trash" size={24} color="#FFFFFF" />
        <Text style={styles.actionText}>Supprimer</Text>
      </Animated.View>
    );
  };

  const renderLeftActions = (
    progress: Animated.AnimatedInterpolation<number>,
    dragX: Animated.AnimatedInterpolation<number>
  ) => {
    if (!onRefresh) return null;

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
            backgroundColor: colors.primary,
            opacity,
            transform: [{ translateX }, { scale }],
          },
        ]}
      >
        <Ionicons name="refresh" size={24} color="#FFFFFF" />
        <Text style={styles.actionText}>Rafraîchir</Text>
      </Animated.View>
    );
  };

  const handleSwipeOpen = (direction: 'left' | 'right') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (direction === 'right') {
      // Swipe left revealed right action = delete
      setTimeout(() => {
        onDelete();
        swipeableRef.current?.close();
      }, 200);
    } else if (direction === 'left' && onRefresh) {
      // Swipe right revealed left action = refresh
      setTimeout(() => {
        onRefresh();
        swipeableRef.current?.close();
      }, 200);
    }
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      renderLeftActions={onRefresh ? renderLeftActions : undefined}
      onSwipeableOpen={handleSwipeOpen}
      rightThreshold={40}
      leftThreshold={40}
      friction={2}
      overshootRight={false}
      overshootLeft={false}
    >
      <SourceCard source={source} onDelete={onDelete} onPress={onPress} onHealthPress={onHealthPress} />
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  rightAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginLeft: -12,
  },
  leftAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 12,
    marginRight: -12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});
