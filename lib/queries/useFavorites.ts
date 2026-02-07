import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { ArticleWithSource } from './useArticles';

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async (): Promise<ArticleWithSource[]> => {
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
      return (data?.map((f: any) => f.article).filter(Boolean) as ArticleWithSource[]) ?? [];
    },
  });
}

export function useFavoriteIds() {
  return useQuery({
    queryKey: ['favorite-ids'],
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase.from('favorites').select('article_id');

      if (error) throw error;

      return new Set(data?.map((f) => f.article_id) ?? []);
    },
  });
}
