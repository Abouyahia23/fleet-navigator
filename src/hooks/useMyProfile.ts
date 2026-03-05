import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useMyProfile() {
  const { user } = useAuth();

  const { data, isLoading, error } = useQuery({
    queryKey: ['myProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, nom, prenom, email')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching my profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  return {
    profileId: data?.id ?? null,
    profile: data,
    isLoading,
    error,
  };
}
