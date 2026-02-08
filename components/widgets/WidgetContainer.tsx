import { ReactNode } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface WidgetContainerProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  children: ReactNode;
  onPress?: () => void;
  compact?: boolean;
  expanded?: boolean;
}

export function WidgetContainer({
  title,
  icon,
  iconColor,
  children,
  onPress,
  compact = false,
  expanded = false,
}: WidgetContainerProps) {
  const colors = useColors();
  const styles = createStyles(colors, compact, expanded);

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name={icon}
          size={compact ? 16 : 20}
          color={iconColor ?? colors.primary}
        />
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const createStyles = (colors: ReturnType<typeof useColors>, compact: boolean, expanded: boolean) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: expanded ? 20 : 16,
      padding: compact ? spacing.sm : expanded ? spacing.lg : spacing.md,
      height: compact ? '100%' : undefined,
      flex: expanded ? 1 : undefined,
      ...(expanded ? {} : {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
      }),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginBottom: compact ? spacing.xs : expanded ? spacing.lg : spacing.sm,
    },
    title: {
      ...(expanded ? typography.titleMd : typography.caption),
      color: expanded ? colors.textPrimary : colors.textMuted,
      textTransform: expanded ? 'none' : 'uppercase',
      letterSpacing: expanded ? 0 : 0.5,
    },
    content: {
      flex: (compact || expanded) ? 1 : undefined,
    },
  });
