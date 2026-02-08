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
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const { width } = Dimensions.get('window');
const GRID_PADDING = spacing.md;
const GRID_GAP = spacing.sm;
const WIDGET_SIZE = (width - GRID_PADDING * 2 - GRID_GAP) / 2;

type DetailType = 'weather' | 'crypto' | 'quote' | 'football' | null;

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

  const hasAnyWidget = config.enabled.weather || config.enabled.crypto || config.enabled.quote;

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
            {/* Football widget - Coming soon placeholder */}
            <TouchableOpacity
              style={[styles.widgetTile, styles.comingSoon]}
              activeOpacity={1}
            >
              <View style={styles.comingSoonContent}>
                <Ionicons name="football" size={32} color={colors.textMuted} />
                <Text style={styles.comingSoonText}>Football</Text>
                <Text style={styles.comingSoonBadge}>Bientôt</Text>
              </View>
            </TouchableOpacity>
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
              {detailModal === 'weather' && 'Météo'}
              {detailModal === 'crypto' && 'Crypto'}
              {detailModal === 'quote' && 'Citation du jour'}
              {detailModal === 'football' && 'Football'}
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
    comingSoon: {
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    comingSoonContent: {
      alignItems: 'center',
      gap: spacing.xs,
    },
    comingSoonText: {
      ...typography.body,
      color: colors.textMuted,
      fontWeight: '600',
    },
    comingSoonBadge: {
      ...typography.small,
      color: colors.primary,
      backgroundColor: colors.primary + '20',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 8,
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
