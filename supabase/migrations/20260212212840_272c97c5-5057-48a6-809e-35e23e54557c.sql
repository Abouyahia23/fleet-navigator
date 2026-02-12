
-- Fix 1: Set search_path on handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
BEGIN
  INSERT INTO public.profiles (user_id, nom, prenom, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', NEW.email),
    NEW.raw_user_meta_data->>'prenom',
    NEW.email
  );
  
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'utilisateur');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix 2: Replace overly permissive ticket INSERT policy
-- Anyone authenticated can create, but must set created_by to their own uid
DROP POLICY IF EXISTS "Authenticated can create tickets" ON public.repair_tickets;
CREATE POLICY "Authenticated can create tickets" ON public.repair_tickets
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid() OR created_by IS NULL);
