import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { useNetwork } from '@/contexts/NetworkContext';
import * as db from '@/lib/db';

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetwork();

  return useMutation({
    mutationFn: async (articleId: string): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Non authentifié');

      // Always update local DB first (optimistic)
      await db.markArticleAsRead(user.id, articleId);

      if (isOnline) {
        try {
          const { error } = await supabase.from('read_articles').upsert(
            {
              user_id: user.id,
              article_id: articleId,
              read_at: new Date().toISOString(),
            },
            {
              onConflict: 'user_id,article_id',
            }
          );

          if (error) throw error;
        } catch (error) {
          console.log('[useMarkAsRead] Failed to sync, queuing:', error);
          await db.addToSyncQueue('INSERT', 'read_articles', articleId, {
            article_id: articleId,
          });
        }
      } else {
        // Offline: add to sync queue
        await db.addToSyncQueue('INSERT', 'read_articles', articleId, {
          article_id: articleId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['read-article-ids'] });
    },
  });
}

export function useMarkAsUnread() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetwork();

  return useMutation({
    mutationFn: async (articleId: string): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Non authentifié');

      // Always update local DB first
      await db.markArticleAsUnread(user.id, articleId);

      if (isOnline) {
        try {
          const { error } = await supabase
            .from('read_articles')
            .delete()
            .eq('user_id', user.id)
            .eq('article_id', articleId);

          if (error) throw error;
        } catch (error) {
          console.log('[useMarkAsUnread] Failed to sync, queuing:', error);
          await db.addToSyncQueue('DELETE', 'read_articles', articleId, {
            article_id: articleId,
          });
        }
      } else {
        await db.addToSyncQueue('DELETE', 'read_articles', articleId, {
          article_id: articleId,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['read-article-ids'] });
    },
  });
}
