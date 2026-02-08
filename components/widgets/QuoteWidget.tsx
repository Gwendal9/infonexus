import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { WidgetContainer } from './WidgetContainer';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const QUOTES = [
  { text: "La simplicité est la sophistication suprême.", author: "Léonard de Vinci" },
  { text: "Le savoir est la seule matière qui s'accroît quand on la partage.", author: "Socrate" },
  { text: "L'information, c'est le pouvoir.", author: "Francis Bacon" },
  { text: "Celui qui contrôle le passé contrôle le futur.", author: "George Orwell" },
  { text: "La connaissance s'acquiert par l'expérience, tout le reste n'est que de l'information.", author: "Albert Einstein" },
  { text: "Un peuple qui lit est un peuple qui gagne.", author: "Napoléon Bonaparte" },
  { text: "La lecture est une amitié.", author: "Marcel Proust" },
  { text: "Lire, c'est voyager.", author: "Victor Hugo" },
  { text: "Le temps que vous aimez perdre n'est pas du temps perdu.", author: "Bertrand Russell" },
  { text: "La curiosité est le moteur du savoir.", author: "Galilée" },
  { text: "Qui ne sait pas d'où il vient ne peut savoir où il va.", author: "Otto von Bismarck" },
  { text: "L'esprit, c'est comme un parachute : ça ne fonctionne que quand c'est ouvert.", author: "Frank Zappa" },
  { text: "La seule façon de faire du bon travail est d'aimer ce que vous faites.", author: "Steve Jobs" },
  { text: "Le meilleur moment pour planter un arbre était il y a 20 ans. Le deuxième meilleur moment, c'est maintenant.", author: "Proverbe chinois" },
];

interface QuoteWidgetProps {
  compact?: boolean;
  expanded?: boolean;
}

export function QuoteWidget({ compact, expanded }: QuoteWidgetProps) {
  const colors = useColors();
  const styles = createStyles(colors, compact, expanded);

  // Get a quote based on the day of the year (same quote all day)
  const quote = useMemo(() => {
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
    );
    return QUOTES[dayOfYear % QUOTES.length];
  }, []);

  // Compact mode - show truncated quote
  if (compact) {
    const truncatedQuote = quote.text.length > 50
      ? quote.text.substring(0, 47) + '...'
      : quote.text;

    return (
      <WidgetContainer title="Citation" icon="bulb" iconColor="#FFB800" compact>
        <View style={styles.compactContent}>
          <Text style={styles.compactQuote}>{"\u00AB"}{truncatedQuote}{"\u00BB"}</Text>
          <Text style={styles.compactAuthor}>— {quote.author}</Text>
        </View>
      </WidgetContainer>
    );
  }

  // Normal or expanded mode
  return (
    <WidgetContainer title="Citation du jour" icon="bulb" iconColor="#FFB800" expanded={expanded}>
      <View style={styles.content}>
        <Text style={styles.quote}>{"\u00AB"}{quote.text}{"\u00BB"}</Text>
        <Text style={styles.author}>— {quote.author}</Text>
      </View>
    </WidgetContainer>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>, compact?: boolean, expanded?: boolean) =>
  StyleSheet.create({
    compactContent: {
      flex: 1,
      justifyContent: 'center',
      gap: spacing.xs,
    },
    compactQuote: {
      ...typography.small,
      color: colors.textPrimary,
      fontStyle: 'italic',
      lineHeight: 16,
    },
    compactAuthor: {
      ...typography.small,
      color: colors.textMuted,
      fontSize: 10,
    },
    content: {
      gap: expanded ? spacing.lg : spacing.sm,
    },
    quote: {
      ...(expanded ? typography.titleMd : typography.body),
      color: colors.textPrimary,
      fontStyle: 'italic',
      lineHeight: expanded ? 32 : 22,
    },
    author: {
      ...(expanded ? typography.body : typography.caption),
      color: colors.textMuted,
      textAlign: 'right',
    },
  });
