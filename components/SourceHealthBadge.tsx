import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSourceHealth } from '@/lib/queries/useSourceHealth';
import { useColors } from '@/contexts/ThemeContext';

interface SourceHealthBadgeProps {
  sourceId: string;
  compact?: boolean;
}

export function SourceHealthBadge({ sourceId, compact = false }: SourceHealthBadgeProps) {
  const colors = useColors();
  const { data: health } = useSourceHealth(sourceId);

  if (!health || health.totalFetches === 0) {
    return null;
  }

  const getHealthColor = () => {
    if (health.successRate >= 90) return colors.statusOk;
    if (health.successRate >= 50) return colors.statusWarning;
    return colors.statusError;
  };

  const getHealthIcon = (): 'checkmark-circle' | 'alert-circle' | 'close-circle' => {
    if (health.successRate >= 90) return 'checkmark-circle';
    if (health.successRate >= 50) return 'alert-circle';
    return 'close-circle';
  };

  const healthColor = getHealthColor();

  if (compact) {
    return (
      <View style={[styles.compactBadge, { backgroundColor: healthColor + '20' }]}>
        <Ionicons name={getHealthIcon()} size={12} color={healthColor} />
      </View>
    );
  }

  return (
    <View style={[styles.badge, { backgroundColor: healthColor + '15' }]}>
      <Ionicons name={getHealthIcon()} size={14} color={healthColor} />
      <Text style={[styles.text, { color: healthColor }]}>{health.successRate}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  compactBadge: {
    padding: 4,
    borderRadius: 10,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
  },
});
