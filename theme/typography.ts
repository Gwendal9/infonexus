/**
 * InfoNexus Typography System
 */

import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  display: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 29,
    fontFamily,
  } as TextStyle,

  titleLg: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
    fontFamily,
  } as TextStyle,

  titleMd: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 21,
    fontFamily,
  } as TextStyle,

  subheading: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 19,
    fontFamily,
  } as TextStyle,

  title: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 23,
    fontFamily,
  } as TextStyle,

  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    fontFamily,
  } as TextStyle,

  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 17,
    fontFamily,
  } as TextStyle,

  small: {
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 13,
    fontFamily,
  } as TextStyle,
} as const;

export type TypographyKey = keyof typeof typography;
