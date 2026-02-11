import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminDocument {
  id: string;
  vehicle_id: string;
  type: string;
  numero: string | null;
  date_debut: string | null;
  date_expiration: string | null;
  fichier_url: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export function useAdminDocuments(vehicleId?: string) {
  return useQuery({
    queryKey: ['admin_documents', vehicleId],
    queryFn: async () => {
      let query = supabase
        .from('admin_documents')
        .select('*')
        .order('date_expiration', { ascending: true });

      if (vehicleId) {
        query = query.eq('vehicle_id', vehicleId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AdminDocument[];
    },
  });
}

export function useCreateAdminDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (doc: Omit<AdminDocument, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('admin_documents')
        .insert(doc)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_documents'] });
    },
  });
}

export function useDeleteAdminDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('admin_documents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_documents'] });
    },
  });
}
