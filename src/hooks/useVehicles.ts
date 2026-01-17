import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type Vehicle = Tables<'vehicles'>;
export type VehicleInsert = TablesInsert<'vehicles'>;
export type VehicleUpdate = TablesUpdate<'vehicles'>;

import type { Database } from '@/integrations/supabase/types';

type VehicleStatus = Database['public']['Enums']['vehicle_status'];

export function useVehicles(filters?: {
  search?: string;
  site_id?: string;
  status?: VehicleStatus;
}) {
  return useQuery({
    queryKey: ['vehicles', filters],
    queryFn: async () => {
      let query = supabase
        .from('vehicles')
        .select(`
          *,
          site:sites(id, nom),
          structure:structures(id, nom),
          chauffeur_referent:chauffeurs(id, nom, prenom)
        `)
        .order('created_at', { ascending: false });

      if (filters?.search) {
        query = query.or(`immatriculation.ilike.%${filters.search}%,marque.ilike.%${filters.search}%,modele.ilike.%${filters.search}%`);
      }
      if (filters?.site_id) {
        query = query.eq('site_id', filters.site_id);
      }
      if (filters?.status) {
        query = query.eq('statut', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: ['vehicle', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          site:sites(id, nom),
          structure:structures(id, nom),
          chauffeur_referent:chauffeurs(id, nom, prenom)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicle: VehicleInsert) => {
      const { data, error } = await supabase
        .from('vehicles')
        .insert(vehicle)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...vehicle }: VehicleUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('vehicles')
        .update(vehicle)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle', variables.id] });
    },
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
