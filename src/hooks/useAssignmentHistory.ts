import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAssignmentHistory(vehicleId?: string) {
  return useQuery({
    queryKey: ['assignment-history', vehicleId],
    queryFn: async () => {
      let query = supabase
        .from('vehicle_assignment_history')
        .select('*')
        .order('date_debut', { ascending: false });

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!vehicleId,
  });
}

export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (assignment: {
      vehicle_id: string;
      affectataire: string;
      affectataire_type: 'Chauffeur' | 'Cadre' | 'Parc auto de direction' | 'Parc auto centrale';
      date_debut: string;
      date_fin?: string | null;
      observations?: string | null;
    }) => {
      const { data, error } = await supabase
        .from('vehicle_assignment_history')
        .insert([assignment])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignment-history'] });
    },
  });
}
