import { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';
import { Topic, TOPIC_COLORS } from '@/lib/topics/types';
import { getSuggestedKeywords } from '@/lib/topics/suggestions';

interface AddTopicModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, keywords: string[], color: string) => void;
  onUpdate?: (id: string, updates: { name: string; keywords: string[]; color: string }) => void;
  onDelete?: (id: string) => void;
  topic?: Topic; // edit mode
}

export function AddTopicModal({ visible, onClose, onAdd, onUpdate, onDelete, topic }: AddTopicModalProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const isEditing = !!topic;

  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(TOPIC_COLORS[0]);
  const [validationError, setValidationError] = useState('');

  // Pre-fill in edit mode
  useEffect(() => {
    if (topic) {
      setName(topic.name);
      setKeywords([...topic.keywords]);
      setSelectedColor(topic.color);
    } else {
      resetForm();
    }
  }, [topic, visible]);

  const resetForm = () => {
    setName('');
    setKeywords([]);
    setKeywordInput('');
    setSelectedColor(TOPIC_COLORS[0]);
    setValidationError('');
  };

  const handleAddKeyword = () => {
    const kw = keywordInput.trim();
    if (!kw) return;
    if (keywords.some((k) => k.toLowerCase() === kw.toLowerCase())) {
      setValidationError('Ce mot-clé existe déjà');
      return;
    }
    setKeywords((prev) => [...prev, kw]);
    setKeywordInput('');
    setValidationError('');
  };

  const handleRemoveKeyword = (index: number) => {
    setKeywords((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSuggestion = (kw: string) => {
    if (keywords.some((k) => k.toLowerCase() === kw.toLowerCase())) return;
    setKeywords((prev) => [...prev, kw]);
  };

  const handleSubmit = () => {
    setValidationError('');
    if (!name.trim()) {
      setValidationError('Nom requis');
      return;
    }
    if (keywords.length === 0) {
      setValidationError('Ajoutez au moins un mot-clé');
      return;
    }

    if (isEditing && topic && onUpdate) {
      onUpdate(topic.id, { name: name.trim(), keywords, color: selectedColor });
    } else {
      onAdd(name.trim(), keywords, selectedColor);
    }
    handleClose();
  };

  const handleDelete = () => {
    if (topic && onDelete) {
      onDelete(topic.id);
      handleClose();
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Suggestions based on name or current keyword input
  const searchText = keywordInput.trim() || name.trim();
  const suggestions = getSuggestedKeywords(searchText);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {isEditing ? 'Modifier le sujet' : 'Nouveau sujet'}
                </Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {validationError ? (
                  <View style={styles.errorBanner}>
                    <Text style={styles.errorText}>{validationError}</Text>
                  </View>
                ) : null}

                <Input
                  label="Nom du sujet"
                  placeholder="Ex: Téléphone, Automobile, IA..."
                  value={name}
                  onChangeText={setName}
                />

                {/* Keyword input */}
                <Text style={styles.label}>Mots-clés</Text>
                <View style={styles.keywordInputRow}>
                  <TextInput
                    style={styles.keywordInput}
                    placeholder="Ajouter un mot-clé..."
                    placeholderTextColor={colors.textMuted}
                    value={keywordInput}
                    onChangeText={setKeywordInput}
                    onSubmitEditing={handleAddKeyword}
                    returnKeyType="done"
                  />
                  <TouchableOpacity style={styles.addKeywordButton} onPress={handleAddKeyword}>
                    <Ionicons name="add" size={22} color={colors.surface} />
                  </TouchableOpacity>
                </View>

                {/* Keywords chips */}
                {keywords.length > 0 && (
                  <View style={styles.chipsContainer}>
                    {keywords.map((kw, index) => (
                      <View key={`${kw}-${index}`} style={styles.chip}>
                        <Text style={styles.chipText}>{kw}</Text>
                        <TouchableOpacity onPress={() => handleRemoveKeyword(index)}>
                          <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Suggestions */}
                {suggestions.length > 0 && (
                  <View style={styles.suggestionsSection}>
                    <Text style={styles.suggestionsTitle}>Suggestions</Text>
                    {suggestions.slice(0, 3).map((group) => (
                      <View key={group.category} style={styles.suggestionGroup}>
                        <Text style={styles.suggestionCategory}>{group.category}</Text>
                        <View style={styles.suggestionChips}>
                          {group.keywords
                            .filter((kw) => !keywords.some((k) => k.toLowerCase() === kw.toLowerCase()))
                            .slice(0, 6)
                            .map((kw) => (
                              <TouchableOpacity
                                key={kw}
                                style={styles.suggestionChip}
                                onPress={() => handleAddSuggestion(kw)}
                              >
                                <Text style={styles.suggestionChipText}>{kw}</Text>
                                <Ionicons name="add" size={14} color={colors.primary} />
                              </TouchableOpacity>
                            ))}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Color picker */}
                <Text style={styles.label}>Couleur</Text>
                <View style={styles.colorGrid}>
                  {TOPIC_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorButton,
                        { backgroundColor: color },
                        selectedColor === color && styles.colorButtonSelected,
                      ]}
                      onPress={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>

                <Button
                  title={isEditing ? 'Enregistrer' : 'Créer'}
                  onPress={handleSubmit}
                  style={styles.submitButton}
                />

                {isEditing && onDelete && (
                  <Button
                    title="Supprimer le sujet"
                    variant="ghost"
                    onPress={handleDelete}
                    style={styles.deleteButton}
                  />
                )}
              </ScrollView>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      padding: spacing.lg,
    },
    modal: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: spacing.lg,
      maxHeight: '85%',
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
    },
    scrollContent: {
      flexGrow: 0,
    },
    errorBanner: {
      backgroundColor: colors.statusError + '15',
      borderRadius: 8,
      padding: spacing.sm,
      marginBottom: spacing.md,
    },
    errorText: {
      ...typography.body,
      color: colors.statusError,
      textAlign: 'center',
    },
    label: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '500',
      marginBottom: spacing.xs,
    },
    keywordInputRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    keywordInput: {
      flex: 1,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      ...typography.body,
      color: colors.textPrimary,
    },
    addKeywordButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      width: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chipsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary + '15',
      borderRadius: 16,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      gap: spacing.xs,
    },
    chipText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    suggestionsSection: {
      marginBottom: spacing.md,
    },
    suggestionsTitle: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '600',
      textTransform: 'uppercase',
      marginBottom: spacing.sm,
    },
    suggestionGroup: {
      marginBottom: spacing.sm,
    },
    suggestionCategory: {
      ...typography.caption,
      color: colors.textSecondary,
      fontWeight: '600',
      marginBottom: spacing.xs,
    },
    suggestionChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
    },
    suggestionChip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background,
      borderRadius: 16,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      gap: spacing.xxs,
      borderWidth: 1,
      borderColor: colors.border,
    },
    suggestionChipText: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    colorGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    colorButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    colorButtonSelected: {
      borderWidth: 3,
      borderColor: colors.textPrimary,
    },
    submitButton: {
      marginTop: spacing.sm,
    },
    deleteButton: {
      marginTop: spacing.sm,
    },
  });
