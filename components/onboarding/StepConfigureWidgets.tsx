import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { WIDGET_CATALOG, WidgetType } from '@/lib/widgets/types';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface StepConfigureWidgetsProps {
  enabledWidgets: WidgetType[];
  onWidgetsChange: (widgets: WidgetType[]) => void;
}

export function StepConfigureWidgets({ enabledWidgets, onWidgetsChange }: StepConfigureWidgetsProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const toggleWidget = (id: WidgetType) => {
    if (enabledWidgets.includes(id)) {
      onWidgetsChange(enabledWidgets.filter((w) => w !== id));
    } else {
      onWidgetsChange([...enabledWidgets, id]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Animated.View entering={FadeInDown.delay(100)}>
        <Text style={styles.title}>Configurez vos widgets</Text>
        <Text style={styles.subtitle}>
          Activez les widgets qui apparaîtront dans votre tableau de bord
        </Text>
      </Animated.View>

      {WIDGET_CATALOG.map((widget, index) => (
        <Animated.View key={widget.id} entering={FadeInDown.delay(200 + index * 50)}>
          <View style={styles.widgetCard}>
            <View style={styles.widgetIcon}>
              <Ionicons
                name={widget.icon as keyof typeof Ionicons.glyphMap}
                size={28}
                color={enabledWidgets.includes(widget.id) ? colors.primary : colors.textMuted}
              />
            </View>
            <View style={styles.widgetInfo}>
              <Text style={styles.widgetName}>{widget.name}</Text>
              <Text style={styles.widgetDescription}>{widget.description}</Text>
            </View>
            <Switch
              value={enabledWidgets.includes(widget.id)}
              onValueChange={() => toggleWidget(widget.id)}
              trackColor={{ false: colors.border, true: colors.primary + '60' }}
              thumbColor={enabledWidgets.includes(widget.id) ? colors.primary : colors.textMuted}
            />
          </View>
        </Animated.View>
      ))}

      <Text style={styles.hint}>
        Vous pourrez affiner les réglages de chaque widget dans les paramètres.
      </Text>
    </ScrollView>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    title: {
      ...typography.titleLg,
      color: colors.textPrimary,
      textAlign: 'center',
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    widgetCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
      gap: spacing.md,
    },
    widgetIcon: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
    },
    widgetInfo: {
      flex: 1,
    },
    widgetName: {
      ...typography.body,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    widgetDescription: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    hint: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.md,
      fontStyle: 'italic',
    },
  });
