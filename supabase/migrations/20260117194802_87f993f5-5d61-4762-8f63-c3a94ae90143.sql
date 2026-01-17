-- Fonction pour vérifier si un admin existe (accessible publiquement sans authentification)
CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE role = 'admin'
  )
$$;

-- Accorder l'accès à la fonction pour les utilisateurs anonymes
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO authenticated;

-- Modifier le trigger pour promouvoir le premier utilisateur en admin
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count integer;
BEGIN
  -- Créer le profil
  INSERT INTO public.profiles (user_id, nom, prenom, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nom', NEW.email),
    NEW.raw_user_meta_data->>'prenom',
    NEW.email
  );
  
  -- Vérifier s'il y a déjà un admin
  SELECT COUNT(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  -- Si aucun admin, le premier utilisateur devient admin
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'utilisateur');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Créer la table des alertes
CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('assurance', 'ct', 'gpl', 'vignette', 'consommation', 'immobilisation', 'maintenance')),
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE CASCADE,
  message text NOT NULL,
  priority text NOT NULL DEFAULT 'normale' CHECK (priority IN ('urgente', 'haute', 'normale', 'basse')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'read', 'resolved')),
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activer RLS sur alerts
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Policies pour alerts
CREATE POLICY "Alerts viewable by authenticated"
ON public.alerts FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Gestionnaires can manage alerts"
ON public.alerts FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'gestionnaire'::user_role));

-- Ajouter colonne actif à profiles si elle n'existe pas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS actif boolean DEFAULT true;

-- Trigger pour updated_at sur alerts
CREATE TRIGGER update_alerts_updated_at
BEFORE UPDATE ON public.alerts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Permettre aux admins de modifier tous les profils
CREATE POLICY "Admins can update all profiles"
ON public.profiles FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::user_role));

-- Permettre aux admins de voir tous les roles
CREATE POLICY "Admins and users can view roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::user_role));