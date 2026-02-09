import { TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/contexts/ThemeContext';

interface AnimatedHeartProps {
  isFavorite: boolean;
  onPress: () => void;
  size?: number;
  style?: any;
  color?: string;
  inactiveColor?: string;
}

export function AnimatedHeart({
  isFavorite,
  onPress,
  size = 24,
  style,
  color,
  inactiveColor,
}: AnimatedHeartProps) {
  const colors = useColors();
  const heartColor = color ?? colors.statusError;
  const heartInactiveColor = inactiveColor ?? colors.textMuted;

  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const burstScale = useSharedValue(0);
  const burstOpacity = useSharedValue(0);

  const handlePress = async () => {
    // Strong haptic feedback when adding to favorites
    if (!isFavorite) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Heart animation
    scale.value = withSequence(
      withSpring(0.6, { damping: 10, stiffness: 400 }),
      withSpring(1.4, { damping: 3, stiffness: 300 }),
      withSpring(1, { damping: 5, stiffness: 400 })
    );

    // Slight rotation for playfulness
    rotation.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    // Burst effect when adding (not removing)
    if (!isFavorite) {
      burstScale.value = 0;
      burstOpacity.value = 1;
      burstScale.value = withTiming(2.5, { duration: 400, easing: Easing.out(Easing.ease) });
      burstOpacity.value = withDelay(100, withTiming(0, { duration: 300 }));
    }

    onPress();
  };

  const heartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));

  const burstAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: burstScale.value }],
    opacity: burstOpacity.value,
  }));

  return (
    <TouchableOpacity testID="favorite-button" onPress={handlePress} style={[styles.container, style]} activeOpacity={0.7}>
      {/* Burst effect */}
      <Animated.View style={[styles.burst, burstAnimatedStyle]}>
        <Ionicons name="heart" size={size} color={heartColor} />
      </Animated.View>

      {/* Main heart */}
      <Animated.View style={heartAnimatedStyle}>
        <Ionicons
          name={isFavorite ? 'heart' : 'heart-outline'}
          size={size}
          color={isFavorite ? heartColor : heartInactiveColor}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  burst: {
    position: 'absolute',
    opacity: 0,
  },
});
