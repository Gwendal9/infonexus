/**
 * InfoNexus Color Palette - "Warm & Clear"
 */

export const colors = {
  // Primary
  primary: '#FF6B35',
  primaryLight: '#FF8F66',

  // Backgrounds
  background: '#FAFAFA',
  surface: '#FFFFFF',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',

  // Borders
  border: '#E5E5E5',

  // Status
  statusOk: '#34C759',
  statusWarning: '#FF9500',
  statusError: '#FF3B30',
  statusInfo: '#007AFF',
} as const;

export type ColorKey = keyof typeof colors;
