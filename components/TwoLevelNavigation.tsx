import { useRef } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Theme } from '@/types/database';
import { Topic } from '@/lib/topics/types';
import { MainTab } from '@/types/database';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface TwoLevelNavigationProps {
  mainTab: MainTab;
  onMainTabChange: (tab: MainTab) => void;
  categories: Theme[];
  topics: Topic[];
  selectedCategory: string | null;
  selectedTopic: string | null;
  onCategorySelect: (id: string | null) => void;
  onTopicSelect: (id: string | null) => void;
  onAddCategory: () => void;
  onAddTopic: () => void;
  unreadCounts: Map<string | null, number>;
}

export function TwoLevelNavigation({
  mainTab,
  onMainTabChange,
  categories,
  topics,
  selectedCategory,
  selectedTopic,
  onCategorySelect,
  onTopicSelect,
  onAddCategory,
  onAddTopic,
  unreadCounts,
}: TwoLevelNavigationProps) {
  const colors = useColors();
  const styles = createStyles(colors);
  const subTabsScrollRef = useRef<ScrollView>(null);

  const handleMainTabPress = (tab: MainTab) => {
    Haptics.selectionAsync();
    onMainTabChange(tab);
  };

  const handleCategoryPress = (id: string | null) => {
    Haptics.selectionAsync();
    onCategorySelect(id);
  };

  const handleTopicPress = (id: string) => {
    Haptics.selectionAsync();
    onTopicSelect(id);
  };

  const mainTabs = [
    { id: 'all' as MainTab, label: 'Tout', icon: 'grid-outline' as const },
    { id: 'categories' as MainTab, label: 'Catégories', icon: 'folder-outline' as const },
    { id: 'topics' as MainTab, label: 'Veille', icon: 'bookmark-outline' as const },
  ];

  return (
    <View style={styles.container}>
      {/* Main Tabs */}
      <View style={styles.mainTabsContainer}>
        {mainTabs.map((tab) => {
          const isSelected = mainTab === tab.id;
          const unreadCount = tab.id === 'all' ? unreadCounts.get(null) || 0 : 0;

          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.mainTab, isSelected && styles.mainTabActive]}
              onPress={() => handleMainTabPress(tab.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={tab.icon}
                size={20}
                color={isSelected ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.mainTabText, isSelected && styles.mainTabTextActive]}>
                {tab.label}
              </Text>
              {unreadCount > 0 && !isSelected && (
                <View style={[styles.mainTabBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Sub-Tabs for Categories */}
      {mainTab === 'categories' && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
          <ScrollView
            ref={subTabsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subTabsContent}
          >
            {/* "Toutes" option for categories */}
            <TouchableOpacity
              style={styles.subTab}
              onPress={() => handleCategoryPress(null)}
              activeOpacity={0.7}
            >
              <View style={styles.subTabLabelRow}>
                <Text
                  style={[
                    styles.subTabText,
                    selectedCategory === null && styles.subTabTextActive,
                  ]}
                >
                  Toutes
                </Text>
              </View>
              {selectedCategory === null && (
                <View style={[styles.subTabIndicator, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>

            {categories.map((category) => {
              const isSelected = selectedCategory === category.id;
              const unreadCount = unreadCounts.get(category.id) || 0;

              return (
                <TouchableOpacity
                  key={category.id}
                  style={styles.subTab}
                  onPress={() => handleCategoryPress(category.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.subTabLabelRow}>
                    <Text
                      style={[
                        styles.subTabText,
                        isSelected && styles.subTabTextActive,
                        isSelected && { color: category.color },
                      ]}
                    >
                      {category.name}
                    </Text>
                    {unreadCount > 0 && !isSelected && (
                      <View style={[styles.subTabBadge, { backgroundColor: category.color }]}>
                        <Text style={styles.badgeText}>
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                      </View>
                    )}
                  </View>
                  {isSelected && (
                    <View style={[styles.subTabIndicator, { backgroundColor: category.color }]} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Add category button */}
            <TouchableOpacity style={styles.addButton} onPress={onAddCategory}>
              <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.subTabDescription}>
            <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
            <Text style={styles.descriptionText}>Organisez vos sources par catégorie</Text>
          </View>
        </Animated.View>
      )}

      {/* Sub-Tabs for Topics */}
      {mainTab === 'topics' && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(200)}>
          <ScrollView
            ref={subTabsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.subTabsContent}
          >
            {topics.map((topic) => {
              const isSelected = selectedTopic === topic.id;

              return (
                <TouchableOpacity
                  key={topic.id}
                  style={styles.subTab}
                  onPress={() => handleTopicPress(topic.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.subTabLabelRow}>
                    <Text
                      style={[
                        styles.subTabText,
                        isSelected && styles.subTabTextActive,
                        isSelected && { color: topic.color },
                      ]}
                    >
                      {topic.name}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={[styles.subTabIndicator, { backgroundColor: topic.color }]} />
                  )}
                </TouchableOpacity>
              );
            })}

            {/* Add topic button */}
            <TouchableOpacity style={styles.addButton} onPress={onAddTopic}>
              <Ionicons name="add-circle-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </ScrollView>

          <View style={styles.subTabDescription}>
            <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
            <Text style={styles.descriptionText}>Suivez vos sujets d'intérêt par mots-clés</Text>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    mainTabsContainer: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      gap: spacing.xs,
    },
    mainTab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: 12,
      backgroundColor: colors.surface,
      position: 'relative',
    },
    mainTabActive: {
      backgroundColor: colors.primary + '15',
    },
    mainTabText: {
      ...typography.body,
      fontWeight: '600',
      color: colors.textMuted,
    },
    mainTabTextActive: {
      color: colors.primary,
      fontWeight: '700',
    },
    mainTabBadge: {
      position: 'absolute',
      top: spacing.xs,
      right: spacing.xs,
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xxs,
    },
    badgeText: {
      ...typography.caption,
      fontSize: 11,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    subTabsContent: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.xs,
    },
    subTab: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
      position: 'relative',
    },
    subTabLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    subTabText: {
      ...typography.body,
      fontWeight: '600',
      color: colors.textMuted,
    },
    subTabTextActive: {
      fontWeight: '700',
    },
    subTabBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.xxs,
    },
    subTabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: spacing.md,
      right: spacing.md,
      height: 3,
      borderRadius: 2,
    },
    addButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      justifyContent: 'center',
      alignItems: 'center',
    },
    subTabDescription: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.sm,
    },
    descriptionText: {
      ...typography.caption,
      color: colors.textMuted,
      fontStyle: 'italic',
    },
  });
