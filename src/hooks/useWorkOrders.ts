import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type WorkOrder = Tables<'work_orders'>;
export type WorkOrderInsert = TablesInsert<'work_orders'>;
export type WorkOrderUpdate = TablesUpdate<'work_orders'>;

import type { Database } from '@/integrations/supabase/types';

type WorkOrderStatus = Database['public']['Enums']['work_order_status'];
type WorkOrderType = Database['public']['Enums']['work_order_type'];

export function useWorkOrders(filters?: {
  status?: WorkOrderStatus;
  type?: WorkOrderType;
  vehicleId?: string;
}) {
  return useQuery({
    queryKey: ['work_orders', filters],
    queryFn: async () => {
      let query = supabase
        .from('work_orders')
        .select(`
          *,
          vehicle:vehicles(id, immatriculation, marque, modele),
          prestataire:prestataires(id, nom),
          ticket:repair_tickets(id, numero, symptome)
        `)
        .order('date_ouverture', { ascending: false });

      if (filters?.status) {
        query = query.eq('statut', filters.status);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.vehicleId) {
        query = query.eq('vehicle_id', filters.vehicleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useCreateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workOrder: WorkOrderInsert) => {
      const { data, error } = await supabase
        .from('work_orders')
        .insert(workOrder)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
}

export function useUpdateWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...workOrder }: WorkOrderUpdate & { id: string }) => {
      // Calculer les jours d'immobilisation si date_sortie est définie
      let jours_immobilisation = workOrder.jours_immobilisation;
      if (workOrder.date_sortie && workOrder.date_entree) {
        const entree = new Date(workOrder.date_entree);
        const sortie = new Date(workOrder.date_sortie);
        jours_immobilisation = Math.ceil((sortie.getTime() - entree.getTime()) / (1000 * 60 * 60 * 24));
      }

      const { data, error } = await supabase
        .from('work_orders')
        .update({ ...workOrder, jours_immobilisation })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
    },
  });
}

export function useDeleteWorkOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('work_orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['work_orders'] });
    },
  });
}
