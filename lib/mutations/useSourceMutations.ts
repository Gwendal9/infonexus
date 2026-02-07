import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { InsertSource, Source, SourceType } from '@/types/database';

export function useAddSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InsertSource): Promise<Source> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('sources')
        .insert({
          user_id: user.id,
          url: input.url,
          name: input.name,
          type: input.type ?? 'rss',
          logo_url: input.logo_url,
          status: 'pending',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Cette source existe déjà');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
}

export function useDeleteSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('sources').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
}

export function useUpdateSourceType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, type }: { id: string; type: SourceType }): Promise<void> => {
      const { error } = await supabase.from('sources').update({ type }).eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
}
