
-- Pack 4: Create vehicle-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-images', 'vehicle-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for vehicle-images
CREATE POLICY "Admin full access vehicle images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'vehicle-images' AND public.has_role(auth.uid(), 'admin'::public.user_role))
WITH CHECK (bucket_id = 'vehicle-images' AND public.has_role(auth.uid(), 'admin'::public.user_role));

CREATE POLICY "Gestionnaire upload own vehicle images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'vehicle-images'
  AND public.has_role(auth.uid(), 'gestionnaire'::public.user_role)
);

CREATE POLICY "Gestionnaire update own vehicle images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'vehicle-images'
  AND public.has_role(auth.uid(), 'gestionnaire'::public.user_role)
);

CREATE POLICY "Gestionnaire delete own vehicle images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'vehicle-images'
  AND public.has_role(auth.uid(), 'gestionnaire'::public.user_role)
);

CREATE POLICY "Public read vehicle images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'vehicle-images');

-- Pack 3: RLS policy for edge function to write alerts (service role bypasses RLS, but let's also allow utilisateur read)
DROP POLICY IF EXISTS "Utilisateur read alerts" ON public.alerts;
CREATE POLICY "Utilisateur read own alerts"
ON public.alerts
FOR SELECT
TO authenticated
USING (
  has_role(auth.uid(), 'utilisateur'::user_role)
  AND vehicle_id IS NULL
);
