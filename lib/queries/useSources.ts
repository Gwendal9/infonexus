import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Source } from '@/types/database';

export function useSources() {
  return useQuery({
    queryKey: ['sources'],
    queryFn: async (): Promise<Source[]> => {
      const { data, error } = await supabase
        .from('sources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useSource(id: string) {
  return useQuery({
    queryKey: ['sources', id],
    queryFn: async (): Promise<Source | null> => {
      const { data, error } = await supabase.from('sources').select('*').eq('id', id).single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
