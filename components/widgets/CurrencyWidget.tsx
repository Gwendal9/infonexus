import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WidgetContainer } from './WidgetContainer';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface Rate {
  from: string;
  to: string;
  rate: number;
}

const FLAG_EMOJI: Record<string, string> = {
  EUR: '\u20AC', USD: '$', GBP: '\u00A3', CHF: 'Fr',
  JPY: '\u00A5', CAD: 'C$', AUD: 'A$', CNY: '\u00A5',
};

interface CurrencyWidgetProps {
  compact?: boolean;
  expanded?: boolean;
}

export function CurrencyWidget({ compact, expanded }: CurrencyWidgetProps) {
  const colors = useColors();
  const { config } = useWidgetConfig();
  const styles = createStyles(colors, compact, expanded);
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);

  const pairs = config.settings.currency.pairs;

  useEffect(() => {
    fetchRates();
  }, [pairs]);

  const fetchRates = async () => {
    try {
      // Group by base currency to minimize API calls
      const bases = [...new Set(pairs.map(p => p.from))];
      const allRates: Rate[] = [];

      for (const base of bases) {
        const targets = pairs.filter(p => p.from === base).map(p => p.to);
        const res = await fetch(
          `https://api.frankfurter.dev/v1/latest?base=${base}&symbols=${targets.join(',')}`
        );
        const data = await res.json();
        if (data.rates) {
          for (const [to, rate] of Object.entries(data.rates)) {
            allRates.push({ from: base, to, rate: rate as number });
          }
        }
      }

      setRates(allRates);
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  };

  if (compact) {
    const topRate = rates[0];
    return (
      <WidgetContainer title="Devises" icon="cash" iconColor="#27AE60" compact>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : topRate ? (
          <View style={styles.compactContent}>
            <Text style={styles.compactPair}>{topRate.from}/{topRate.to}</Text>
            <Text style={styles.compactRate}>{topRate.rate.toFixed(4)}</Text>
            {rates[1] && (
              <>
                <Text style={styles.compactPair}>{rates[1].from}/{rates[1].to}</Text>
                <Text style={styles.compactRate}>{rates[1].rate.toFixed(4)}</Text>
              </>
            )}
          </View>
        ) : (
          <Text style={styles.compactPair}>Indisponible</Text>
        )}
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer title="Taux de change" icon="cash" iconColor="#27AE60" expanded={expanded}>
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View style={styles.list}>
          {rates.map((rate) => (
            <View key={`${rate.from}-${rate.to}`} style={styles.rateItem}>
              <View style={styles.pairInfo}>
                <Text style={styles.currencySymbol}>{FLAG_EMOJI[rate.from] || rate.from}</Text>
                <Text style={styles.pairLabel}>{rate.from}</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.textMuted} />
                <Text style={styles.currencySymbol}>{FLAG_EMOJI[rate.to] || rate.to}</Text>
                <Text style={styles.pairLabel}>{rate.to}</Text>
              </View>
              <Text style={styles.rateValue}>{rate.rate.toFixed(4)}</Text>
            </View>
          ))}
          <Text style={styles.source}>Source : Banque Centrale Européenne</Text>
        </View>
      )}
    </WidgetContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>, compact?: boolean, expanded?: boolean) =>
  StyleSheet.create({
    compactContent: { flex: 1, justifyContent: 'center', gap: 2 },
    compactPair: { ...typography.small, color: colors.textMuted, fontSize: 10 },
    compactRate: { ...typography.caption, fontWeight: '700', color: colors.textPrimary },
    list: { gap: spacing.sm },
    rateItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      backgroundColor: colors.background,
      borderRadius: 12,
    },
    pairInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
    currencySymbol: { fontSize: expanded ? 18 : 16, fontWeight: '700', color: colors.textPrimary },
    pairLabel: { ...typography.caption, color: colors.textSecondary, fontWeight: '500' },
    rateValue: {
      fontSize: expanded ? 20 : 17,
      fontWeight: '700',
      color: '#27AE60',
    },
    source: { ...typography.small, color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs },
  });
