import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Theme } from '@/types/database';
import { useNetwork } from '@/contexts/NetworkContext';
import * as db from '@/lib/db';

export function useThemes() {
  const { isOnline } = useNetwork();

  return useQuery({
    queryKey: ['themes'],
    queryFn: async (): Promise<Theme[]> => {
      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('themes')
            .select('*')
            .order('name', { ascending: true });

          if (error) throw error;

          const themes = data ?? [];

          // Save to local DB for offline access
          if (themes.length > 0) {
            await db.saveThemes(themes);
          }

          return themes;
        } catch (error) {
          console.log('[useThemes] Supabase error, falling back to local DB:', error);
        }
      }

      // Offline: read from local DB
      console.log('[useThemes] Reading from local DB');
      return db.getThemes();
    },
    staleTime: isOnline ? 1000 * 60 * 5 : Infinity, // 5 min online
  });
}
