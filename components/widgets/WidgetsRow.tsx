import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { WeatherWidget } from './WeatherWidget';
import { QuoteWidget } from './QuoteWidget';
import { FinanceWidget } from './FinanceWidget';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type DetailType = 'weather' | 'crypto' | 'quote' | null;

export function WidgetsRow() {
  const colors = useColors();
  const { config, isLoading } = useWidgetConfig();
  const [detailModal, setDetailModal] = useState<DetailType>(null);

  if (isLoading) {
    return null;
  }

  const hasEnabledWidgets =
    config.enabled.weather || config.enabled.crypto || config.enabled.quote;

  if (!hasEnabledWidgets) {
    return null;
  }

  const styles = createStyles(colors);

  const handleWidgetPress = (type: DetailType) => {
    Haptics.selectionAsync();
    setDetailModal(type);
  };

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {config.enabled.weather && (
          <TouchableOpacity
            style={styles.widget}
            onPress={() => handleWidgetPress('weather')}
            activeOpacity={0.8}
          >
            <WeatherWidget compact />
          </TouchableOpacity>
        )}
        {config.enabled.crypto && (
          <TouchableOpacity
            style={styles.widget}
            onPress={() => handleWidgetPress('crypto')}
            activeOpacity={0.8}
          >
            <FinanceWidget compact />
          </TouchableOpacity>
        )}
        {config.enabled.quote && (
          <TouchableOpacity
            style={styles.widget}
            onPress={() => handleWidgetPress('quote')}
            activeOpacity={0.8}
          >
            <QuoteWidget compact />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal
        visible={detailModal !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailModal(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {detailModal === 'weather' && 'Météo'}
              {detailModal === 'crypto' && 'Crypto'}
              {detailModal === 'quote' && 'Citation du jour'}
            </Text>
            <TouchableOpacity onPress={() => setDetailModal(null)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {detailModal === 'weather' && <WeatherWidget expanded />}
            {detailModal === 'crypto' && <FinanceWidget expanded />}
            {detailModal === 'quote' && <QuoteWidget expanded />}
          </View>
        </View>
      </Modal>
    </>
  );
}

const WIDGET_SIZE = 140;

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
      alignItems: 'flex-start',
    },
    widget: {
      width: WIDGET_SIZE,
      height: WIDGET_SIZE,
    },
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    modalTitle: {
      ...typography.titleLg,
      color: colors.textPrimary,
    },
    closeButton: {
      padding: spacing.xs,
    },
    modalContent: {
      flex: 1,
      padding: spacing.md,
    },
  });
