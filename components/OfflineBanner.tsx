import { StyleSheet, Text } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useNetwork } from '@/contexts/NetworkContext';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function OfflineBanner() {
  const colors = useColors();
  const { isOffline } = useNetwork();

  if (!isOffline) {
    return null;
  }

  const styles = createStyles(colors);

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)} style={styles.container}>
      <Ionicons name="cloud-offline-outline" size={18} color={colors.surface} />
      <Text style={styles.text}>Mode hors-ligne</Text>
    </Animated.View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.statusWarning,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
    },
    text: {
      ...typography.body,
      color: colors.surface,
      fontWeight: '600',
    },
  });
