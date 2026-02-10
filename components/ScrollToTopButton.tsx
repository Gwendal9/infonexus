import { useRef, useState, useCallback } from 'react';
import { Animated, StyleSheet, TouchableOpacity, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/contexts/ThemeContext';

const SCROLL_THRESHOLD = 600;

interface ScrollToTopButtonProps {
  visible: boolean;
  onPress: () => void;
}

export function ScrollToTopButton({ visible, onPress }: ScrollToTopButtonProps) {
  const colors = useColors();
  const opacity = useRef(new Animated.Value(0)).current;
  const isVisible = useRef(false);

  if (visible && !isVisible.current) {
    isVisible.current = true;
    Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
  } else if (!visible && isVisible.current) {
    isVisible.current = false;
    Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
  }

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents={visible ? 'auto' : 'none'}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name="chevron-up" size={22} color="#FFFFFF" />
      </TouchableOpacity>
    </Animated.View>
  );
}

export function useScrollToTop() {
  const [showButton, setShowButton] = useState(false);

  const onScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    setShowButton(y > SCROLL_THRESHOLD);
  }, []);

  return { showButton, onScroll };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 16,
    right: 16,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
