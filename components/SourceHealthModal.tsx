import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSourceHealth, useSourceFetchLogs } from '@/lib/queries/useSourceHealth';
import { Source } from '@/types/database';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface SourceHealthModalProps {
  source: Source;
  onClose: () => void;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  return `Il y a ${diffDays}j`;
}

export function SourceHealthModal({ source, onClose }: SourceHealthModalProps) {
  const colors = useColors();
  const { data: health } = useSourceHealth(source.id);
  const { data: logs } = useSourceFetchLogs(source.id);

  const styles = createStyles(colors);

  const getHealthColor = (rate: number) => {
    if (rate >= 90) return colors.statusOk;
    if (rate >= 50) return colors.statusWarning;
    return colors.statusError;
  };

  const getStatusColor = () => {
    if (source.status === 'active') return colors.statusOk;
    if (source.status === 'error') return colors.statusError;
    return colors.statusWarning;
  };

  const getStatusLabel = () => {
    if (source.status === 'active') return 'Actif';
    if (source.status === 'error') return 'Erreur';
    return 'En attente';
  };

  return (
    <TouchableOpacity
      style={styles.overlay}
      activeOpacity={1}
      onPress={onClose}
    >
      <TouchableOpacity activeOpacity={1} style={styles.modal}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>{source.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '15' }]}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusLabel()}
            </Text>
          </View>
        </View>

        {/* Health Stats */}
        {health && health.totalFetches > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: getHealthColor(health.successRate) }]}>
                {health.successRate}%
              </Text>
              <Text style={styles.statLabel}>Taux de succès</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{health.totalFetches}</Text>
              <Text style={styles.statLabel}>Tentatives</Text>
            </View>
          </View>
        )}

        {/* Last Error */}
        {source.last_error && (
          <View style={styles.errorBox}>
            <View style={styles.errorHeader}>
              <Ionicons name="alert-circle" size={16} color={colors.statusError} />
              <Text style={styles.errorTitle}>Dernière erreur</Text>
            </View>
            <Text style={styles.errorText} numberOfLines={3}>{source.last_error}</Text>
          </View>
        )}

        {/* Fetch History */}
        <Text style={styles.sectionTitle}>Historique des récupérations</Text>
        <ScrollView style={styles.logsList} showsVerticalScrollIndicator={false}>
          {logs && logs.length > 0 ? (
            logs.map((log) => (
              <View key={log.id} style={styles.logItem}>
                <View style={styles.logIconContainer}>
                  <Ionicons
                    name={log.success ? 'checkmark-circle' : 'close-circle'}
                    size={20}
                    color={log.success ? colors.statusOk : colors.statusError}
                  />
                </View>
                <View style={styles.logContent}>
                  <View style={styles.logHeader}>
                    <Text style={styles.logTime}>{formatRelativeTime(log.fetchedAt)}</Text>
                    {log.success && (
                      <Text style={styles.logArticles}>
                        {log.articlesCount} article{log.articlesCount !== 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                  {log.error && (
                    <Text style={styles.logError} numberOfLines={2}>{log.error}</Text>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyLogs}>
              <Ionicons name="time-outline" size={32} color={colors.textMuted} />
              <Text style={styles.emptyLogsText}>Aucun historique</Text>
              <Text style={styles.emptyLogsHint}>
                Rafraîchissez les sources pour voir l{"'"}historique
              </Text>
            </View>
          )}
        </ScrollView>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
      maxHeight: '75%',
    },
    handle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.titleLg,
      color: colors.textPrimary,
      flex: 1,
      marginRight: spacing.md,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    statsContainer: {
      flexDirection: 'row',
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
    },
    statDivider: {
      width: 1,
      backgroundColor: colors.border,
      marginHorizontal: spacing.md,
    },
    statValue: {
      ...typography.titleLg,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    statLabel: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xxs,
    },
    errorBox: {
      backgroundColor: colors.statusError + '10',
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    errorHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.xs,
    },
    errorTitle: {
      ...typography.body,
      color: colors.statusError,
      fontWeight: '600',
    },
    errorText: {
      ...typography.body,
      color: colors.textSecondary,
    },
    sectionTitle: {
      ...typography.titleMd,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    logsList: {
      maxHeight: 250,
    },
    logItem: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    logIconContainer: {
      marginRight: spacing.sm,
      paddingTop: 2,
    },
    logContent: {
      flex: 1,
    },
    logHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    logTime: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    logArticles: {
      ...typography.caption,
      color: colors.textMuted,
    },
    logError: {
      ...typography.small,
      color: colors.statusError,
      marginTop: spacing.xxs,
    },
    emptyLogs: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    emptyLogsText: {
      ...typography.body,
      color: colors.textSecondary,
      marginTop: spacing.sm,
    },
    emptyLogsHint: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: spacing.xxs,
    },
  });
