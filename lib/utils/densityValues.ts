import { DisplayDensity } from '@/contexts/DisplayDensityContext';
import { spacing } from '@/theme/spacing';

export interface DensityValues {
  cardPadding: number;
  cardMargin: number;
  imageHeight: number;
  titleLines: number;
  summaryLines: number;
  fontSize: {
    title: number;
    body: number;
    caption: number;
  };
  lineHeight: {
    title: number;
    body: number;
  };
}

export function getDensityValues(density: DisplayDensity): DensityValues {
  switch (density) {
    case 'compact':
      return {
        cardPadding: spacing.sm,
        cardMargin: spacing.sm,
        imageHeight: 120,
        titleLines: 2,
        summaryLines: 1,
        fontSize: {
          title: 15,
          body: 13,
          caption: 11,
        },
        lineHeight: {
          title: 20,
          body: 18,
        },
      };

    case 'spacious':
      return {
        cardPadding: spacing.lg,
        cardMargin: spacing.lg,
        imageHeight: 200,
        titleLines: 4,
        summaryLines: 3,
        fontSize: {
          title: 19,
          body: 16,
          caption: 13,
        },
        lineHeight: {
          title: 26,
          body: 22,
        },
      };

    case 'comfortable':
    default:
      return {
        cardPadding: spacing.md,
        cardMargin: spacing.md,
        imageHeight: 160,
        titleLines: 3,
        summaryLines: 2,
        fontSize: {
          title: 17,
          body: 15,
          caption: 12,
        },
        lineHeight: {
          title: 23,
          body: 20,
        },
      };
  }
}
