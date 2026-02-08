import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useColors } from '@/contexts/ThemeContext';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { WeatherWidget } from '@/components/widgets/WeatherWidget';
import { FinanceWidget } from '@/components/widgets/FinanceWidget';
import { QuoteWidget } from '@/components/widgets/QuoteWidget';
import { FootballWidget } from '@/components/widgets/FootballWidget';
import { StockWidget } from '@/components/widgets/StockWidget';
import { NewsWidget } from '@/components/widgets/NewsWidget';
import { WordWidget } from '@/components/widgets/WordWidget';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const { width } = Dimensions.get('window');
const GRID_PADDING = spacing.md;
const GRID_GAP = spacing.sm;
const WIDGET_SIZE = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

type DetailType = 'weather' | 'crypto' | 'quote' | 'football' | 'stock' | 'news' | 'word' | null;

export default function WidgetsScreen() {
  const colors = useColors();
  const { config, isLoading } = useWidgetConfig();
  const [detailModal, setDetailModal] = useState<DetailType>(null);

  const styles = createStyles(colors);

  const handleWidgetPress = (type: DetailType) => {
    Haptics.selectionAsync();
    setDetailModal(type);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Chargement...</Text>
      </View>
    );
  }

  const hasAnyWidget = config.enabled.weather || config.enabled.crypto || config.enabled.quote ||
    config.enabled.football || config.enabled.stock || config.enabled.news || config.enabled.word;

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
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {!hasAnyWidget ? (
          <View style={styles.emptyState}>
            <Ionicons name="grid-outline" size={64} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>Aucun widget activé</Text>
            <Text style={styles.emptyText}>
              Activez des widgets dans les réglages pour les voir ici.
            </Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {config.enabled.weather && (
              <TouchableOpacity
                style={styles.widgetTile}
                onPress={() => handleWidgetPress('weather')}
                activeOpacity={0.8}
              >
                <WeatherWidget compact />
              </TouchableOpacity>
            )}
            {config.enabled.crypto && (
              <TouchableOpacity
                style={styles.widgetTile}
                onPress={() => handleWidgetPress('crypto')}
                activeOpacity={0.8}
              >
                <FinanceWidget compact />
              </TouchableOpacity>
            )}
            {config.enabled.quote && (
              <TouchableOpacity
                style={styles.widgetTile}
                onPress={() => handleWidgetPress('quote')}
                activeOpacity={0.8}
              >
                <QuoteWidget compact />
              </TouchableOpacity>
            )}
            {config.enabled.football && (
              <TouchableOpacity
                style={styles.widgetTile}
                onPress={() => handleWidgetPress('football')}
                activeOpacity={0.8}
              >
                <FootballWidget compact />
              </TouchableOpacity>
            )}
            {config.enabled.stock && (
              <TouchableOpacity
                style={styles.widgetTile}
                onPress={() => handleWidgetPress('stock')}
                activeOpacity={0.8}
              >
                <StockWidget compact />
              </TouchableOpacity>
            )}
            {config.enabled.news && (
              <TouchableOpacity
                style={styles.widgetTile}
                onPress={() => handleWidgetPress('news')}
                activeOpacity={0.8}
              >
                <NewsWidget compact />
              </TouchableOpacity>
            )}
            {config.enabled.word && (
              <TouchableOpacity
                style={styles.widgetTile}
                onPress={() => handleWidgetPress('word')}
                activeOpacity={0.8}
              >
                <WordWidget compact />
              </TouchableOpacity>
            )}
          </View>
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

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: GRID_PADDING,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: GRID_GAP,
    },
    widgetTile: {
      width: WIDGET_SIZE,
      height: WIDGET_SIZE,
      borderRadius: 16,
      overflow: 'hidden',
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl * 2,
      gap: spacing.md,
    },
    emptyTitle: {
      ...typography.titleMd,
      color: colors.textPrimary,
    },
    emptyText: {
      ...typography.body,
      color: colors.textMuted,
      textAlign: 'center',
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
