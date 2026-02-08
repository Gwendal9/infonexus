export interface Topic {
  id: string;
  name: string;
  keywords: string[];
  color: string;
  createdAt: string;
}

export interface GNewsSearchArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  sourceName: string;
}

export interface GNewsCacheEntry {
  articles: GNewsSearchArticle[];
  fetchedAt: string;
}

export interface TopicsConfig {
  topics: Topic[];
  gnewsCache: Record<string, GNewsCacheEntry>;
  dailyUsage: { date: string; count: number };
}

export const DEFAULT_TOPICS_CONFIG: TopicsConfig = {
  topics: [],
  gnewsCache: {},
  dailyUsage: { date: new Date().toISOString().split('T')[0], count: 0 },
};

// Re-export shared palette for topics
export { COLOR_PALETTE as TOPIC_COLORS } from '@/theme/palette';

export const GNEWS_DAILY_LIMIT = 80;
export const GNEWS_CACHE_DURATION_MS = 60 * 60 * 1000; // 1 hour
