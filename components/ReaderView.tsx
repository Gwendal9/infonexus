import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { ArticleContent } from '@/lib/services/articleReader';
import { useColors } from '@/contexts/ThemeContext';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

interface ReaderViewProps {
  content: ArticleContent;
  fontSize: number;
  onFontSizeChange: (size: number) => void;
}

const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 24;

export function ReaderView({ content, fontSize, onFontSizeChange }: ReaderViewProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const styles = createStyles(colors);
  const [showControls, setShowControls] = useState(true);

  const contentWidth = width - spacing.lg * 2;

  const tagsStyles = {
    body: {
      color: colors.textPrimary,
      fontSize,
      lineHeight: fontSize * 1.7,
      fontFamily: 'System',
    },
    p: {
      marginBottom: 12,
    },
    h1: {
      fontSize: fontSize + 8,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      marginBottom: 12,
      marginTop: 20,
    },
    h2: {
      fontSize: fontSize + 6,
      fontWeight: '700' as const,
      color: colors.textPrimary,
      marginBottom: 10,
      marginTop: 18,
    },
    h3: {
      fontSize: fontSize + 4,
      fontWeight: '600' as const,
      color: colors.textPrimary,
      marginBottom: 8,
      marginTop: 16,
    },
    a: {
      color: colors.primary,
      textDecorationLine: 'underline' as const,
    },
    blockquote: {
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      paddingLeft: 12,
      marginLeft: 0,
      fontStyle: 'italic' as const,
      color: colors.textSecondary,
    },
    img: {
      borderRadius: 8,
      marginVertical: 8,
    },
    strong: {
      fontWeight: '700' as const,
    },
    em: {
      fontStyle: 'italic' as const,
    },
    ul: {
      paddingLeft: 16,
    },
    ol: {
      paddingLeft: 16,
    },
    li: {
      marginBottom: 4,
    },
    figcaption: {
      fontSize: fontSize - 2,
      color: colors.textMuted,
      fontStyle: 'italic' as const,
      textAlign: 'center' as const,
      marginTop: 4,
    },
  };

  const increaseFontSize = () => {
    if (fontSize < MAX_FONT_SIZE) {
      Haptics.selectionAsync();
      onFontSizeChange(fontSize + 1);
    }
  };

  const decreaseFontSize = () => {
    if (fontSize > MIN_FONT_SIZE) {
      Haptics.selectionAsync();
      onFontSizeChange(fontSize - 1);
    }
  };

  return (
    <View style={styles.container}>
      {/* Read time */}
      <View style={styles.readTimeBadge}>
        <Ionicons name="time-outline" size={14} color={colors.primary} />
        <Text style={styles.readTimeText}>
          {content.estimatedReadTime} min de lecture
        </Text>
      </View>

      {/* Article content */}
      <RenderHtml
        contentWidth={contentWidth}
        source={{ html: content.content }}
        tagsStyles={tagsStyles}
        enableExperimentalMarginCollapsing
      />

      {/* Font size controls */}
      {showControls && (
        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.controlButton, fontSize <= MIN_FONT_SIZE && styles.controlDisabled]}
            onPress={decreaseFontSize}
            disabled={fontSize <= MIN_FONT_SIZE}
          >
            <Text style={[styles.controlText, { fontSize: 14 }]}>A</Text>
          </TouchableOpacity>
          <Text style={styles.fontSizeLabel}>{fontSize}</Text>
          <TouchableOpacity
            style={[styles.controlButton, fontSize >= MAX_FONT_SIZE && styles.controlDisabled]}
            onPress={increaseFontSize}
            disabled={fontSize >= MAX_FONT_SIZE}
          >
            <Text style={[styles.controlText, { fontSize: 20 }]}>A</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.closeControl}
            onPress={() => setShowControls(false)}
          >
            <Ionicons name="close" size={16} color={colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}

      {/* Show controls button (when hidden) */}
      {!showControls && (
        <TouchableOpacity
          style={styles.showControlsButton}
          onPress={() => setShowControls(true)}
        >
          <Ionicons name="text" size={18} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const createStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    readTimeBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      alignSelf: 'flex-start',
      backgroundColor: colors.primary + '15',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      marginBottom: spacing.lg,
    },
    readTimeText: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '500',
    },
    controls: {
      position: 'absolute',
      bottom: 20,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 24,
      paddingHorizontal: 4,
      paddingVertical: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
      gap: 2,
    },
    controlButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    controlDisabled: {
      opacity: 0.3,
    },
    controlText: {
      fontWeight: '700',
      color: colors.textPrimary,
    },
    fontSizeLabel: {
      ...typography.caption,
      color: colors.textMuted,
      minWidth: 20,
      textAlign: 'center',
    },
    closeControl: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
    },
    showControlsButton: {
      position: 'absolute',
      bottom: 20,
      right: 0,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
  });
