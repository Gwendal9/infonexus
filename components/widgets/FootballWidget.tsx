import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WidgetContainer } from './WidgetContainer';
import { useColors } from '@/contexts/ThemeContext';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { FootballLeague } from '@/lib/widgets/types';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface TeamStanding {
  position: number;
  team: {
    name: string;
    shortName: string;
    crest: string;
  };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalDifference: number;
}

interface LeagueStandings {
  league: FootballLeague;
  table: TeamStanding[];
  error?: boolean;
}

interface FootballWidgetProps {
  compact?: boolean;
  expanded?: boolean;
}

const FOOTBALL_COLOR = '#4CAF50';

export function FootballWidget({ compact, expanded }: FootballWidgetProps) {
  const colors = useColors();
  const { config } = useWidgetConfig();
  const { leagues } = config.settings.football;

  const [standings, setStandings] = useState<LeagueStandings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const results = await Promise.all(
        leagues.map(async (league): Promise<LeagueStandings> => {
          try {
            const response = await fetch(
              `https://api.football-data.org/v4/competitions/${league.code}/standings`,
              { headers: { 'X-Auth-Token': '61139949e8e6467e8e98b75fc486be50' } }
            );
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const data = await response.json();
            const table = data.standings?.[0]?.table ?? [];
            return {
              league,
              table: table.map((entry: any) => ({
                position: entry.position,
                team: {
                  name: entry.team.name,
                  shortName: entry.team.shortName ?? entry.team.name,
                  crest: entry.team.crest,
                },
                playedGames: entry.playedGames,
                won: entry.won,
                draw: entry.draw,
                lost: entry.lost,
                points: entry.points,
                goalDifference: entry.goalDifference,
              })),
            };
          } catch {
            return { league, table: [], error: true };
          }
        })
      );

      setStandings(results);
      const allFailed = results.every((r) => r.error);
      setError(allFailed);
    } catch (err) {
      console.error('[FootballWidget] Error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [leagues]);

  useEffect(() => {
    fetchStandings();
    const interval = setInterval(fetchStandings, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStandings]);

  const styles = createStyles(colors, compact, expanded);

  if (loading && standings.length === 0) {
    return (
      <WidgetContainer title="Football" icon="football" iconColor={FOOTBALL_COLOR} compact={compact} expanded={expanded}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </WidgetContainer>
    );
  }

  if (error || standings.length === 0) {
    return (
      <WidgetContainer title="Football" icon="football" iconColor={FOOTBALL_COLOR} compact={compact} expanded={expanded}>
        <Text style={styles.errorText}>Indisponible</Text>
      </WidgetContainer>
    );
  }

  // Compact mode - first league, top 3
  if (compact) {
    const first = standings[0];
    if (!first || first.table.length === 0) {
      return (
        <WidgetContainer title="Football" icon="football" iconColor={FOOTBALL_COLOR} compact>
          <Text style={styles.errorText}>Indisponible</Text>
        </WidgetContainer>
      );
    }
    const top3 = first.table.slice(0, 3);
    return (
      <WidgetContainer title="Football" icon="football" iconColor={FOOTBALL_COLOR} compact>
        <View style={styles.compactContent}>
          <Text style={styles.compactLeague} numberOfLines={1}>{first.league.name}</Text>
          {top3.map((team) => (
            <View key={team.position} style={styles.compactRow}>
              <Text style={styles.compactPosition}>{team.position}</Text>
              <Text style={styles.compactTeam} numberOfLines={1}>{team.team.shortName}</Text>
              <Text style={styles.compactPoints}>{team.points}</Text>
            </View>
          ))}
        </View>
      </WidgetContainer>
    );
  }

  // Expanded mode - tabs + full table
  if (expanded) {
    const current = standings[activeTab];
    return (
      <WidgetContainer title="Football" icon="football" iconColor={FOOTBALL_COLOR} expanded>
        {standings.length > 1 && (
          <View style={styles.tabBar}>
            {standings.map((s, i) => (
              <TouchableOpacity
                key={s.league.code}
                style={[styles.tab, activeTab === i && styles.tabActive]}
                onPress={() => setActiveTab(i)}
              >
                <Text style={[styles.tabText, activeTab === i && styles.tabTextActive]}>
                  {s.league.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {current && !current.error && current.table.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollContainer}>
            {/* Header row */}
            <View style={styles.tableHeader}>
              <Text style={[styles.headerCell, styles.posCol]}>#</Text>
              <Text style={[styles.headerCell, styles.teamCol]}>Club</Text>
              <Text style={[styles.headerCell, styles.statCol]}>J</Text>
              <Text style={[styles.headerCell, styles.statCol]}>G</Text>
              <Text style={[styles.headerCell, styles.statCol]}>N</Text>
              <Text style={[styles.headerCell, styles.statCol]}>P</Text>
              <Text style={[styles.headerCell, styles.statCol]}>Diff</Text>
              <Text style={[styles.headerCell, styles.ptsCol]}>Pts</Text>
            </View>
            {current.table.map((team, index) => (
              <View
                key={team.position}
                style={[
                  styles.tableRow,
                  index % 2 === 0 && styles.tableRowEven,
                ]}
              >
                <Text style={[styles.cell, styles.posCol, team.position <= 4 && styles.topPosition]}>
                  {team.position}
                </Text>
                <Text style={[styles.cell, styles.teamCol]} numberOfLines={1}>
                  {team.team.shortName}
                </Text>
                <Text style={[styles.cell, styles.statCol]}>{team.playedGames}</Text>
                <Text style={[styles.cell, styles.statCol]}>{team.won}</Text>
                <Text style={[styles.cell, styles.statCol]}>{team.draw}</Text>
                <Text style={[styles.cell, styles.statCol]}>{team.lost}</Text>
                <Text style={[styles.cell, styles.statCol, { color: team.goalDifference > 0 ? '#10B981' : team.goalDifference < 0 ? '#EF4444' : colors.textSecondary }]}>
                  {team.goalDifference > 0 ? `+${team.goalDifference}` : team.goalDifference}
                </Text>
                <Text style={[styles.cell, styles.ptsCol]}>{team.points}</Text>
              </View>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.errorText}>Classement indisponible</Text>
        )}
      </WidgetContainer>
    );
  }

  // Normal mode (grid) - first league, top 5
  const first = standings[0];
  if (!first || first.table.length === 0) {
    return (
      <WidgetContainer title="Football" icon="football" iconColor={FOOTBALL_COLOR}>
        <Text style={styles.errorText}>Indisponible</Text>
      </WidgetContainer>
    );
  }
  const top5 = first.table.slice(0, 5);
  return (
    <WidgetContainer title="Football" icon="football" iconColor={FOOTBALL_COLOR}>
      <Text style={styles.normalLeague}>{first.league.name}</Text>
      <View style={styles.normalTable}>
        {top5.map((team, index) => (
          <View key={team.position}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.normalRow}>
              <Text style={[styles.normalPosition, team.position <= 4 && styles.topPosition]}>
                {team.position}
              </Text>
              <Text style={styles.normalTeam} numberOfLines={1}>{team.team.shortName}</Text>
              <Text style={styles.normalPoints}>{team.points} pts</Text>
            </View>
          </View>
        ))}
      </View>
    </WidgetContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>, compact?: boolean, expanded?: boolean) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContainer: {
      flex: 1,
    },
    errorText: {
      ...typography.caption,
      color: colors.textMuted,
    },
    // Compact
    compactContent: {
      flex: 1,
      justifyContent: 'center',
      gap: 3,
    },
    compactLeague: {
      ...typography.small,
      color: colors.textMuted,
      fontWeight: '600',
      marginBottom: 2,
    },
    compactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    compactPosition: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
      width: 14,
      textAlign: 'center',
    },
    compactTeam: {
      fontSize: 11,
      color: colors.textPrimary,
      flex: 1,
    },
    compactPoints: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    // Normal
    normalLeague: {
      ...typography.small,
      color: colors.textMuted,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    normalTable: {
      gap: 0,
    },
    normalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    normalPosition: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '700',
      width: 20,
      textAlign: 'center',
    },
    normalTeam: {
      ...typography.caption,
      color: colors.textPrimary,
      flex: 1,
      marginLeft: spacing.xs,
    },
    normalPoints: {
      ...typography.caption,
      color: colors.textPrimary,
      fontWeight: '700',
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    topPosition: {
      color: colors.primary,
    },
    // Expanded - tabs
    tabBar: {
      flexDirection: 'row',
      marginBottom: spacing.md,
      gap: spacing.xs,
    },
    tab: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.background,
    },
    tabActive: {
      backgroundColor: colors.primary,
    },
    tabText: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '600',
    },
    tabTextActive: {
      color: colors.surface,
    },
    // Expanded - table
    tableHeader: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      borderBottomWidth: 2,
      borderBottomColor: colors.border,
    },
    headerCell: {
      ...typography.small,
      color: colors.textMuted,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      alignItems: 'center',
    },
    tableRowEven: {
      backgroundColor: colors.background + '80',
    },
    cell: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    posCol: {
      width: 28,
      textAlign: 'center',
    },
    teamCol: {
      flex: 1,
    },
    statCol: {
      width: 30,
      textAlign: 'center',
    },
    ptsCol: {
      width: 34,
      textAlign: 'center',
      fontWeight: '700',
      color: colors.textPrimary,
    },
  });
