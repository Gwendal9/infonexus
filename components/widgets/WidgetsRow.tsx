import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { WeatherWidget } from './WeatherWidget';
import { QuoteWidget } from './QuoteWidget';
import { FinanceWidget } from './FinanceWidget';
import { FootballWidget } from './FootballWidget';
import { StockWidget } from './StockWidget';
import { NewsWidget } from './NewsWidget';
import { WordWidget } from './WordWidget';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

type DetailType = 'weather' | 'crypto' | 'quote' | 'football' | 'stock' | 'news' | 'word' | null;

export function WidgetsRow() {
  const colors = useColors();
  const { config, isLoading } = useWidgetConfig();
  const [detailModal, setDetailModal] = useState<DetailType>(null);

  if (isLoading) {
    return null;
  }

  const hasEnabledWidgets =
    config.enabled.weather || config.enabled.crypto || config.enabled.quote ||
    config.enabled.football || config.enabled.stock || config.enabled.news || config.enabled.word;

  if (!hasEnabledWidgets) {
    return null;
  }

  const styles = createStyles(colors);

  const handleWidgetPress = (type: DetailType) => {
    Haptics.selectionAsync();
    setDetailModal(type);
  };

  const getModalTitle = (type: DetailType): string => {
    switch (type) {
      case 'weather': return 'Météo';
      case 'crypto': return 'Crypto';
      case 'quote': return 'Citation du jour';
      case 'football': return 'Football';
      case 'stock': return 'Bourse';
      case 'news': return 'Actu';
      case 'word': return 'Mot du jour';
      default: return '';
    }
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
        {config.enabled.football && (
          <TouchableOpacity
            style={styles.widget}
            onPress={() => handleWidgetPress('football')}
            activeOpacity={0.8}
          >
            <FootballWidget compact />
          </TouchableOpacity>
        )}
        {config.enabled.stock && (
          <TouchableOpacity
            style={styles.widget}
            onPress={() => handleWidgetPress('stock')}
            activeOpacity={0.8}
          >
            <StockWidget compact />
          </TouchableOpacity>
        )}
        {config.enabled.news && (
          <TouchableOpacity
            style={styles.widget}
            onPress={() => handleWidgetPress('news')}
            activeOpacity={0.8}
          >
            <NewsWidget compact />
          </TouchableOpacity>
        )}
        {config.enabled.word && (
          <TouchableOpacity
            style={styles.widget}
            onPress={() => handleWidgetPress('word')}
            activeOpacity={0.8}
          >
            <WordWidget compact />
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
              {getModalTitle(detailModal)}
            </Text>
            <TouchableOpacity onPress={() => setDetailModal(null)} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {detailModal === 'weather' && <WeatherWidget expanded />}
            {detailModal === 'crypto' && <FinanceWidget expanded />}
            {detailModal === 'quote' && <QuoteWidget expanded />}
            {detailModal === 'football' && <FootballWidget expanded />}
            {detailModal === 'stock' && <StockWidget expanded />}
            {detailModal === 'news' && <NewsWidget expanded />}
            {detailModal === 'word' && <WordWidget expanded />}
          </ScrollView>
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
