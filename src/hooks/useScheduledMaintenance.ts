import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type ScheduledMaintenance = Tables<'scheduled_maintenance'>;
export type ScheduledMaintenanceInsert = TablesInsert<'scheduled_maintenance'>;
export type ScheduledMaintenanceUpdate = TablesUpdate<'scheduled_maintenance'>;

import type { Database } from '@/integrations/supabase/types';

type RdvStatus = Database['public']['Enums']['rdv_status'];

export function useScheduledMaintenance(filters?: {
  dateFrom?: string;
  dateTo?: string;
  status?: RdvStatus;
}) {
  return useQuery({
    queryKey: ['scheduled_maintenance', filters],
    queryFn: async () => {
      let query = supabase
        .from('scheduled_maintenance')
        .select(`
          *,
          vehicle:vehicles(id, immatriculation, marque, modele),
          chauffeur:chauffeurs(id, nom, prenom),
          prestataire:prestataires(id, nom)
        `)
        .order('date_rdv', { ascending: true });

      if (filters?.dateFrom) {
        query = query.gte('date_rdv', filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte('date_rdv', filters.dateTo);
      }
      if (filters?.status) {
        query = query.eq('statut_rdv', filters.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateScheduledMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (maintenance: ScheduledMaintenanceInsert) => {
      const { data, error } = await supabase
        .from('scheduled_maintenance')
        .insert(maintenance)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled_maintenance'] });
    },
  });
}

export function useUpdateScheduledMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...maintenance }: ScheduledMaintenanceUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('scheduled_maintenance')
        .update(maintenance)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled_maintenance'] });
    },
  });
}

export function useDeleteScheduledMaintenance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('scheduled_maintenance').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scheduled_maintenance'] });
    },
  });
}
