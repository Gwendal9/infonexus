import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Theme } from '@/types/database';

export function useThemes() {
  return useQuery({
    queryKey: ['themes'],
    queryFn: async (): Promise<Theme[]> => {
      const { data, error } = await supabase
        .from('themes')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });
}
