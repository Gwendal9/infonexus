import { forwardRef, useMemo, useState, useCallback } from 'react';
import { RefreshControl, SectionList, StyleSheet, Text, View } from 'react-native';
import { ArticleWithSource } from '@/lib/queries/useArticles';
import { SwipeableArticleCard } from '@/components/SwipeableArticleCard';
import { TimelineNavigator } from '@/components/TimelineNavigator';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface GroupedArticleListProps {
  articles: ArticleWithSource[];
  favoriteIds: Set<string> | undefined;
  readArticleIds: Set<string> | undefined;
  onArticlePress: (article: ArticleWithSource) => void;
  onToggleFavorite: (articleId: string) => void;
  onMarkAsRead: (articleId: string) => void;
  onScroll?: (event: any) => void;
  ListHeaderComponent?: React.ReactElement | null;
  ListEmptyComponent?: React.ReactElement | null;
  refreshControl?: React.ReactElement;
}

interface ArticleSection {
  title: string;
  data: ArticleWithSource[];
}

function getDateGroup(dateString: string | null): string {
  if (!dateString) return 'Date inconnue';

  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  // Reset time to midnight for accurate day comparison
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const articleDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const daysDiff = Math.floor((today.getTime() - articleDate.getTime()) / 86400000);

  if (daysDiff === 0) return "Aujourd'hui";
  if (daysDiff === 1) return 'Hier';
  if (daysDiff < 7) return `Il y a ${daysDiff} jours`;
  if (daysDiff < 14) return 'La semaine dernière';
  if (daysDiff < 30) return `Il y a ${Math.floor(daysDiff / 7)} semaines`;
  if (daysDiff < 60) return 'Le mois dernier';

  // Format: "Janvier 2024"
  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

export const GroupedArticleList = forwardRef<SectionList, GroupedArticleListProps>(
  function GroupedArticleList({
    articles,
    favoriteIds,
    readArticleIds,
    onArticlePress,
    onToggleFavorite,
    onMarkAsRead,
    onScroll,
    ListHeaderComponent,
    ListEmptyComponent,
    refreshControl,
  }, ref) {
    const colors = useColors();
    const styles = createStyles(colors);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

    // Handle timeline navigation
    const handleNavigateToSection = useCallback((sectionIndex: number) => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.scrollToLocation({
          sectionIndex,
          itemIndex: 0,
          animated: true,
          viewPosition: 0,
        });
      }
    }, [ref]);

    // Track current section while scrolling
    const handleScrollWithTracking = useCallback((event: any) => {
      onScroll?.(event);
      // Note: We'll update currentSectionIndex through viewableItemsChanged
    }, [onScroll]);

  // Group articles by date
  const sections = useMemo(() => {
    const grouped = new Map<string, ArticleWithSource[]>();

    articles.forEach(article => {
      const group = getDateGroup(article.published_at);
      if (!grouped.has(group)) {
        grouped.set(group, []);
      }
      grouped.get(group)!.push(article);
    });

    // Convert to array and sort by date (most recent first)
    const sectionOrder = [
      "Aujourd'hui",
      'Hier',
      'Il y a 2 jours',
      'Il y a 3 jours',
      'Il y a 4 jours',
      'Il y a 5 jours',
      'Il y a 6 jours',
      'La semaine dernière',
    ];

    const sections: ArticleSection[] = [];

    // Add ordered sections first
    sectionOrder.forEach(title => {
      if (grouped.has(title)) {
        sections.push({ title, data: grouped.get(title)! });
        grouped.delete(title);
      }
    });

    // Add remaining sections (weeks, months) sorted
    Array.from(grouped.entries())
      .sort((a, b) => {
        // Get first article of each group to compare dates
        const dateA = new Date(a[1][0].published_at || 0);
        const dateB = new Date(b[1][0].published_at || 0);
        return dateB.getTime() - dateA.getTime();
      })
      .forEach(([title, data]) => {
        sections.push({ title, data });
      });

    return sections;
  }, [articles]);

    return (
      <>
        <SectionList
        ref={ref}
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index, section }) => {
          // Calculate global index for animation delay
          const sectionIndex = sections.findIndex(s => s.title === section.title);
          const itemsBefore = sections
            .slice(0, sectionIndex)
            .reduce((sum, s) => sum + s.data.length, 0);
          const globalIndex = itemsBefore + index;

          return (
            <SwipeableArticleCard
              article={item}
              onPress={() => onArticlePress(item)}
              isFavorite={favoriteIds?.has(item.id)}
              onToggleFavorite={() => onToggleFavorite(item.id)}
              onMarkAsRead={() => onMarkAsRead(item.id)}
              isRead={readArticleIds?.has(item.id)}
              index={globalIndex}
            />
          );
        }}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.sectionLine} />
            <Text style={styles.sectionCount}>
              {section.data.length} article{section.data.length !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={sections.length === 0 ? styles.emptyList : styles.list}
        ListHeaderComponent={ListHeaderComponent}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={refreshControl}
        onScroll={handleScrollWithTracking}
        scrollEventThrottle={100}
        onViewableItemsChanged={({ viewableItems }) => {
          // Update current section based on first visible item
          if (viewableItems.length > 0 && viewableItems[0].section) {
            const sectionIndex = sections.findIndex(
              s => s.title === (viewableItems[0].section as ArticleSection).title
            );
            if (sectionIndex !== -1) {
              setCurrentSectionIndex(sectionIndex);
            }
          }
        }}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
      />

        {/* Timeline Navigator */}
        <TimelineNavigator
          sections={sections}
          currentSection={currentSectionIndex}
          onNavigate={handleNavigateToSection}
          visible={sections.length > 1}
        />
      </>
    );
  }
);

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    list: {
      padding: spacing.md,
    },
    emptyList: {
      flexGrow: 1,
      padding: spacing.md,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xl,
      marginBottom: spacing.md,
      gap: spacing.sm,
      paddingHorizontal: spacing.xs,
    },
    sectionTitle: {
      ...typography.subheading,
      fontWeight: '800',
      color: colors.textPrimary,
      fontSize: 16,
    },
    sectionLine: {
      flex: 1,
      height: 2,
      backgroundColor: colors.primary,
      opacity: 0.15,
      borderRadius: 1,
    },
    sectionCount: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '700',
      backgroundColor: colors.background,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xxs,
      borderRadius: 8,
      overflow: 'hidden',
    },
  });
