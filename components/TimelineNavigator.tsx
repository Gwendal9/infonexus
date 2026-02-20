/**
 * Timeline Navigator - Vertical timeline for navigating through articles by date
 * Discrete vertical bar on the right side showing date sections
 */

import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface TimelineItem {
  key: string;
  label: string;
  shortLabel: string; // For the timeline indicator
  sectionIndex: number;
}

interface TimelineNavigatorProps {
  sections: Array<{ title: string }>;
  currentSection: number;
  onNavigate: (sectionIndex: number) => void;
  visible?: boolean;
}

export function TimelineNavigator({
  sections,
  currentSection,
  onNavigate,
  visible = true,
}: TimelineNavigatorProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const [expanded, setExpanded] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Create timeline items from sections
  const timelineItems: TimelineItem[] = sections.map((section, index) => ({
    key: `timeline-${index}`,
    label: section.title,
    shortLabel: getShortLabel(section.title),
    sectionIndex: index,
  }));

  // Toggle expanded/collapsed
  const toggleExpanded = () => {
    const toValue = expanded ? 0 : 1;
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
      tension: 80,
      friction: 8,
    }).start();
    setExpanded(!expanded);
  };

  // Auto-collapse after 3 seconds
  useEffect(() => {
    if (expanded) {
      const timeout = setTimeout(() => {
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 8,
        }).start();
        setExpanded(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [expanded, slideAnim]);

  if (!visible || timelineItems.length === 0) return null;

  const translateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0], // Slide from right (hidden) to visible
  });

  return (
    <View style={styles.container}>
      {/* Collapsed indicator - always visible */}
      <TouchableOpacity
        style={styles.collapsedIndicator}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.indicatorDot} />
        <View style={[styles.indicatorLine, { height: 60 }]} />
      </TouchableOpacity>

      {/* Expanded timeline */}
      <Animated.View
        style={[
          styles.expandedTimeline,
          {
            transform: [{ translateX }],
            opacity: slideAnim,
          },
        ]}
        pointerEvents={expanded ? 'auto' : 'none'}
      >
        <View style={styles.timelineContent}>
          {/* Header */}
          <View style={styles.timelineHeader}>
            <Ionicons name="time-outline" size={16} color={colors.primary} />
            <Text style={styles.timelineHeaderText}>Chronologie</Text>
            <TouchableOpacity onPress={toggleExpanded} style={styles.closeButton}>
              <Ionicons name="close" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {/* Timeline items */}
          <View style={styles.timelineItems}>
            {timelineItems.map((item, index) => {
              const isActive = item.sectionIndex === currentSection;
              const isPast = item.sectionIndex < currentSection;

              return (
                <TouchableOpacity
                  key={item.key}
                  style={[
                    styles.timelineItem,
                    isActive && styles.timelineItemActive,
                  ]}
                  onPress={() => {
                    onNavigate(item.sectionIndex);
                    setExpanded(false);
                  }}
                  activeOpacity={0.7}
                >
                  {/* Connecting line */}
                  {index > 0 && (
                    <View
                      style={[
                        styles.connectingLine,
                        isPast && styles.connectingLinePast,
                      ]}
                    />
                  )}

                  {/* Dot */}
                  <View
                    style={[
                      styles.timelineDot,
                      isActive && styles.timelineDotActive,
                      isPast && styles.timelineDotPast,
                    ]}
                  >
                    {isActive && (
                      <View style={styles.timelineDotInner} />
                    )}
                  </View>

                  {/* Label */}
                  <View style={styles.timelineLabel}>
                    <Text
                      style={[
                        styles.timelineLabelText,
                        isActive && styles.timelineLabelTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </Text>
                    {isActive && (
                      <Ionicons
                        name="chevron-forward"
                        size={14}
                        color={colors.primary}
                        style={styles.activeIndicator}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

// Get short label for collapsed view
function getShortLabel(title: string): string {
  if (title === "Aujourd'hui") return 'Auj';
  if (title === 'Hier') return 'Hier';
  if (title.startsWith('Il y a')) {
    const match = title.match(/\d+/);
    if (match) return `${match[0]}j`;
  }
  if (title === 'La semaine dernière') return '1s';
  if (title.includes('semaines')) {
    const match = title.match(/\d+/);
    if (match) return `${match[0]}s`;
  }
  if (title === 'Le mois dernier') return '1m';
  // For months like "Janvier 2024"
  const parts = title.split(' ');
  if (parts.length === 2) {
    const monthShort = parts[0].substring(0, 3);
    return monthShort;
  }
  return title.substring(0, 3);
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      right: 0,
      top: 100, // Below header
      bottom: 100, // Above bottom tabs
      zIndex: 10,
      justifyContent: 'center',
    },
    collapsedIndicator: {
      position: 'absolute',
      right: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.md,
    },
    indicatorDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.primary,
      marginBottom: spacing.xs,
    },
    indicatorLine: {
      width: 2,
      backgroundColor: colors.primary + '40',
      borderRadius: 1,
    },
    expandedTimeline: {
      position: 'absolute',
      right: spacing.md,
      maxHeight: '80%',
      minWidth: 200,
      backgroundColor: colors.surface,
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
      overflow: 'hidden',
    },
    timelineContent: {
      flex: 1,
    },
    timelineHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      backgroundColor: colors.primary + '10',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    timelineHeaderText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
      flex: 1,
    },
    closeButton: {
      padding: spacing.xs,
    },
    timelineItems: {
      paddingVertical: spacing.sm,
    },
    timelineItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      position: 'relative',
    },
    timelineItemActive: {
      backgroundColor: colors.primary + '08',
    },
    connectingLine: {
      position: 'absolute',
      left: spacing.md + 6, // Center of dot
      top: -spacing.sm,
      width: 2,
      height: spacing.sm,
      backgroundColor: colors.border,
    },
    connectingLinePast: {
      backgroundColor: colors.primary + '60',
    },
    timelineDot: {
      width: 14,
      height: 14,
      borderRadius: 7,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      marginRight: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
    },
    timelineDotActive: {
      borderColor: colors.primary,
      backgroundColor: colors.surface,
      borderWidth: 2,
    },
    timelineDotPast: {
      backgroundColor: colors.primary + '60',
      borderColor: colors.primary + '60',
    },
    timelineDotInner: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.primary,
    },
    timelineLabel: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    timelineLabelText: {
      ...typography.body,
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    },
    timelineLabelTextActive: {
      color: colors.primary,
      fontWeight: '600',
    },
    activeIndicator: {
      marginLeft: 'auto',
    },
  });
