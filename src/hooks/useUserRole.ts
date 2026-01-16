import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type UserRole = 'admin' | 'gestionnaire' | 'utilisateur';

export function useUserRole() {
  const { user } = useAuth();

  const { data: role, isLoading } = useQuery({
    queryKey: ['userRole', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return 'utilisateur' as UserRole;
      }

      return data?.role as UserRole;
    },
    enabled: !!user?.id,
  });

  return {
    role: role || 'utilisateur',
    isLoading,
    isAdmin: role === 'admin',
    isGestionnaire: role === 'gestionnaire' || role === 'admin',
  };
}
