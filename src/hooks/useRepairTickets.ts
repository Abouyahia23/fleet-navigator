import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';

export type RepairTicket = Tables<'repair_tickets'>;
export type RepairTicketInsert = TablesInsert<'repair_tickets'>;
export type RepairTicketUpdate = TablesUpdate<'repair_tickets'>;

import type { Database } from '@/integrations/supabase/types';

type TicketStatus = Database['public']['Enums']['ticket_status'];
type TicketPriority = Database['public']['Enums']['ticket_priority'];

export function useRepairTickets(filters?: {
  status?: TicketStatus;
  priority?: TicketPriority;
  vehicleId?: string;
}) {
  return useQuery({
    queryKey: ['repair_tickets', filters],
    queryFn: async () => {
      let query = supabase
        .from('repair_tickets')
        .select(`
          *,
          vehicle:vehicles(id, immatriculation, marque, modele),
          chauffeur:chauffeurs(id, nom, prenom),
          prestataire:prestataires(id, nom)
        `)
        .order('date_demande', { ascending: false });

      if (filters?.status) {
        query = query.eq('statut', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priorite', filters.priority);
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

export function useCreateRepairTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ticket: RepairTicketInsert) => {
      const { data, error } = await supabase
        .from('repair_tickets')
        .insert(ticket)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair_tickets'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard_stats'] });
    },
  });
}

export function useUpdateRepairTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...ticket }: RepairTicketUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('repair_tickets')
        .update(ticket)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair_tickets'] });
    },
  });
}

export function useDeleteRepairTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('repair_tickets').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repair_tickets'] });
    },
  });
}
