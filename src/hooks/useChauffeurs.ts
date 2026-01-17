import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Chauffeur = Tables<'chauffeurs'>;
export type ChauffeurInsert = TablesInsert<'chauffeurs'>;
export type ChauffeurUpdate = TablesUpdate<'chauffeurs'>;

export function useChauffeurs(siteId?: string, activeOnly = false) {
  return useQuery({
    queryKey: ['chauffeurs', siteId, activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('chauffeurs')
        .select(`
          *,
          site:sites(id, nom)
        `)
        .order('nom');

      if (siteId) {
        query = query.eq('site_id', siteId);
      }
      if (activeOnly) {
        query = query.eq('actif', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateChauffeur() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (chauffeur: ChauffeurInsert) => {
      const { data, error } = await supabase
        .from('chauffeurs')
        .insert(chauffeur)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chauffeurs'] });
    },
  });
}

export function useUpdateChauffeur() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...chauffeur }: ChauffeurUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('chauffeurs')
        .update(chauffeur)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chauffeurs'] });
    },
  });
}

export function useDeleteChauffeur() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('chauffeurs').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chauffeurs'] });
    },
  });
}
