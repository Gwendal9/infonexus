import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { SourceType } from '@/types/database';
import { detectSourceType } from '@/lib/services/sourceDetector';
import { sourceCatalog, categories, searchCatalog, CatalogSource } from '@/lib/data/sourceCatalog';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface AddSourceModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (url: string, name: string, type: SourceType) => void;
  loading?: boolean;
  error?: string;
  existingSourceUrls?: string[];
}

type TabType = 'catalog' | 'manual';

const sourceTypes: { type: SourceType; label: string; icon: string }[] = [
  { type: 'rss', label: 'RSS', icon: 'logo-rss' },
  { type: 'html', label: 'Web', icon: 'globe-outline' },
  { type: 'youtube', label: 'YouTube', icon: 'logo-youtube' },
];

const typeIcons: Record<SourceType, string> = {
  rss: 'logo-rss',
  html: 'globe-outline',
  youtube: 'logo-youtube',
};

export function AddSourceModal({ visible, onClose, onAdd, loading, error, existingSourceUrls = [] }: AddSourceModalProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  // Create a Set for faster lookup
  const existingUrls = new Set(existingSourceUrls);

  const [activeTab, setActiveTab] = useState<TabType>('catalog');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Manual mode state
  const [url, setUrl] = useState('');
  const [detectedUrl, setDetectedUrl] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<SourceType>('rss');
  const [validationError, setValidationError] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [autoDetected, setAutoDetected] = useState(false);

  // Auto-detect source type when URL changes
  useEffect(() => {
    if (!url.trim() || url.length < 10) {
      setAutoDetected(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsDetecting(true);
      try {
        const result = await detectSourceType(url);
        setType(result.type);
        setDetectedUrl(result.url);
        setAutoDetected(true);
      } catch {
        setAutoDetected(false);
      } finally {
        setIsDetecting(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [url]);

  const handleAddFromCatalog = (source: CatalogSource) => {
    onAdd(source.url, source.name, source.type);
  };

  const handleAddManual = () => {
    setValidationError('');

    if (!url.trim()) {
      setValidationError('URL requise');
      return;
    }

    if (!name.trim()) {
      setValidationError('Nom requis');
      return;
    }

    const finalUrl = detectedUrl || url.trim();

    try {
      new URL(finalUrl);
    } catch {
      setValidationError('URL invalide');
      return;
    }

    onAdd(finalUrl, name.trim(), type);
  };

  const handleClose = () => {
    setActiveTab('catalog');
    setSearchQuery('');
    setSelectedCategory(null);
    setUrl('');
    setDetectedUrl('');
    setName('');
    setType('rss');
    setValidationError('');
    setAutoDetected(false);
    onClose();
  };

  // Filter catalog sources
  const filteredSources = searchQuery
    ? searchCatalog(searchQuery)
    : selectedCategory
      ? sourceCatalog.filter(s => s.category === selectedCategory)
      : [];

  const showResults = searchQuery || selectedCategory;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Ajouter une source</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'catalog' && styles.tabActive]}
              onPress={() => setActiveTab('catalog')}
            >
              <Ionicons
                name="library"
                size={18}
                color={activeTab === 'catalog' ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'catalog' && styles.tabTextActive]}>
                Catalogue
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'manual' && styles.tabActive]}
              onPress={() => setActiveTab('manual')}
            >
              <Ionicons
                name="link"
                size={18}
                color={activeTab === 'manual' ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.tabText, activeTab === 'manual' && styles.tabTextActive]}>
                URL manuelle
              </Text>
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Catalog Tab */}
          {activeTab === 'catalog' && (
            <View style={styles.catalogContainer}>
              {/* Search */}
              <View style={styles.searchBar}>
                <Ionicons name="search" size={18} color={colors.textMuted} />
                <TextInput
                  placeholder="Rechercher une source..."
                  placeholderTextColor={colors.textMuted}
                  value={searchQuery}
                  onChangeText={(text) => {
                    setSearchQuery(text);
                    if (text) setSelectedCategory(null);
                  }}
                  style={styles.searchInput}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Categories or Back button */}
              {!searchQuery && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                  <View style={styles.categoriesRow}>
                    {selectedCategory && (
                      <TouchableOpacity
                        style={styles.backChip}
                        onPress={() => setSelectedCategory(null)}
                      >
                        <Ionicons name="arrow-back" size={16} color={colors.primary} />
                        <Text style={styles.backChipText}>Retour</Text>
                      </TouchableOpacity>
                    )}
                    {!selectedCategory && categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={styles.categoryChip}
                        onPress={() => setSelectedCategory(cat)}
                      >
                        <Text style={styles.categoryText}>{cat}</Text>
                      </TouchableOpacity>
                    ))}
                    {selectedCategory && (
                      <View style={styles.categoryChipActive}>
                        <Text style={styles.categoryTextActive}>{selectedCategory}</Text>
                      </View>
                    )}
                  </View>
                </ScrollView>
              )}

              {/* Results */}
              <ScrollView style={styles.resultsList} showsVerticalScrollIndicator={false}>
                {showResults ? (
                  filteredSources.length > 0 ? (
                    filteredSources.map((source) => {
                      const isAdded = existingUrls.has(source.url);
                      return (
                        <TouchableOpacity
                          key={source.id}
                          style={[styles.sourceItem, isAdded && styles.sourceItemAdded]}
                          onPress={() => !isAdded && handleAddFromCatalog(source)}
                          disabled={loading || isAdded}
                          activeOpacity={isAdded ? 1 : 0.7}
                        >
                          <View style={styles.sourceIconContainer}>
                            <Ionicons
                              name={typeIcons[source.type] as any}
                              size={20}
                              color={isAdded ? colors.textMuted : colors.textSecondary}
                            />
                          </View>
                          <View style={styles.sourceInfo}>
                            <Text style={[styles.sourceName, isAdded && styles.sourceNameAdded]}>
                              {source.name}
                            </Text>
                            <Text style={styles.sourceCategory}>{source.category}</Text>
                          </View>
                          {isAdded ? (
                            <View style={styles.addedBadge}>
                              <Ionicons name="checkmark-circle" size={18} color={colors.statusOk} />
                              <Text style={styles.addedText}>Ajouté</Text>
                            </View>
                          ) : (
                            <Ionicons name="add-circle" size={24} color={colors.primary} />
                          )}
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    <View style={styles.noResults}>
                      <Ionicons name="search-outline" size={40} color={colors.textMuted} />
                      <Text style={styles.noResultsText}>Aucune source trouvée</Text>
                      <TouchableOpacity onPress={() => setActiveTab('manual')}>
                        <Text style={styles.noResultsLink}>Ajouter manuellement →</Text>
                      </TouchableOpacity>
                    </View>
                  )
                ) : (
                  <View style={styles.catalogHint}>
                    <Ionicons name="bulb-outline" size={24} color={colors.primary} />
                    <Text style={styles.catalogHintText}>
                      Recherchez une source ou sélectionnez une catégorie
                    </Text>
                  </View>
                )}
              </ScrollView>

              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color={colors.primary} />
                </View>
              )}
            </View>
          )}

          {/* Manual Tab */}
          {activeTab === 'manual' && (
            <ScrollView style={styles.manualContainer} showsVerticalScrollIndicator={false}>
              {validationError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{validationError}</Text>
                </View>
              )}

              <Input
                label="URL"
                placeholder="https://example.com/rss"
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                keyboardType="url"
              />

              <Input
                label="Nom"
                placeholder="Mon site préféré"
                value={name}
                onChangeText={setName}
              />

              <View style={styles.typeLabelRow}>
                <Text style={styles.typeLabel}>Type de source</Text>
                {isDetecting && (
                  <View style={styles.detectingBadge}>
                    <ActivityIndicator size="small" color={colors.primary} />
                    <Text style={styles.detectingText}>Détection...</Text>
                  </View>
                )}
                {autoDetected && !isDetecting && (
                  <View style={styles.detectedBadge}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.statusOk} />
                    <Text style={styles.detectedText}>Auto-détecté</Text>
                  </View>
                )}
              </View>
              <View style={styles.typeContainer}>
                {sourceTypes.map((item) => (
                  <TouchableOpacity
                    key={item.type}
                    style={[styles.typeButton, type === item.type && styles.typeButtonActive]}
                    onPress={() => {
                      setType(item.type);
                      setAutoDetected(false);
                    }}
                  >
                    <Ionicons
                      name={item.icon as any}
                      size={20}
                      color={type === item.type ? '#FFFFFF' : colors.textSecondary}
                    />
                    <Text style={[styles.typeText, type === item.type && styles.typeTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Button
                title="Ajouter"
                onPress={handleAddManual}
                loading={loading}
                style={styles.addButton}
              />
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '85%',
      minHeight: '60%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.lg,
      paddingBottom: spacing.md,
    },
    title: {
      ...typography.titleLg,
      color: colors.textPrimary,
    },
    closeButton: {
      padding: spacing.xs,
    },
    tabs: {
      flexDirection: 'row',
      marginHorizontal: spacing.lg,
      backgroundColor: colors.background,
      borderRadius: 12,
      padding: 4,
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: 10,
    },
    tabActive: {
      backgroundColor: colors.surface,
    },
    tabText: {
      ...typography.body,
      color: colors.textMuted,
      fontWeight: '500',
    },
    tabTextActive: {
      color: colors.primary,
    },
    errorBanner: {
      backgroundColor: colors.statusError + '15',
      borderRadius: 8,
      padding: spacing.sm,
      marginHorizontal: spacing.lg,
      marginTop: spacing.md,
    },
    errorText: {
      ...typography.body,
      color: colors.statusError,
      textAlign: 'center',
    },
    catalogContainer: {
      flex: 1,
      paddingTop: spacing.md,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      marginHorizontal: spacing.lg,
      borderRadius: 10,
      paddingHorizontal: spacing.md,
      gap: spacing.sm,
    },
    searchInput: {
      flex: 1,
      ...typography.body,
      color: colors.textPrimary,
      paddingVertical: spacing.sm,
    },
    categoriesScroll: {
      marginTop: spacing.md,
      maxHeight: 44,
    },
    categoriesRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.lg,
      gap: spacing.sm,
    },
    backChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.primary + '15',
      marginRight: spacing.sm,
    },
    backChipText: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '600',
    },
    categoryChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    categoryChipActive: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: 20,
      backgroundColor: colors.primary,
    },
    categoryText: {
      ...typography.body,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    categoryTextActive: {
      ...typography.body,
      color: '#FFFFFF',
      fontWeight: '500',
    },
    resultsList: {
      flex: 1,
      marginTop: spacing.md,
      paddingHorizontal: spacing.lg,
    },
    sourceItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: colors.background,
      borderRadius: 12,
      marginBottom: spacing.sm,
    },
    sourceIconContainer: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    sourceInfo: {
      flex: 1,
    },
    sourceName: {
      ...typography.titleMd,
      color: colors.textPrimary,
    },
    sourceCategory: {
      ...typography.caption,
      color: colors.textMuted,
      marginTop: 2,
    },
    sourceItemAdded: {
      opacity: 0.7,
    },
    sourceNameAdded: {
      color: colors.textMuted,
    },
    addedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.statusOk + '15',
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 12,
    },
    addedText: {
      ...typography.small,
      color: colors.statusOk,
      fontWeight: '600',
    },
    noResults: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.sm,
    },
    noResultsText: {
      ...typography.body,
      color: colors.textMuted,
    },
    noResultsLink: {
      ...typography.body,
      color: colors.primary,
      fontWeight: '600',
      marginTop: spacing.sm,
    },
    catalogHint: {
      alignItems: 'center',
      paddingVertical: spacing.xxl,
      gap: spacing.md,
    },
    catalogHintText: {
      ...typography.body,
      color: colors.textSecondary,
      textAlign: 'center',
    },
    loadingOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: colors.background + 'CC',
      justifyContent: 'center',
      alignItems: 'center',
    },
    manualContainer: {
      padding: spacing.lg,
    },
    typeLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    typeLabel: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '500',
    },
    detectingBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
    },
    detectingText: {
      ...typography.small,
      color: colors.primary,
    },
    detectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xxs,
      backgroundColor: colors.statusOk + '15',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 12,
    },
    detectedText: {
      ...typography.small,
      color: colors.statusOk,
      fontWeight: '500',
    },
    typeContainer: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    typeButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      paddingVertical: spacing.sm,
      borderRadius: 8,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
    },
    typeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    typeText: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    typeTextActive: {
      color: '#FFFFFF',
    },
    addButton: {
      marginTop: spacing.md,
    },
  });
