import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { ArticleWithSource } from './useArticles';
import { useNetwork } from '@/contexts/NetworkContext';
import * as db from '@/lib/db';

export function useFavorites() {
  const { isOnline } = useNetwork();

  return useQuery({
    queryKey: ['favorites'],
    queryFn: async (): Promise<ArticleWithSource[]> => {
      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('favorites')
            .select(
              `
              article:articles(
                *,
                source:sources(*)
              )
            `
            )
            .order('created_at', { ascending: false });

          if (error) throw error;

          // Flatten the response
          const articles = (data?.map((f: any) => f.article).filter(Boolean) as ArticleWithSource[]) ?? [];

          // Save articles and sources for offline access
          if (articles.length > 0) {
            await db.saveArticles(articles);
            const sources = articles
              .map((a) => a.source)
              .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);
            await db.saveSources(sources);
          }

          return articles;
        } catch (error) {
          console.log('[useFavorites] Supabase error, falling back to local DB:', error);
        }
      }

      // Offline: get favorites from local DB and join with articles/sources
      console.log('[useFavorites] Reading from local DB');
      const [favorites, articles, sources] = await Promise.all([
        db.getFavorites(),
        db.getArticles(),
        db.getSources(),
      ]);

      const articleMap = new Map(articles.map((a) => [a.id, a]));
      const sourceMap = new Map(sources.map((s) => [s.id, s]));

      const result: ArticleWithSource[] = [];
      for (const fav of favorites) {
        const article = articleMap.get(fav.article_id);
        if (article) {
          const source = sourceMap.get(article.source_id);
          if (source) {
            result.push({ ...article, source });
          }
        }
      }

      return result;
    },
    staleTime: isOnline ? 1000 * 60 * 2 : Infinity,
  });
}

export function useFavoriteIds() {
  const { isOnline } = useNetwork();

  return useQuery({
    queryKey: ['favorite-ids'],
    queryFn: async (): Promise<Set<string>> => {
      if (isOnline) {
        try {
          const { data, error } = await supabase.from('favorites').select('id, user_id, article_id, created_at');

          if (error) throw error;

          // Save favorites to local DB
          if (data && data.length > 0) {
            await db.saveFavorites(data);
          }

          return new Set(data?.map((f) => f.article_id) ?? []);
        } catch (error) {
          console.log('[useFavoriteIds] Supabase error, falling back to local DB:', error);
        }
      }

      // Offline: read from local DB
      console.log('[useFavoriteIds] Reading from local DB');
      return db.getFavoriteArticleIds();
    },
    staleTime: isOnline ? 1000 * 60 : Infinity, // 1 min online
  });
}
