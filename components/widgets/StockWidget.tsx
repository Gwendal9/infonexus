import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetContainer } from './WidgetContainer';
import { useColors } from '@/contexts/ThemeContext';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface StockQuote {
  symbol: string;
  name: string;
  current: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
}

interface StockWidgetProps {
  compact?: boolean;
  expanded?: boolean;
}

export function StockWidget({ compact, expanded }: StockWidgetProps) {
  const colors = useColors();
  const { config } = useWidgetConfig();
  const { items, apiKey } = config.settings.stock;

  const [quotes, setQuotes] = useState<StockQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStocks = useCallback(async () => {
    if (!apiKey) return;
    try {
      setLoading(true);
      setError(false);

      const results: StockQuote[] = [];

      for (const item of items) {
        const response = await fetch(
          `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(item.symbol)}&token=${encodeURIComponent(apiKey)}`
        );
        if (!response.ok) continue;
        const data = await response.json();
        if (data.c && data.c > 0) {
          results.push({
            symbol: item.symbol,
            name: item.name,
            current: data.c,
            change: data.d ?? 0,
            changePercent: data.dp ?? 0,
            high: data.h ?? 0,
            low: data.l ?? 0,
            open: data.o ?? 0,
            prevClose: data.pc ?? 0,
          });
        }
      }

      setQuotes(results);
    } catch (err) {
      console.error('[StockWidget] Error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [apiKey, items]);

  useEffect(() => {
    if (apiKey) {
      fetchStocks();
      const interval = setInterval(fetchStocks, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [fetchStocks, apiKey]);

  const styles = createStyles(colors, compact, expanded);

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  if (!apiKey) {
    return (
      <WidgetContainer title="Bourse" icon="trending-up" compact={compact} expanded={expanded}>
        <Text style={styles.errorText}>Clé API requise (Réglages)</Text>
      </WidgetContainer>
    );
  }

  if (loading && quotes.length === 0) {
    return (
      <WidgetContainer title="Bourse" icon="trending-up" compact={compact} expanded={expanded}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </WidgetContainer>
    );
  }

  if (error || quotes.length === 0) {
    return (
      <WidgetContainer title="Bourse" icon="trending-up" compact={compact} expanded={expanded}>
        <Text style={styles.errorText}>
          Aucune donnée. Vérifiez vos actions dans les réglages (symboles US uniquement avec Finnhub gratuit).
        </Text>
      </WidgetContainer>
    );
  }

  if (compact) {
    const main = quotes[0];
    return (
      <WidgetContainer title="Bourse" icon="trending-up" compact>
        <View style={styles.compactContent}>
          <Text style={styles.compactSymbol}>{main.name}</Text>
          <Text style={styles.compactPrice}>{formatPrice(main.current)} $</Text>
          <View style={[styles.compactBadge, main.changePercent >= 0 ? styles.positive : styles.negative]}>
            <Ionicons
              name={main.changePercent >= 0 ? 'arrow-up' : 'arrow-down'}
              size={10}
              color={main.changePercent >= 0 ? '#10B981' : '#EF4444'}
            />
            <Text style={[styles.compactChange, main.changePercent >= 0 ? styles.positiveText : styles.negativeText]}>
              {formatChange(main.changePercent)}
            </Text>
          </View>
        </View>
      </WidgetContainer>
    );
  }

  const displayQuotes = expanded ? quotes : quotes.slice(0, 3);

  return (
    <WidgetContainer title="Bourse" icon="trending-up" expanded={expanded}>
      <View style={styles.content}>
        {displayQuotes.map((stock, index) => (
          <View key={stock.symbol}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.stockRow}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockName}>{stock.name}</Text>
                {expanded && <Text style={styles.stockSymbol}>{stock.symbol}</Text>}
              </View>
              <View style={styles.priceSection}>
                <Text style={styles.stockPrice}>{formatPrice(stock.current)} $</Text>
                <View style={[styles.changeBadge, stock.changePercent >= 0 ? styles.positive : styles.negative]}>
                  <Ionicons
                    name={stock.changePercent >= 0 ? 'arrow-up' : 'arrow-down'}
                    size={expanded ? 14 : 12}
                    color={stock.changePercent >= 0 ? '#10B981' : '#EF4444'}
                  />
                  <Text style={[styles.changeText, stock.changePercent >= 0 ? styles.positiveText : styles.negativeText]}>
                    {formatChange(stock.changePercent)}
                  </Text>
                </View>
              </View>
            </View>
            {expanded && (
              <View style={styles.detailRow}>
                <Text style={styles.detailText}>Ouv. {formatPrice(stock.open)}</Text>
                <Text style={styles.detailText}>Haut {formatPrice(stock.high)}</Text>
                <Text style={styles.detailText}>Bas {formatPrice(stock.low)}</Text>
                <Text style={styles.detailText}>Clôt. {formatPrice(stock.prevClose)}</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </WidgetContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>, compact?: boolean, expanded?: boolean) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    compactContent: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    compactSymbol: {
      ...typography.caption,
      color: colors.textMuted,
      fontWeight: '600',
    },
    compactPrice: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.textPrimary,
    },
    compactBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: 6,
    },
    compactChange: {
      fontSize: 11,
      fontWeight: '600',
    },
    content: {
      gap: expanded ? spacing.sm : spacing.xs,
    },
    stockRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: expanded ? spacing.sm : spacing.xs,
    },
    stockInfo: {
      flexDirection: expanded ? 'column' : 'row',
      alignItems: expanded ? 'flex-start' : 'center',
      gap: expanded ? 2 : spacing.sm,
      flex: 1,
    },
    stockName: {
      ...(expanded ? typography.titleMd : typography.body),
      color: colors.textPrimary,
      fontWeight: '600',
    },
    stockSymbol: {
      ...typography.caption,
      color: colors.textMuted,
    },
    priceSection: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    stockPrice: {
      ...(expanded ? typography.titleLg : typography.titleMd),
      color: colors.textPrimary,
      fontWeight: '700',
    },
    changeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: spacing.sm,
      paddingVertical: expanded ? 4 : 2,
      borderRadius: 8,
    },
    positive: {
      backgroundColor: '#10B98115',
    },
    negative: {
      backgroundColor: '#EF444415',
    },
    changeText: {
      fontSize: expanded ? 14 : 12,
      fontWeight: '600',
    },
    positiveText: {
      color: '#10B981',
    },
    negativeText: {
      color: '#EF4444',
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingBottom: spacing.xs,
    },
    detailText: {
      ...typography.caption,
      color: colors.textMuted,
      fontSize: 11,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    errorText: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
