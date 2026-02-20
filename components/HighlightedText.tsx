import { Text, StyleSheet } from 'react-native';
import { useColors } from '@/contexts/ThemeContext';

interface HighlightedTextProps {
  text: string;
  highlight: string;
  style?: any;
  numberOfLines?: number;
}

export function HighlightedText({ text, highlight, style, numberOfLines }: HighlightedTextProps) {
  const colors = useColors();
  const styles = createStyles(colors);

  if (!highlight.trim()) {
    return (
      <Text style={style} numberOfLines={numberOfLines}>
        {text}
      </Text>
    );
  }

  // Escape special regex characters in highlight term
  const escapedHighlight = highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Split text into parts based on highlight term (case-insensitive)
  const parts = text.split(new RegExp(`(${escapedHighlight})`, 'gi'));

  return (
    <Text style={style} numberOfLines={numberOfLines}>
      {parts.map((part, index) => {
        // Skip empty parts
        if (part === '') return null;

        const isHighlight = part.toLowerCase() === highlight.toLowerCase();
        return (
          <Text key={index} style={isHighlight ? styles.highlight : undefined}>
            {part}
          </Text>
        );
      })}
    </Text>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    highlight: {
      backgroundColor: colors.primary + '30',
      color: colors.primary,
      fontWeight: '700',
    },
  });
