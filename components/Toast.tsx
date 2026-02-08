import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  onHide: () => void;
}

const icons: Record<ToastType, keyof typeof Ionicons.glyphMap> = {
  success: 'checkmark-circle',
  error: 'alert-circle',
  info: 'information-circle',
};

export function Toast({ visible, message, type = 'info', duration = 3000, onHide }: ToastProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const backgroundColor = {
    success: colors.statusOk,
    error: colors.statusError,
    info: colors.primary,
  }[type];

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.back(1.5)) });
      opacity.value = withTiming(1, { duration: 200 });

      // Auto hide
      const timer = setTimeout(() => {
        translateY.value = withTiming(-100, { duration: 300 });
        opacity.value = withTiming(0, { duration: 200 });
        setTimeout(onHide, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  if (!visible && opacity.value === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + spacing.sm, backgroundColor },
        animatedStyle,
      ]}
    >
      <Ionicons name={icons[type]} size={20} color="#FFFFFF" />
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    ...typography.body,
    color: '#FFFFFF',
    fontWeight: '600',
    flex: 1,
  },
});
