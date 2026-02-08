import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Article, Source } from '@/types/database';

export interface SearchResult extends Article {
  rank: number;
  source?: Partial<Source> & { name: string };
}

export function useSearchArticles(query: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['search-articles', query],
    queryFn: async (): Promise<SearchResult[]> => {
      if (!query || query.trim().length < 2) {
        return [];
      }

      // First get user's sources
      const { data: sources } = await supabase
        .from('sources')
        .select('id, name, type');

      const sourceIds = sources?.map(s => s.id) ?? [];

      if (sourceIds.length === 0) {
        return [];
      }

      // Call the search function
      const { data, error } = await supabase
        .rpc('search_articles', {
          search_query: query.trim(),
          user_sources: sourceIds,
          result_limit: 50,
        });

      if (error) {
        console.error('[useSearchArticles] Error:', error);
        // Fallback to simple ILIKE search if full-text search fails
        return fallbackSearch(query, sourceIds, sources ?? []);
      }

      // Attach source info to results
      const sourceMap = new Map(sources?.map(s => [s.id, s]) ?? []);
      return (data ?? []).map((article: any) => ({
        ...article,
        source: sourceMap.get(article.source_id),
      }));
    },
    enabled: enabled && query.trim().length >= 2,
    staleTime: 1000 * 60, // 1 minute
  });
}

// Fallback search using ILIKE (works without the migration)
async function fallbackSearch(
  query: string,
  sourceIds: string[],
  sources: { id: string; name: string; type: string }[]
): Promise<SearchResult[]> {
  const searchPattern = `%${query.trim()}%`;

  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .in('source_id', sourceIds)
    .or(`title.ilike.${searchPattern},summary.ilike.${searchPattern}`)
    .order('published_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('[fallbackSearch] Error:', error);
    return [];
  }

  const sourceMap = new Map(sources.map(s => [s.id, s]));
  return (data ?? []).map(article => ({
    ...article,
    rank: 1,
    source: sourceMap.get(article.source_id),
  }));
}
