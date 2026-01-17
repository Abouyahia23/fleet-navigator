import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Prestataire = Tables<'prestataires'>;
export type PrestataireInsert = TablesInsert<'prestataires'>;
export type PrestataireUpdate = TablesUpdate<'prestataires'>;

export function usePrestataires(activeOnly = false) {
  return useQuery({
    queryKey: ['prestataires', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('prestataires')
        .select('*')
        .order('nom');

      if (activeOnly) {
        query = query.eq('actif', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreatePrestataire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (prestataire: PrestataireInsert) => {
      const { data, error } = await supabase
        .from('prestataires')
        .insert(prestataire)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestataires'] });
    },
  });
}

export function useUpdatePrestataire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...prestataire }: PrestataireUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('prestataires')
        .update(prestataire)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestataires'] });
    },
  });
}

export function useDeletePrestataire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('prestataires').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prestataires'] });
    },
  });
}
