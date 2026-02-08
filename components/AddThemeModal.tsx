import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
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
import { COLOR_PALETTE } from '@/theme/palette';

interface AddThemeModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (name: string, color: string) => void;
  loading?: boolean;
  error?: string;
}

export function AddThemeModal({ visible, onClose, onAdd, loading, error }: AddThemeModalProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLOR_PALETTE[0]);
  const [validationError, setValidationError] = useState('');

  const handleAdd = () => {
    setValidationError('');

    if (!name.trim()) {
      setValidationError('Nom requis');
      return;
    }

    onAdd(name.trim(), selectedColor);
  };

  const handleClose = () => {
    setName('');
    setSelectedColor(COLOR_PALETTE[0]);
    setValidationError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modal}>
              <View style={styles.header}>
                <Text style={styles.title}>Nouveau thème</Text>
                <TouchableOpacity onPress={handleClose}>
                  <Ionicons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {(error || validationError) && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>{error || validationError}</Text>
                </View>
              )}

              <Input
                label="Nom du thème"
                placeholder="Ex: Tech, Sport, Finance..."
                value={name}
                onChangeText={setName}
              />

              <Text style={styles.colorLabel}>Couleur</Text>
              <View style={styles.colorGrid}>
                {COLOR_PALETTE.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorButtonSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}>
                    {selectedColor === color && (
                      <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <Button title="Créer" onPress={handleAdd} loading={loading} style={styles.button} />
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
    colorLabel: {
      ...typography.body,
      color: colors.textPrimary,
      fontWeight: '500',
      marginBottom: spacing.sm,
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
    button: {
      marginTop: spacing.sm,
    },
  });
