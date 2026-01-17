import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAdminExists() {
  const [adminExists, setAdminExists] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAdminExists = async () => {
    setIsLoading(true);
    try {
      // Utiliser la fonction RPC sécurisée qui bypasse les RLS
      const { data, error } = await supabase.rpc('admin_exists');

      if (error) {
        console.error('Error checking admin exists:', error);
        // Si erreur, on assume qu'il n'y a pas d'admin pour permettre la création
        setAdminExists(false);
      } else {
        setAdminExists(data === true);
      }
    } catch (error) {
      console.error('Error checking admin exists:', error);
      setAdminExists(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAdminExists();
  }, []);

  return { adminExists, isLoading, refetch: checkAdminExists };
}
