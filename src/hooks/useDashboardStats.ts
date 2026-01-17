import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalVehicles: number;
  activeVehicles: number;
  immobilizedVehicles: number;
  openTickets: number;
  openWorkOrders: number;
  monthlyFuelCost: number;
  monthlyMaintenanceCost: number;
  alertsCount: number;
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard_stats'],
    queryFn: async () => {
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
      const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

      // Statistiques des véhicules
      const { count: totalVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true });

      const { count: activeVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'Actif');

      const { count: immobilizedVehicles } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('statut', 'Immobilisé');

      // Tickets ouverts
      const { count: openTickets } = await supabase
        .from('repair_tickets')
        .select('*', { count: 'exact', head: true })
        .in('statut', ['Ouvert', 'En cours']);

      // OT ouverts
      const { count: openWorkOrders } = await supabase
        .from('work_orders')
        .select('*', { count: 'exact', head: true })
        .in('statut', ['Ouvert', 'En cours']);

      // Coût carburant du mois
      const { data: fuelData } = await supabase
        .from('fuel_entries')
        .select('montant')
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth);

      const monthlyFuelCost = fuelData?.reduce((sum, entry) => sum + (entry.montant || 0), 0) || 0;

      // Coût maintenance du mois
      const { data: expenseData } = await supabase
        .from('expenses')
        .select('montant')
        .gte('date', firstDayOfMonth)
        .lte('date', lastDayOfMonth);

      const monthlyMaintenanceCost = expenseData?.reduce((sum, expense) => sum + (expense.montant || 0), 0) || 0;

      // Alertes actives
      const { count: alertsCount } = await supabase
        .from('alerts')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      return {
        totalVehicles: totalVehicles || 0,
        activeVehicles: activeVehicles || 0,
        immobilizedVehicles: immobilizedVehicles || 0,
        openTickets: openTickets || 0,
        openWorkOrders: openWorkOrders || 0,
        monthlyFuelCost,
        monthlyMaintenanceCost,
        alertsCount: alertsCount || 0,
      } as DashboardStats;
    },
  });
}
