import { useInfiniteQuery, useQuery, useQueryClient, InfiniteData } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Article, Source } from '@/types/database';
import { useNetwork } from '@/contexts/NetworkContext';
import * as db from '@/lib/db';

export interface ArticleWithSource extends Article {
  source: Source;
}

const PAGE_SIZE = 30;

export function useArticles() {
  const { isOnline } = useNetwork();

  return useInfiniteQuery({
    queryKey: ['articles'],
    queryFn: async ({ pageParam }): Promise<ArticleWithSource[]> => {
      // Try to fetch from Supabase if online
      if (isOnline) {
        try {
          const from = pageParam;
          const to = from + PAGE_SIZE - 1;

          const { data, error } = await supabase
            .from('articles')
            .select('*, source:sources(*)')
            .order('published_at', { ascending: false, nullsFirst: false })
            .range(from, to);

          if (error) throw error;

          const articles = (data as ArticleWithSource[]) ?? [];

          // Save to local DB for offline access
          if (articles.length > 0) {
            await db.saveArticles(articles);
            const sources = articles
              .map((a) => a.source)
              .filter((s, i, arr) => arr.findIndex((x) => x.id === s.id) === i);
            await db.saveSources(sources);
          }

          return articles;
        } catch (error) {
          console.log('[useArticles] Supabase error, falling back to local DB:', error);
        }
      }

      // Offline or error: read all from local SQLite (no pagination)
      console.log('[useArticles] Reading from local DB');
      const [localArticles, localSources] = await Promise.all([
        db.getArticles(),
        db.getSources(),
      ]);

      const sourceMap = new Map(localSources.map((s) => [s.id, s]));
      return localArticles
        .filter((a) => sourceMap.has(a.source_id))
        .map((a) => ({ ...a, source: sourceMap.get(a.source_id)! }));
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === PAGE_SIZE ? allPages.flat().length : undefined,
    staleTime: isOnline ? 1000 * 60 * 2 : Infinity,
  });
}

export function useArticlesBySource(sourceId: string) {
  const { isOnline } = useNetwork();

  return useQuery({
    queryKey: ['articles', 'source', sourceId],
    queryFn: async (): Promise<Article[]> => {
      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('articles')
            .select('*')
            .eq('source_id', sourceId)
            .order('published_at', { ascending: false, nullsFirst: false });

          if (error) throw error;

          const articles = data ?? [];
          if (articles.length > 0) {
            await db.saveArticles(articles);
          }

          return articles;
        } catch (error) {
          console.log('[useArticlesBySource] Supabase error, falling back to local DB:', error);
        }
      }

      // Offline: read from local DB
      return db.getArticlesBySourceId(sourceId);
    },
    enabled: !!sourceId,
    staleTime: isOnline ? 1000 * 60 * 2 : Infinity,
  });
}

export async function fetchArticleById(id: string, isOnline: boolean): Promise<ArticleWithSource | null> {
  if (isOnline) {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*, source:sources(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as ArticleWithSource;
    } catch {
      // fall through to local DB
    }
  }
  const [article, sources] = await Promise.all([db.getArticleById(id), db.getSources()]);
  if (!article) return null;
  const source = sources.find((s) => s.id === article.source_id);
  if (!source) return null;
  return { ...article, source };
}

export function useArticleById(id: string) {
  const queryClient = useQueryClient();
  const { isOnline } = useNetwork();

  return useQuery({
    queryKey: ['article', id],
    queryFn: async (): Promise<ArticleWithSource | null> => {
      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('articles')
            .select(`
              *,
              source:sources(*)
            `)
            .eq('id', id)
            .single();

          if (error) throw error;
          return data as ArticleWithSource;
        } catch (error) {
          console.log('[useArticleById] Supabase error, falling back to local DB:', error);
        }
      }

      // Offline: read from local DB
      const [article, sources] = await Promise.all([
        db.getArticleById(id),
        db.getSources(),
      ]);

      if (!article) return null;

      const source = sources.find((s) => s.id === article.source_id);
      if (!source) return null;

      return { ...article, source };
    },
    enabled: !!id,
    initialData: () => {
      const cachedData = queryClient.getQueryData<InfiniteData<ArticleWithSource[]>>(['articles']);
      return cachedData?.pages.flat().find((article) => article.id === id) ?? undefined;
    },
    staleTime: 1000 * 60 * 5,
  });
}
