
-- Pack 1: Fix vehicles RLS policies for gestionnaire

-- Drop existing flawed policies
DROP POLICY IF EXISTS "Gestionnaire insert vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Gestionnaire update own vehicles" ON public.vehicles;

-- INSERT: gestionnaire can only insert if gestionnaire_id = their profile id
CREATE POLICY "Gestionnaire insert own vehicles"
ON public.vehicles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'gestionnaire'::user_role)
  AND gestionnaire_id = get_my_profile_id()
);

-- UPDATE: gestionnaire can update own vehicles but cannot change gestionnaire_id
-- The USING clause checks ownership, WITH CHECK ensures gestionnaire_id stays the same
CREATE POLICY "Gestionnaire update own vehicles"
ON public.vehicles
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'gestionnaire'::user_role)
  AND gestionnaire_id = get_my_profile_id()
)
WITH CHECK (
  has_role(auth.uid(), 'gestionnaire'::user_role)
  AND gestionnaire_id = get_my_profile_id()
);
