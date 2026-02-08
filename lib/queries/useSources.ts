import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { Source } from '@/types/database';
import { useNetwork } from '@/contexts/NetworkContext';
import * as db from '@/lib/db';

export function useSources() {
  const { isOnline } = useNetwork();

  return useQuery({
    queryKey: ['sources'],
    queryFn: async (): Promise<Source[]> => {
      if (isOnline) {
        try {
          const { data, error } = await supabase
            .from('sources')
            .select('*')
            .order('created_at', { ascending: false });

          if (error) throw error;

          const sources = data ?? [];

          // Save to local DB for offline access
          if (sources.length > 0) {
            await db.saveSources(sources);
          }

          return sources;
        } catch (error) {
          console.log('[useSources] Supabase error, falling back to local DB:', error);
        }
      }

      // Offline: read from local DB
      console.log('[useSources] Reading from local DB');
      return db.getSources();
    },
    staleTime: isOnline ? 1000 * 60 * 2 : Infinity,
  });
}

export function useSource(id: string) {
  const { isOnline } = useNetwork();

  return useQuery({
    queryKey: ['sources', id],
    queryFn: async (): Promise<Source | null> => {
      if (isOnline) {
        try {
          const { data, error } = await supabase.from('sources').select('*').eq('id', id).single();

          if (error) throw error;
          return data;
        } catch (error) {
          console.log('[useSource] Supabase error, falling back to local DB:', error);
        }
      }

      // Offline: read from local DB
      return db.getSourceById(id);
    },
    enabled: !!id,
    staleTime: isOnline ? 1000 * 60 * 2 : Infinity,
  });
}
