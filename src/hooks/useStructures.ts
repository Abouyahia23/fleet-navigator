import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Structure = Tables<'structures'>;
export type StructureInsert = TablesInsert<'structures'>;
export type StructureUpdate = TablesUpdate<'structures'>;

export function useStructures(siteId?: string) {
  return useQuery({
    queryKey: ['structures', siteId],
    queryFn: async () => {
      let query = supabase
        .from('structures')
        .select(`
          *,
          site:sites(id, nom)
        `)
        .order('nom');

      if (siteId) {
        query = query.eq('site_id', siteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (structure: StructureInsert) => {
      const { data, error } = await supabase
        .from('structures')
        .insert(structure)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structures'] });
    },
  });
}

export function useUpdateStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...structure }: StructureUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('structures')
        .update(structure)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structures'] });
    },
  });
}

export function useDeleteStructure() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('structures').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['structures'] });
    },
  });
}
