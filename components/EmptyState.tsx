import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInUp } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon, title, description, children }: EmptyStateProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <Animated.View entering={FadeIn.delay(100).duration(400)} style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Ionicons name={icon} size={40} color={colors.primary} />
        </View>
      </Animated.View>

      <Animated.Text entering={FadeInUp.delay(200).duration(400)} style={styles.title}>
        {title}
      </Animated.Text>

      <Animated.Text entering={FadeInUp.delay(300).duration(400)} style={styles.description}>
        {description}
      </Animated.Text>

      {children && (
        <Animated.View entering={FadeInUp.delay(400).duration(400)} style={styles.actions}>
          {children}
        </Animated.View>
      )}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    iconContainer: {
      marginBottom: spacing.lg,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: colors.primary + '15',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      ...typography.titleLg,
      color: colors.textPrimary,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    description: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
    },
    actions: {
      marginTop: spacing.lg,
    },
  });
