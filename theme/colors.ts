/**
 * InfoNexus Color Palette - "Warm & Clear"
 */

export const lightColors = {
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

export const darkColors = {
  // Primary (same)
  primary: '#FF6B35',
  primaryLight: '#FF8F66',

  // Backgrounds
  background: '#0A0A0A',
  surface: '#1A1A1A',

  // Text
  textPrimary: '#FAFAFA',
  textSecondary: '#A0A0A0',
  textMuted: '#6B6B6B',

  // Borders
  border: '#2A2A2A',

  // Status
  statusOk: '#34C759',
  statusWarning: '#FF9500',
  statusError: '#FF3B30',
  statusInfo: '#0A84FF',
} as const;

// Default export for backward compatibility
export const colors = lightColors;

export interface ColorScheme {
  primary: string;
  primaryLight: string;
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  statusOk: string;
  statusWarning: string;
  statusError: string;
  statusInfo: string;
}

export type ColorKey = keyof ColorScheme;
