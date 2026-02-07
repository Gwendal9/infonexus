import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/utils/supabase';
import { InsertTheme, Theme } from '@/types/database';

export function useAddTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: InsertTheme): Promise<Theme> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error('Non authentifié');

      const { data, error } = await supabase
        .from('themes')
        .insert({
          user_id: user.id,
          name: input.name,
          color: input.color ?? '#FF6B35',
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('Ce thème existe déjà');
        }
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
    },
  });
}

export function useDeleteTheme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('themes').delete().eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['themes'] });
      queryClient.invalidateQueries({ queryKey: ['sources'] });
    },
  });
}

export function useAssignThemeToSource() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sourceId,
      themeId,
      assign,
    }: {
      sourceId: string;
      themeId: string;
      assign: boolean;
    }): Promise<void> => {
      if (assign) {
        const { error } = await supabase.from('source_themes').insert({
          source_id: sourceId,
          theme_id: themeId,
        });
        if (error && error.code !== '23505') throw error;
      } else {
        const { error } = await supabase
          .from('source_themes')
          .delete()
          .eq('source_id', sourceId)
          .eq('theme_id', themeId);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources'] });
      queryClient.invalidateQueries({ queryKey: ['source-themes'] });
    },
  });
}
