import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Source } from '@/types/database';
import { SourceHealthBadge } from './SourceHealthBadge';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface SourceCardProps {
  source: Source;
  onDelete: () => void;
  onPress?: () => void;
  onHealthPress?: () => void;
}

const typeIcons = {
  rss: 'logo-rss',
  html: 'globe-outline',
  youtube: 'logo-youtube',
} as const;

function getRelativeTime(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins}min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return past.toLocaleDateString('fr-FR');
}

export function SourceCard({ source, onDelete, onPress, onHealthPress }: SourceCardProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const isError = source.status === 'error';
  const isActive = source.status === 'active';

  // Couleur de la bordure selon le statut
  const statusColor = isError ? colors.statusError : isActive ? colors.statusOk : colors.statusWarning;
  const statusLabel = isError ? 'Erreur' : isActive ? 'Actif' : 'En attente';
  const statusIcon = isError ? 'alert-circle' : isActive ? 'checkmark-circle' : 'time';

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: statusColor, borderLeftWidth: 3 }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={typeIcons[source.type]}
          size={24}
          color={colors.textSecondary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.nameRow}>
          <Text style={styles.name} numberOfLines={1}>
            {source.name}
          </Text>
          <TouchableOpacity onPress={onHealthPress} disabled={!onHealthPress}>
            <SourceHealthBadge sourceId={source.id} compact />
          </TouchableOpacity>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name={statusIcon as any} size={12} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
        </View>

        {source.last_fetched_at && (
          <Text style={styles.lastFetch}>
            Sync {getRelativeTime(source.last_fetched_at)}
          </Text>
        )}

        {isError && source.last_error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={12} color={colors.statusError} />
            <Text style={styles.errorText} numberOfLines={2}>
              {source.last_error}
            </Text>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    content: {
      flex: 1,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    name: {
      ...typography.titleMd,
      color: colors.textPrimary,
      flex: 1,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 10,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
    },
    lastFetch: {
      ...typography.small,
      color: colors.textMuted,
      marginTop: spacing.xxs,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
      marginTop: spacing.xs,
      backgroundColor: colors.statusError + '15',
      padding: spacing.sm,
      borderRadius: 8,
    },
    errorText: {
      ...typography.small,
      color: colors.statusError,
      flex: 1,
    },
    deleteButton: {
      padding: spacing.xs,
      marginLeft: spacing.sm,
    },
  });
