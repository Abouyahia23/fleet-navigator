import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type FuelEntry = Tables<'fuel_entries'>;
export type FuelEntryInsert = TablesInsert<'fuel_entries'>;
export type FuelEntryUpdate = TablesUpdate<'fuel_entries'>;

export function useFuelEntries(vehicleId?: string) {
  return useQuery({
    queryKey: ['fuel_entries', vehicleId],
    queryFn: async () => {
      let query = supabase
        .from('fuel_entries')
        .select(`
          *,
          vehicle:vehicles(id, immatriculation, marque, modele),
          station:stations(id, nom)
        `)
        .order('date', { ascending: false });

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateFuelEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: FuelEntryInsert) => {
      // Calculer la consommation et le coût/km
      const distance = entry.km_compteur - (entry.km_precedent || 0);
      const consommation = distance > 0 ? (entry.litres / distance) * 100 : null;
      const cout_km = distance > 0 ? entry.montant / distance : null;

      const { data, error } = await supabase
        .from('fuel_entries')
        .insert({
          ...entry,
          distance,
          consommation,
          cout_km,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel_entries'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
}

export function useUpdateFuelEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...entry }: FuelEntryUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('fuel_entries')
        .update(entry)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel_entries'] });
    },
  });
}

export function useDeleteFuelEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('fuel_entries').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuel_entries'] });
    },
  });
}
