import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';

export function useSourceThemes(sourceId: string) {
  return useQuery({
    queryKey: ['source-themes', sourceId],
    queryFn: async (): Promise<Set<string>> => {
      const { data, error } = await supabase
        .from('source_themes')
        .select('theme_id')
        .eq('source_id', sourceId);

      if (error) throw error;
      return new Set(data?.map((st) => st.theme_id) ?? []);
    },
    enabled: !!sourceId,
  });
}

export function useAllSourceThemes() {
  return useQuery({
    queryKey: ['source-themes'],
    queryFn: async (): Promise<Map<string, string[]>> => {
      const { data, error } = await supabase.from('source_themes').select('source_id, theme_id');

      if (error) throw error;

      const map = new Map<string, string[]>();
      data?.forEach((st) => {
        const themes = map.get(st.source_id) ?? [];
        themes.push(st.theme_id);
        map.set(st.source_id, themes);
      });
      return map;
    },
  });
}
