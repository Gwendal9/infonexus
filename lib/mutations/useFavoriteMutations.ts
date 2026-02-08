import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { useNetwork } from '@/contexts/NetworkContext';
import * as db from '@/lib/db';

export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const { isOnline } = useNetwork();

  return useMutation({
    mutationFn: async ({
      articleId,
      isFavorite,
    }: {
      articleId: string;
      isFavorite: boolean;
    }): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Non authentifié');

      if (isFavorite) {
        // Remove from favorites
        // Always update local DB first (optimistic)
        await db.removeFavorite(user.id, articleId);

        if (isOnline) {
          try {
            const { error } = await supabase
              .from('favorites')
              .delete()
              .eq('user_id', user.id)
              .eq('article_id', articleId);

            if (error) throw error;
          } catch (error) {
            // Add to sync queue for later
            console.log('[Favorites] Failed to sync delete, queuing:', error);
            await db.addToSyncQueue('DELETE', 'favorites', articleId, {
              article_id: articleId,
            });
          }
        } else {
          // Offline: add to sync queue
          await db.addToSyncQueue('DELETE', 'favorites', articleId, {
            article_id: articleId,
          });
        }
      } else {
        // Add to favorites
        // Always update local DB first (optimistic)
        await db.addFavorite(user.id, articleId);

        if (isOnline) {
          try {
            const { error } = await supabase.from('favorites').insert({
              user_id: user.id,
              article_id: articleId,
            });

            if (error) throw error;
          } catch (error) {
            // Add to sync queue for later
            console.log('[Favorites] Failed to sync insert, queuing:', error);
            await db.addToSyncQueue('INSERT', 'favorites', articleId, {
              article_id: articleId,
            });
          }
        } else {
          // Offline: add to sync queue
          await db.addToSyncQueue('INSERT', 'favorites', articleId, {
            article_id: articleId,
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['favorite-ids'] });
    },
  });
}
