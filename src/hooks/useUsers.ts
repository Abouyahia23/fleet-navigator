import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesUpdate } from '@/integrations/supabase/types';

export type Profile = Tables<'profiles'> & {
  actif?: boolean;
};
export type UserRole = Tables<'user_roles'>;

export interface UserWithRole extends Profile {
  role: 'admin' | 'gestionnaire' | 'utilisateur';
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      // Récupérer les profils
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('nom');

      if (profilesError) throw profilesError;

      // Récupérer les rôles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combiner profils et rôles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          ...profile,
          role: (userRole?.role as 'admin' | 'gestionnaire' | 'utilisateur') || 'utilisateur',
        };
      });

      return usersWithRoles;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'gestionnaire' | 'utilisateur' }) => {
      const { data, error } = await supabase
        .from('user_roles')
        .update({ role })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...profile }: TablesUpdate<'profiles'> & { id: string }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(profile)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useToggleUserActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, actif }: { id: string; actif: boolean }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ actif })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
