import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetContainer } from './WidgetContainer';
import { useColors } from '@/contexts/ThemeContext';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

interface FinanceWidgetProps {
  compact?: boolean;
  expanded?: boolean;
}

export function FinanceWidget({ compact, expanded }: FinanceWidgetProps) {
  const colors = useColors();
  const { config } = useWidgetConfig();
  const { currencies } = config.settings.crypto;

  const [prices, setPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchCryptoData = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const ids = currencies.map((c) => c.id).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_24hr_change=true`
      );

      if (!response.ok) throw new Error('Failed to fetch crypto data');

      const data = await response.json();

      const priceData: CryptoPrice[] = currencies.map((currency) => ({
        id: currency.id,
        symbol: currency.symbol,
        name: currency.name,
        price: data[currency.id]?.eur ?? 0,
        change24h: data[currency.id]?.eur_24h_change ?? 0,
      }));

      setPrices(priceData);
    } catch (err) {
      console.error('[FinanceWidget] Error:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [currencies]);

  useEffect(() => {
    fetchCryptoData();
    const interval = setInterval(fetchCryptoData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  const styles = createStyles(colors, compact, expanded);

  const formatPrice = (price: number, full = false) => {
    if (full) {
      return price.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    if (price >= 1000) {
      return `${(price / 1000).toFixed(1)}k`;
    }
    if (price >= 1) {
      return price.toFixed(0);
    }
    return price.toFixed(3);
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  if (loading && prices.length === 0) {
    return (
      <WidgetContainer title="Crypto" icon="logo-bitcoin" iconColor="#F7931A" compact={compact} expanded={expanded}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      </WidgetContainer>
    );
  }

  if (error || prices.length === 0) {
    return (
      <WidgetContainer title="Crypto" icon="logo-bitcoin" iconColor="#F7931A" compact={compact} expanded={expanded}>
        <Text style={styles.errorText}>Indisponible</Text>
      </WidgetContainer>
    );
  }

  // Compact mode - show first crypto only
  if (compact) {
    const mainCrypto = prices[0];
    return (
      <WidgetContainer title="Crypto" icon="logo-bitcoin" iconColor="#F7931A" compact>
        <View style={styles.compactContent}>
          <Text style={styles.compactSymbol}>{mainCrypto.symbol}</Text>
          <Text style={styles.compactPrice}>{formatPrice(mainCrypto.price)} €</Text>
          <View style={[styles.compactBadge, mainCrypto.change24h >= 0 ? styles.positive : styles.negative]}>
            <Ionicons
              name={mainCrypto.change24h >= 0 ? 'arrow-up' : 'arrow-down'}
              size={10}
              color={mainCrypto.change24h >= 0 ? '#10B981' : '#EF4444'}
            />
            <Text style={[styles.compactChange, mainCrypto.change24h >= 0 ? styles.positiveText : styles.negativeText]}>
              {formatChange(mainCrypto.change24h)}
            </Text>
          </View>
          {prices.length > 1 && (
            <Text style={styles.moreText}>+{prices.length - 1}</Text>
          )}
        </View>
      </WidgetContainer>
    );
  }

  // Normal or expanded mode
  return (
    <WidgetContainer title="Crypto" icon="logo-bitcoin" iconColor="#F7931A" expanded={expanded}>
      <View style={styles.content}>
        {prices.map((crypto, index) => (
          <View key={crypto.id}>
            {index > 0 && <View style={styles.divider} />}
            <View style={styles.cryptoRow}>
              <View style={styles.cryptoInfo}>
                <Text style={styles.cryptoSymbol}>{crypto.symbol}</Text>
                {expanded && <Text style={styles.cryptoName}>{crypto.name}</Text>}
              </View>
              <View style={styles.priceSection}>
                <Text style={styles.cryptoPrice}>{formatPrice(crypto.price, expanded)} €</Text>
                <View
                  style={[
                    styles.changeBadge,
                    crypto.change24h >= 0 ? styles.positive : styles.negative,
                  ]}
                >
                  <Ionicons
                    name={crypto.change24h >= 0 ? 'arrow-up' : 'arrow-down'}
                    size={expanded ? 14 : 12}
                    color={crypto.change24h >= 0 ? '#10B981' : '#EF4444'}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      crypto.change24h >= 0 ? styles.positiveText : styles.negativeText,
                    ]}
                  >
                    {formatChange(crypto.change24h)}
                  </Text>
                </View>
              </View>
            </View>
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
    moreText: {
      ...typography.small,
      color: colors.textMuted,
    },
    content: {
      gap: expanded ? spacing.sm : spacing.xs,
    },
    cryptoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: expanded ? spacing.sm : spacing.xs,
    },
    cryptoInfo: {
      flexDirection: expanded ? 'column' : 'row',
      alignItems: expanded ? 'flex-start' : 'center',
      gap: expanded ? 2 : spacing.sm,
    },
    cryptoSymbol: {
      ...(expanded ? typography.titleMd : typography.caption),
      color: expanded ? colors.textPrimary : colors.textMuted,
      fontWeight: '600',
      width: expanded ? undefined : 40,
    },
    cryptoName: {
      ...typography.caption,
      color: colors.textMuted,
    },
    priceSection: {
      alignItems: 'flex-end',
      gap: spacing.xs,
    },
    cryptoPrice: {
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
    divider: {
      height: 1,
      backgroundColor: colors.border,
    },
    errorText: {
      ...typography.caption,
      color: colors.textMuted,
    },
  });
