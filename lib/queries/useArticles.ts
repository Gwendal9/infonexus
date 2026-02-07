import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Article, Source } from '@/types/database';

export interface ArticleWithSource extends Article {
  source: Source;
}

export function useArticles() {
  return useQuery({
    queryKey: ['articles'],
    queryFn: async (): Promise<ArticleWithSource[]> => {
      const { data, error } = await supabase
        .from('articles')
        .select(
          `
          *,
          source:sources(*)
        `
        )
        .order('published_at', { ascending: false, nullsFirst: false })
        .limit(100);

      if (error) throw error;
      return (data as ArticleWithSource[]) ?? [];
    },
  });
}

export function useArticlesBySource(sourceId: string) {
  return useQuery({
    queryKey: ['articles', 'source', sourceId],
    queryFn: async (): Promise<Article[]> => {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('source_id', sourceId)
        .order('published_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      return data ?? [];
    },
    enabled: !!sourceId,
  });
}

export function useArticleById(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['article', id],
    queryFn: async (): Promise<ArticleWithSource | null> => {
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
    },
    enabled: !!id,
    // Use cached article from articles list as initial data (instant display)
    initialData: () => {
      const cachedArticles = queryClient.getQueryData<ArticleWithSource[]>(['articles']);
      return cachedArticles?.find((article) => article.id === id) ?? undefined;
    },
    // Don't refetch if we have initial data (it's the same data)
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
