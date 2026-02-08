import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { ArticleWithSource } from '@/lib/queries/useArticles';
import { useTopics } from '@/contexts/TopicContext';
import { useNetwork } from '@/contexts/NetworkContext';
import { useWidgetConfig } from '@/contexts/WidgetContext';
import { getDatabase } from '@/lib/db/database';
import { GNewsSearchArticle } from '@/lib/topics/types';

export interface TopicArticle extends ArticleWithSource {
  isGNews?: boolean;
}

async function fetchLocalArticles(kws: string[]): Promise<TopicArticle[]> {
  try {
    const db = await getDatabase();
    const conditions = kws.flatMap(() => [
      `a.title LIKE '%' || ? || '%'`,
      `a.summary LIKE '%' || ? || '%'`,
    ]);
    const params = kws.flatMap((kw) => [kw, kw]);

    const query = `
      SELECT a.*, s.id as s_id, s.user_id as s_user_id, s.url as s_url, s.name as s_name,
             s.type as s_type, s.status as s_status, s.logo_url as s_logo_url,
             s.last_fetched_at as s_last_fetched_at, s.last_error as s_last_error,
             s.created_at as s_created_at, s.updated_at as s_updated_at
      FROM articles a
      JOIN sources s ON a.source_id = s.id
      WHERE (${conditions.join(' OR ')})
      ORDER BY a.published_at DESC
      LIMIT 50
    `;

    const rows = await db.getAllAsync<any>(query, params);

    return rows.map((row) => ({
      id: row.id,
      source_id: row.source_id,
      url: row.url,
      title: row.title,
      summary: row.summary,
      image_url: row.image_url,
      author: row.author,
      published_at: row.published_at,
      fetched_at: row.fetched_at,
      created_at: row.created_at,
      source: {
        id: row.s_id,
        user_id: row.s_user_id,
        url: row.s_url,
        name: row.s_name,
        type: row.s_type,
        status: row.s_status,
        logo_url: row.s_logo_url,
        last_fetched_at: row.s_last_fetched_at,
        last_error: row.s_last_error,
        created_at: row.s_created_at,
        updated_at: row.s_updated_at,
      },
      isGNews: false,
    }));
  } catch (error) {
    console.error('[useTopicArticles] Local DB error:', error);
    return [];
  }
}

function gnewsToTopicArticle(article: GNewsSearchArticle): TopicArticle {
  return {
    id: `gnews-${article.url}`,
    source_id: 'gnews-topic',
    url: article.url,
    title: article.title,
    summary: article.description,
    image_url: article.image,
    author: null,
    published_at: article.publishedAt,
    fetched_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    source: {
      id: 'gnews-topic',
      user_id: '',
      url: '',
      name: article.sourceName,
      type: 'rss',
      status: 'active',
      logo_url: null,
      last_fetched_at: null,
      last_error: null,
      created_at: '',
      updated_at: '',
    },
    isGNews: true,
  };
}

function mergeArticles(local: TopicArticle[], gnews: TopicArticle[]): TopicArticle[] {
  const seen = new Set<string>();
  const merged: TopicArticle[] = [];

  for (const article of [...local, ...gnews]) {
    const key = article.url.toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(article);
    }
  }

  merged.sort((a, b) => {
    const dateA = a.published_at ? new Date(a.published_at).getTime() : 0;
    const dateB = b.published_at ? new Date(b.published_at).getTime() : 0;
    return dateB - dateA;
  });

  return merged;
}

export function useTopicArticles(topicId: string | null) {
  const [articles, setArticles] = useState<TopicArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const router = useRouter();

  const { config: topicConfig, getGNewsCache, setGNewsCache, canUseGNewsApi, incrementGNewsUsage } = useTopics();
  const { isOnline } = useNetwork();
  const { config: widgetConfig } = useWidgetConfig();

  const topic = topicConfig.topics.find((t) => t.id === topicId);
  const keywords = useMemo(() => topic?.keywords ?? [], [topic?.keywords]);
  const gnewsApiKey = widgetConfig.settings.news.apiKey;

  // Use refs for functions that shouldn't trigger re-fetches
  const setGNewsCacheRef = useRef(setGNewsCache);
  setGNewsCacheRef.current = setGNewsCache;
  const incrementGNewsUsageRef = useRef(incrementGNewsUsage);
  incrementGNewsUsageRef.current = incrementGNewsUsage;

  const fetchArticles = useCallback(async (forceRefresh = false) => {
    if (!topicId || keywords.length === 0) {
      setArticles([]);
      setIsLoading(false);
      return;
    }

    try {
      // 1. SQLite local: search articles matching keywords
      const localArticles = await fetchLocalArticles(keywords);

      // 2. GNews search (if online + API key + budget ok + cache expired)
      let gnewsArticles: TopicArticle[] = [];
      const cachedEntry = getGNewsCache(topicId);

      if (cachedEntry && !forceRefresh) {
        gnewsArticles = cachedEntry.articles.map(gnewsToTopicArticle);
      } else if (isOnline && gnewsApiKey && (canUseGNewsApi() || !forceRefresh)) {
        try {
          const queryStr = keywords.join(' OR ');
          const response = await fetch(
            `https://gnews.io/api/v4/search?q=${encodeURIComponent(queryStr)}&lang=fr&max=10&token=${encodeURIComponent(gnewsApiKey)}`
          );

          if (response.ok) {
            incrementGNewsUsageRef.current();
            const data = await response.json();
            const gnewsData: GNewsSearchArticle[] = (data.articles ?? []).map((a: any) => ({
              title: a.title,
              description: a.description ?? '',
              url: a.url,
              image: a.image ?? null,
              publishedAt: a.publishedAt,
              sourceName: a.source?.name ?? '',
            }));

            setGNewsCacheRef.current(topicId, {
              articles: gnewsData,
              fetchedAt: new Date().toISOString(),
            });

            gnewsArticles = gnewsData.map(gnewsToTopicArticle);
          }
        } catch (err) {
          console.error('[useTopicArticles] GNews fetch error:', err);
        }
      }

      // 3. Merge: dedup by URL, sort by date DESC
      const merged = mergeArticles(localArticles, gnewsArticles);
      setArticles(merged);
    } catch (error) {
      console.error('[useTopicArticles] Error:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [topicId, keywords, isOnline, gnewsApiKey, getGNewsCache, canUseGNewsApi]);

  useEffect(() => {
    setIsLoading(true);
    fetchArticles();
  }, [fetchArticles]);

  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchArticles(true);
  }, [fetchArticles]);

  const handleArticlePress = useCallback((article: TopicArticle) => {
    if (article.isGNews) {
      Linking.openURL(article.url);
    } else {
      router.push(`/article/${article.id}`);
    }
  }, [router]);

  return { articles, isLoading, isRefreshing, refresh, handleArticlePress };
}
