import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { useNetwork } from '@/contexts/NetworkContext';
import * as db from '@/lib/db';

export function useReadArticleIds() {
  const { isOnline } = useNetwork();

  return useQuery({
    queryKey: ['read-article-ids'],
    queryFn: async (): Promise<Set<string>> => {
      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('read_articles')
            .select('id, user_id, article_id, read_at');

          if (error) throw error;

          // Save to local DB
          if (data && data.length > 0) {
            await db.saveReadArticles(data);
          }

          return new Set(data?.map((r) => r.article_id) ?? []);
        } catch (error) {
          console.log('[useReadArticleIds] Supabase error, falling back to local DB:', error);
        }
      }

      // Offline: read from local DB
      return db.getReadArticleIds();
    },
    staleTime: isOnline ? 1000 * 60 : Infinity,
  });
}
