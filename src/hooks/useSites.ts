import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Site = Tables<'sites'>;
export type SiteInsert = TablesInsert<'sites'>;
export type SiteUpdate = TablesUpdate<'sites'>;

export function useSites() {
  return useQuery({
    queryKey: ['sites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sites')
        .select('*')
        .order('nom');

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (site: SiteInsert) => {
      const { data, error } = await supabase
        .from('sites')
        .insert(site)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}

export function useUpdateSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...site }: SiteUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('sites')
        .update(site)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}

export function useDeleteSite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sites').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sites'] });
    },
  });
}
