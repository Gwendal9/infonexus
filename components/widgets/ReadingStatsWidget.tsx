import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetContainer } from './WidgetContainer';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { supabase } from '@/utils/supabase';

interface ReadingStatsWidgetProps {
  compact?: boolean;
  expanded?: boolean;
}

interface ReadingStats {
  todayCount: number;
  weekCount: number;
  topSource: string | null;
  streak: number;
}

async function fetchReadingStats(): Promise<ReadingStats> {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const { data } = await supabase
    .from('read_articles')
    .select('read_at, article:articles(source_id, source:sources(name))')
    .gte('read_at', sevenDaysAgo)
    .order('read_at', { ascending: false });

  if (!data) return { todayCount: 0, weekCount: 0, topSource: null, streak: 0 };

  const weekCount = data.length;
  const todayCount = data.filter((r) => r.read_at >= todayStart).length;

  // Top source
  const sourceCounts = new Map<string, number>();
  data.forEach((r: any) => {
    const name = r.article?.source?.name;
    if (name) sourceCounts.set(name, (sourceCounts.get(name) ?? 0) + 1);
  });
  let topSource: string | null = null;
  let maxCount = 0;
  sourceCounts.forEach((count, name) => {
    if (count > maxCount) { maxCount = count; topSource = name; }
  });

  // Streak: consecutive days with at least one article read
  const readDays = new Set(
    data.map((r) => {
      const d = new Date(r.read_at);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })
  );
  let streak = 0;
  const cursor = new Date(now);
  while (true) {
    const key = `${cursor.getFullYear()}-${cursor.getMonth()}-${cursor.getDate()}`;
    if (!readDays.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
    if (streak > 7) break; // capped at 7-day window
  }

  return { todayCount, weekCount, topSource, streak };
}

export function ReadingStatsWidget({ compact, expanded }: ReadingStatsWidgetProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const [stats, setStats] = useState<ReadingStats>({ todayCount: 0, weekCount: 0, topSource: null, streak: 0 });

  useEffect(() => {
    fetchReadingStats().then(setStats).catch(() => {});
  }, []);

  if (compact) {
    return (
      <WidgetContainer title="Lecture" icon="bar-chart" iconColor="#5E5CE6" compact>
        <View style={styles.compactGrid}>
          <View style={styles.compactStat}>
            <Text style={styles.compactNumber}>{stats.todayCount}</Text>
            <Text style={styles.compactLabel}>Aujourd'hui</Text>
          </View>
          <View style={styles.compactDivider} />
          <View style={styles.compactStat}>
            <Text style={styles.compactNumber}>{stats.streak}</Text>
            <Text style={styles.compactLabel}>Jours 🔥</Text>
          </View>
        </View>
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title="Statistiques de lecture" icon="bar-chart" iconColor="#5E5CE6" expanded={expanded}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="today" size={20} color="#5E5CE6" />
          <Text style={styles.statNumber}>{stats.todayCount}</Text>
          <Text style={styles.statLabel}>Aujourd'hui</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="calendar" size={20} color="#30B0C7" />
          <Text style={styles.statNumber}>{stats.weekCount}</Text>
          <Text style={styles.statLabel}>Cette semaine</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={20} color="#FF9500" />
          <Text style={styles.statNumber}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Jours consécutifs</Text>
        </View>
      </View>
      {stats.topSource && (
        <View style={styles.topSource}>
          <Ionicons name="star" size={14} color="#FFB800" />
          <Text style={styles.topSourceText} numberOfLines={1}>
            Source favorite : <Text style={styles.topSourceName}>{stats.topSource}</Text>
          </Text>
        </View>
      )}
    </WidgetContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    compactGrid: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
    },
    compactStat: {
      alignItems: 'center',
      flex: 1,
    },
    compactNumber: {
      ...typography.titleMd,
      color: colors.textPrimary,
      fontWeight: '800',
    },
    compactLabel: {
      ...typography.small,
      color: colors.textMuted,
      marginTop: 2,
    },
    compactDivider: {
      width: 1,
      height: 28,
      backgroundColor: colors.border,
    },
    statsGrid: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    statCard: {
      flex: 1,
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: spacing.sm,
    },
    statNumber: {
      ...typography.titleLg,
      color: colors.textPrimary,
      fontWeight: '800',
    },
    statLabel: {
      ...typography.small,
      color: colors.textMuted,
      textAlign: 'center',
    },
    topSource: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      backgroundColor: colors.background,
      borderRadius: 10,
      padding: spacing.sm,
    },
    topSourceText: {
      ...typography.caption,
      color: colors.textSecondary,
      flex: 1,
    },
    topSourceName: {
      color: colors.textPrimary,
      fontWeight: '700',
    },
  });
