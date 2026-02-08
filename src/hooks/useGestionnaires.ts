import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Gestionnaire = Tables<'gestionnaires'> & {
  profile?: {
    id: string;
    nom: string;
    prenom: string | null;
    email: string;
    telephone: string | null;
  } | null;
  site?: { id: string; nom: string } | null;
  structure?: { id: string; nom: string } | null;
};

export type GestionnaireInsert = TablesInsert<'gestionnaires'>;
export type GestionnaireUpdate = TablesUpdate<'gestionnaires'>;

export function useGestionnaires(activeOnly = false) {
  return useQuery({
    queryKey: ['gestionnaires', activeOnly],
    queryFn: async () => {
      let query = supabase
        .from('gestionnaires')
        .select(`
          *,
          profile:profiles(id, nom, prenom, email, telephone),
          site:sites(id, nom),
          structure:structures(id, nom)
        `)
        .order('created_at', { ascending: false });

      if (activeOnly) {
        query = query.eq('actif', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Gestionnaire[];
    },
  });
}

export function useCreateGestionnaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (gestionnaire: GestionnaireInsert) => {
      const { data, error } = await supabase
        .from('gestionnaires')
        .insert(gestionnaire)
        .select(`
          *,
          profile:profiles(id, nom, prenom, email, telephone),
          site:sites(id, nom),
          structure:structures(id, nom)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gestionnaires'] });
    },
  });
}

export function useUpdateGestionnaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...gestionnaire }: GestionnaireUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('gestionnaires')
        .update(gestionnaire)
        .eq('id', id)
        .select(`
          *,
          profile:profiles(id, nom, prenom, email, telephone),
          site:sites(id, nom),
          structure:structures(id, nom)
        `)
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gestionnaires'] });
    },
  });
}

export function useDeleteGestionnaire() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('gestionnaires').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gestionnaires'] });
    },
  });
}

export function useToggleGestionnaireActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      const { data, error } = await supabase
        .from('gestionnaires')
        .update({ actif })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gestionnaires'] });
    },
  });
}
