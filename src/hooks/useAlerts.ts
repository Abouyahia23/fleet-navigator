import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Alert {
  id: string;
  type: 'assurance' | 'ct' | 'gpl' | 'vignette' | 'consommation' | 'immobilisation' | 'maintenance';
  vehicle_id: string | null;
  message: string;
  priority: 'urgente' | 'haute' | 'normale' | 'basse';
  status: 'active' | 'read' | 'resolved';
  due_date: string | null;
  created_at: string;
  updated_at: string;
  vehicle?: {
    id: string;
    immatriculation: string;
    marque: string;
    modele: string;
  };
}

export function useAlerts(filters?: {
  status?: string;
  priority?: string;
  type?: string;
}) {
  return useQuery({
    queryKey: ['alerts', filters],
    queryFn: async () => {
      let query = supabase
        .from('alerts')
        .select(`
          *,
          vehicle:vehicles(id, immatriculation, marque, modele)
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Alert[];
    },
  });
}

export function useActiveAlertsCount() {
  return useQuery({
    queryKey: ['alerts_count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      if (error) throw error;
      return count || 0;
    },
  });
}

export function useMarkAlertAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('alerts')
        .update({ status: 'read' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts_count'] });
    },
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('alerts')
        .update({ status: 'resolved' })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts_count'] });
    },
  });
}

export function useDeleteAlert() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('alerts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts_count'] });
    },
  });
}

export function useGenerateAlerts() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      // Récupérer tous les véhicules actifs
      const { data: vehicles, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('statut', 'Actif');

      if (vehiclesError) throw vehiclesError;

      const today = new Date();
      const alerts: Array<{
        type: string;
        vehicle_id: string;
        message: string;
        priority: string;
        due_date: string | null;
      }> = [];

      for (const vehicle of vehicles || []) {
        // Vérifier l'assurance
        if (vehicle.fin_assurance) {
          const finAssurance = new Date(vehicle.fin_assurance);
          const daysUntil = Math.ceil((finAssurance.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 30 && daysUntil > 0) {
            alerts.push({
              type: 'assurance',
              vehicle_id: vehicle.id,
              message: `Assurance expire dans ${daysUntil} jours pour ${vehicle.immatriculation}`,
              priority: daysUntil <= 7 ? 'urgente' : daysUntil <= 15 ? 'haute' : 'normale',
              due_date: vehicle.fin_assurance,
            });
          } else if (daysUntil <= 0) {
            alerts.push({
              type: 'assurance',
              vehicle_id: vehicle.id,
              message: `Assurance expirée pour ${vehicle.immatriculation}`,
              priority: 'urgente',
              due_date: vehicle.fin_assurance,
            });
          }
        }

        // Vérifier le contrôle technique
        if (vehicle.fin_ct) {
          const finCT = new Date(vehicle.fin_ct);
          const daysUntil = Math.ceil((finCT.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 30 && daysUntil > 0) {
            alerts.push({
              type: 'ct',
              vehicle_id: vehicle.id,
              message: `CT expire dans ${daysUntil} jours pour ${vehicle.immatriculation}`,
              priority: daysUntil <= 7 ? 'urgente' : daysUntil <= 15 ? 'haute' : 'normale',
              due_date: vehicle.fin_ct,
            });
          } else if (daysUntil <= 0) {
            alerts.push({
              type: 'ct',
              vehicle_id: vehicle.id,
              message: `CT expiré pour ${vehicle.immatriculation}`,
              priority: 'urgente',
              due_date: vehicle.fin_ct,
            });
          }
        }

        // Vérifier GPL
        if (vehicle.fin_gpl) {
          const finGPL = new Date(vehicle.fin_gpl);
          const daysUntil = Math.ceil((finGPL.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysUntil <= 30 && daysUntil > 0) {
            alerts.push({
              type: 'gpl',
              vehicle_id: vehicle.id,
              message: `Contrôle GPL expire dans ${daysUntil} jours pour ${vehicle.immatriculation}`,
              priority: daysUntil <= 7 ? 'urgente' : 'normale',
              due_date: vehicle.fin_gpl,
            });
          }
        }
      }

      // Supprimer les anciennes alertes actives et en créer de nouvelles
      if (alerts.length > 0) {
        await supabase
          .from('alerts')
          .delete()
          .eq('status', 'active');

        const { error } = await supabase.from('alerts').insert(alerts);
        if (error) throw error;
      }

      return alerts.length;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      queryClient.invalidateQueries({ queryKey: ['alerts_count'] });
    },
  });
}
