import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { SwipeableSourceCard } from '@/components/SwipeableSourceCard';
import { AddSourceModal } from '@/components/AddSourceModal';
import { ThemeChip } from '@/components/ThemeChip';
import { AddThemeModal } from '@/components/AddThemeModal';
import { AddTopicModal } from '@/components/AddTopicModal';
import { SourceHealthModal } from '@/components/SourceHealthModal';
import { useSources } from '@/lib/queries/useSources';
import { useThemes } from '@/lib/queries/useThemes';
import { useAllSourceThemes } from '@/lib/queries/useSourceThemes';
import { useAddSource, useDeleteSource } from '@/lib/mutations/useSourceMutations';
import { parseRSSFeed } from '@/lib/services/rssParser';
import { useToast } from '@/contexts/ToastContext';
import {
  useAddTheme,
  useDeleteTheme,
  useAssignThemeToSource,
} from '@/lib/mutations/useThemeMutations';
import { SourceType } from '@/types/database';
import { useColors } from '@/contexts/ThemeContext';
import { useTopics } from '@/contexts/TopicContext';
import { Topic } from '@/lib/topics/types';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export default function SourcesScreen() {
  const colors = useColors();
  const { showSuccess, showError } = useToast();
  const [sourceModalVisible, setSourceModalVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);
  const [topicModalVisible, setTopicModalVisible] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | undefined>();
  const [assignThemeSourceId, setAssignThemeSourceId] = useState<string | null>(null);
  const [healthSourceId, setHealthSourceId] = useState<string | null>(null);
  const [testingSourceIds, setTestingSourceIds] = useState<Set<string>>(new Set());

  const styles = createStyles(colors);

  const { config: topicConfig, addTopic, updateTopic, deleteTopic } = useTopics();

  const { data: sources, isLoading, refetch, isRefetching } = useSources();
  const { data: themes, refetch: refetchThemes } = useThemes();
  const { data: sourceThemes, refetch: refetchSourceThemes } = useAllSourceThemes();

  const addSource = useAddSource();
  const deleteSource = useDeleteSource();
  const addTheme = useAddTheme();
  const deleteTheme = useDeleteTheme();
  const assignTheme = useAssignThemeToSource();

  const handleAddSource = async (url: string, name: string, type: SourceType) => {
    try {
      await addSource.mutateAsync({ url, name, type });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSourceModalVisible(false);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleAddTheme = async (name: string, color: string) => {
    try {
      await addTheme.mutateAsync({ name, color });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setThemeModalVisible(false);
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleToggleTheme = async (sourceId: string, themeId: string) => {
    const currentThemes = sourceThemes?.get(sourceId) ?? [];
    const isAssigned = currentThemes.includes(themeId);

    Haptics.selectionAsync();
    try {
      await assignTheme.mutateAsync({ sourceId, themeId, assign: !isAssigned });
      await refetchSourceThemes();
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Erreur', e.message || 'Erreur inconnue');
    }
  };

  const handleTestSource = async (sourceId: string, url: string) => {
    setTestingSourceIds((prev) => new Set(prev).add(sourceId));
    try {
      const articles = await parseRSSFeed(url);
      if (articles.length > 0) {
        showSuccess(`✓ ${articles.length} article${articles.length > 1 ? 's' : ''} trouvé${articles.length > 1 ? 's' : ''}`);
      } else {
        showError('Flux vide ou non reconnu');
      }
    } catch {
      showError('Erreur : impossible de lire ce flux');
    } finally {
      setTestingSourceIds((prev) => {
        const next = new Set(prev);
        next.delete(sourceId);
        return next;
      });
    }
  };

  const selectedSource = sources?.find(s => s.id === assignThemeSourceId);
  const selectedSourceThemes = assignThemeSourceId ? (sourceThemes?.get(assignThemeSourceId) ?? []) : [];
  const healthSource = sources?.find(s => s.id === healthSourceId);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Themes Section */}
      <View style={styles.themesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Thèmes</Text>
          <TouchableOpacity onPress={() => setThemeModalVisible(true)}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {themes && themes.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.themesRow}>
              {themes.map((theme) => (
                <ThemeChip
                  key={theme.id}
                  theme={theme}
                  showDelete
                  onDelete={() => deleteTheme.mutate(theme.id)}
                />
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.noThemes}>Aucun thème. Créez-en pour organiser vos sources.</Text>
        )}
      </View>

      {/* Topics Section */}
      <View style={styles.themesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sujets</Text>
          <TouchableOpacity onPress={() => {
            setEditingTopic(undefined);
            setTopicModalVisible(true);
          }}>
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
        {topicConfig.topics.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.themesRow}>
              {topicConfig.topics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[styles.topicChip, { borderColor: topic.color }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setEditingTopic(topic);
                    setTopicModalVisible(true);
                  }}
                  activeOpacity={0.7}
                >
                  <View style={[styles.topicDot, { backgroundColor: topic.color }]} />
                  <Text style={styles.topicChipText}>{topic.name}</Text>
                  <Text style={styles.topicKeywordCount}>{topic.keywords.length}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        ) : (
          <Text style={styles.noThemes}>Aucun sujet. Créez-en pour filtrer vos articles par mots-clés.</Text>
        )}
      </View>

      {/* Sources List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => {
              refetch();
              refetchThemes();
              refetchSourceThemes();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {sources && sources.length > 0 ? (
          <>
            <View style={styles.swipeHintContainer}>
              <Ionicons name="arrow-back" size={12} color={colors.textMuted} />
              <Text style={styles.swipeHint}>Glissez pour supprimer</Text>
            </View>
            {sources.map((source) => {
              const assignedThemeIds = sourceThemes?.get(source.id) ?? [];
              const assignedThemes = themes?.filter(t => assignedThemeIds.includes(t.id)) ?? [];

              return (
                <View key={source.id} style={styles.sourceContainer}>
                  <SwipeableSourceCard
                    source={source}
                    onDelete={() => deleteSource.mutate(source.id)}
                    onPress={() => setAssignThemeSourceId(source.id)}
                    onHealthPress={() => setHealthSourceId(source.id)}
                    onTestPress={() => handleTestSource(source.id, source.url)}
                    isTesting={testingSourceIds.has(source.id)}
                  />
                  {assignedThemes.length > 0 && (
                    <View style={styles.assignedThemes}>
                      {assignedThemes.map((theme) => (
                        <View
                          key={theme.id}
                          style={[styles.miniChip, { backgroundColor: theme.color }]}
                        >
                          <Text style={styles.miniChipText}>{theme.name}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              );
            })}
          </>
        ) : (
          <View style={styles.empty}>
            <Ionicons name="globe-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucune source</Text>
            <Text style={styles.emptyText}>
              Ajoutez vos sources RSS, sites web ou chaînes YouTube pour commencer.
            </Text>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSourceModalVisible(true);
      }}>
        <Ionicons name="add" size={28} color={colors.surface} />
      </TouchableOpacity>

      <AddSourceModal
        visible={sourceModalVisible}
        onClose={() => setSourceModalVisible(false)}
        onAdd={handleAddSource}
        loading={addSource.isPending}
        error={addSource.error?.message}
        existingSourceUrls={sources?.map(s => s.url) ?? []}
      />

      <AddThemeModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
        onAdd={handleAddTheme}
        loading={addTheme.isPending}
        error={addTheme.error?.message}
      />

      <AddTopicModal
        visible={topicModalVisible}
        onClose={() => {
          setTopicModalVisible(false);
          setEditingTopic(undefined);
        }}
        onAdd={addTopic}
        onUpdate={(id, updates) => updateTopic(id, updates)}
        onDelete={deleteTopic}
        topic={editingTopic}
      />

      {/* Source Health Modal */}
      {healthSource && (
        <SourceHealthModal
          source={healthSource}
          onClose={() => setHealthSourceId(null)}
        />
      )}

      {/* Assign Themes Modal */}
      <Modal
        visible={!!assignThemeSourceId}
        transparent
        animationType="slide"
        onRequestClose={() => setAssignThemeSourceId(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAssignThemeSourceId(null)}
        >
          <Pressable style={styles.assignModal} onPress={() => {}}>
            <View style={styles.modalHandle} />

            <Text style={styles.assignModalTitle} numberOfLines={1}>
              {selectedSource?.name}
            </Text>
            <Text style={styles.assignModalSubtitle}>Sélectionnez les thèmes</Text>

            {themes && themes.length > 0 ? (
              <ScrollView style={styles.themesListScroll} showsVerticalScrollIndicator={false}>
                <View style={styles.themesList}>
                  {themes.map((theme) => {
                    const isAssigned = selectedSourceThemes.includes(theme.id);
                    return (
                      <TouchableOpacity
                        key={theme.id}
                        style={[styles.themeRow, isAssigned && styles.themeRowActive]}
                        onPress={() => handleToggleTheme(assignThemeSourceId!, theme.id)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={[
                            styles.themeColorDot,
                            { backgroundColor: theme.color },
                            isAssigned && styles.themeColorDotActive,
                          ]}
                        />
                        <Text style={[styles.themeName, isAssigned && styles.themeNameActive]}>
                          {theme.name}
                        </Text>
                        {isAssigned && (
                          <Ionicons name="checkmark" size={20} color={colors.primary} />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.noThemesModal}>
                <Ionicons name="pricetags-outline" size={40} color={colors.textMuted} />
                <Text style={styles.noThemesModalText}>
                  Aucun thème créé
                </Text>
                <Text style={styles.noThemesModalHint}>
                  Créez des thèmes depuis l{"'"}écran Sources
                </Text>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    scrollView: {
      flex: 1,
    },
    themesSection: {
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    sectionTitle: {
      ...typography.titleMd,
      color: colors.textPrimary,
    },
    themesRow: {
      flexDirection: 'row',
    },
    noThemes: {
      ...typography.caption,
      color: colors.textMuted,
    },
    list: {
      padding: spacing.md,
      flexGrow: 1,
    },
    sourceContainer: {
      marginBottom: spacing.sm,
    },
    assignedThemes: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: -spacing.xs,
      marginLeft: spacing.md,
      gap: spacing.xs,
    },
    miniChip: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 12,
    },
    miniChipText: {
      ...typography.small,
      color: colors.surface,
      fontWeight: '600',
    },
    empty: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: spacing.xxl,
    },
    emptyTitle: {
      ...typography.titleLg,
      color: colors.textPrimary,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    emptyText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: spacing.xl,
    },
    fab: {
      position: 'absolute',
      right: spacing.lg,
      bottom: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    assignModal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.xxl,
      maxHeight: '70%',
      minHeight: 300,
    },
    modalHandle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: spacing.md,
      marginBottom: spacing.lg,
    },
    assignModalTitle: {
      ...typography.titleLg,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    assignModalSubtitle: {
      ...typography.caption,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: spacing.xxs,
      marginBottom: spacing.lg,
    },
    themesListScroll: {
      maxHeight: 280,
    },
    themesList: {
      gap: spacing.sm,
      paddingBottom: spacing.md,
    },
    themeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderRadius: 12,
      backgroundColor: colors.background,
    },
    themeRowActive: {
      backgroundColor: colors.primary + '12',
    },
    themeColorDot: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: spacing.md,
    },
    themeColorDotActive: {
      width: 14,
      height: 14,
      borderRadius: 7,
    },
    themeName: {
      ...typography.body,
      color: colors.textSecondary,
      flex: 1,
    },
    themeNameActive: {
      color: colors.textPrimary,
      fontWeight: '600',
    },
    noThemesModal: {
      paddingVertical: spacing.xl,
      alignItems: 'center',
      gap: spacing.sm,
    },
    noThemesModalText: {
      ...typography.titleMd,
      color: colors.textSecondary,
    },
    noThemesModalHint: {
      ...typography.caption,
      color: colors.textMuted,
    },
    topicChip: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 20,
      borderWidth: 1.5,
      backgroundColor: colors.surface,
      marginRight: spacing.sm,
      marginBottom: spacing.sm,
      gap: spacing.xs,
    },
    topicDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    topicChipText: {
      ...typography.caption,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    topicKeywordCount: {
      ...typography.small,
      color: colors.textMuted,
      fontSize: 10,
    },
    swipeHintContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      marginBottom: spacing.sm,
    },
    swipeHint: {
      ...typography.small,
      color: colors.textMuted,
    },
  });
