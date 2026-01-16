import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdminExists() {
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminExists = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('id')
        .eq('role', 'admin')
        .limit(1);

      if (error) {
        console.error('Error checking admin exists:', error);
        // If there's an error, assume admin exists to show normal login
        setAdminExists(true);
      } else {
        setAdminExists(data && data.length > 0);
      }
    } catch (error) {
      console.error('Error checking admin exists:', error);
      setAdminExists(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAdminExists();
  }, []);

  return { adminExists, isLoading, refetch: checkAdminExists };
}
