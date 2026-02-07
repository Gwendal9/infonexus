import { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withDelay,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
  delay?: number;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 8, style, delay = 0 }: SkeletonProps) {
  const colors = useColors();
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      )
    );
  }, [shimmer, delay]);

  const animatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.6, 0.3]);
    const translateX = interpolate(shimmer.value, [0, 1], [-100, 100]);

    return {
      opacity,
    };
  });

  const shimmerOverlayStyle = useAnimatedStyle(() => {
    const translateX = interpolate(shimmer.value, [0, 1], [-200, 200]);

    return {
      transform: [{ translateX: `${translateX}%` as any }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          backgroundColor: colors.border,
          width: width as any,
          height,
          borderRadius,
          overflow: 'hidden',
        },
        animatedStyle,
        style,
      ]}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.surface,
            opacity: 0.5,
          },
          shimmerOverlayStyle,
        ]}
      />
    </Animated.View>
  );
}

export function ArticleCardSkeleton({ index = 0 }: { index?: number }) {
  const colors = useColors();
  const styles = createStyles(colors);
  const baseDelay = index * 100;

  return (
    <View style={styles.card}>
      <Skeleton width="100%" height={180} borderRadius={12} delay={baseDelay} />
      <View style={styles.content}>
        <View style={styles.sourceRow}>
          <Skeleton width={120} height={14} delay={baseDelay + 50} />
          <Skeleton width={80} height={14} delay={baseDelay + 100} />
        </View>
        <Skeleton width="90%" height={22} style={{ marginTop: spacing.sm }} delay={baseDelay + 150} />
        <Skeleton width="70%" height={22} style={{ marginTop: spacing.xs }} delay={baseDelay + 200} />
        <Skeleton width="100%" height={16} style={{ marginTop: spacing.sm }} delay={baseDelay + 250} />
        <Skeleton width="80%" height={16} style={{ marginTop: spacing.xs }} delay={baseDelay + 300} />
      </View>
    </View>
  );
}

export function SourceCardSkeleton() {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.sourceCard}>
      <Skeleton width={44} height={44} borderRadius={22} />
      <View style={styles.sourceContent}>
        <Skeleton width="60%" height={18} />
        <Skeleton width="80%" height={14} style={{ marginTop: spacing.xs }} />
      </View>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: spacing.md,
      overflow: 'hidden',
    },
    content: {
      padding: spacing.md,
    },
    sourceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    sourceCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    sourceContent: {
      flex: 1,
      marginLeft: spacing.md,
    },
  });
