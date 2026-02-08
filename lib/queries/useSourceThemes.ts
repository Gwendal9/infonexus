import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { useNetwork } from '@/contexts/NetworkContext';
import * as db from '@/lib/db';

export function useSourceThemes(sourceId: string) {
  const { isOnline } = useNetwork();

  return useQuery({
    queryKey: ['source-themes', sourceId],
    queryFn: async (): Promise<Set<string>> => {
      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('source_themes')
            .select('theme_id')
            .eq('source_id', sourceId);

          if (error) throw error;
          return new Set(data?.map((st) => st.theme_id) ?? []);
        } catch (error) {
          console.log('[useSourceThemes] Supabase error, falling back to local DB:', error);
        }
      }

      // Offline: read from local DB
      const themeIds = await db.getThemeIdsForSource(sourceId);
      return new Set(themeIds);
    },
    enabled: !!sourceId,
    staleTime: isOnline ? 1000 * 60 * 5 : Infinity,
  });
}

export function useAllSourceThemes() {
  const { isOnline } = useNetwork();

  return useQuery({
    queryKey: ['source-themes'],
    queryFn: async (): Promise<Map<string, string[]>> => {
      if (isOnline) {
        try {
          const { data, error } = await supabase.from('source_themes').select('source_id, theme_id');

          if (error) throw error;

          // Save to local DB
          if (data && data.length > 0) {
            await db.saveSourceThemes(data);
          }

          const map = new Map<string, string[]>();
          data?.forEach((st) => {
            const themes = map.get(st.source_id) ?? [];
            themes.push(st.theme_id);
            map.set(st.source_id, themes);
          });
          return map;
        } catch (error) {
          console.log('[useAllSourceThemes] Supabase error, falling back to local DB:', error);
        }
      }

      // Offline: read from local DB
      console.log('[useAllSourceThemes] Reading from local DB');
      const sourceThemes = await db.getSourceThemes();

      const map = new Map<string, string[]>();
      sourceThemes.forEach((st) => {
        const themes = map.get(st.source_id) ?? [];
        themes.push(st.theme_id);
        map.set(st.source_id, themes);
      });
      return map;
    },
    staleTime: isOnline ? 1000 * 60 * 5 : Infinity,
  });
}
