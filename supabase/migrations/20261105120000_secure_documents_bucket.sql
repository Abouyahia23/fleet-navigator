-- Le bucket "documents" était public et lisible sans authentification.
-- On le rend privé et on limite la lecture aux utilisateurs connectés.
UPDATE storage.buckets SET public = false WHERE id = 'documents';

DROP POLICY IF EXISTS "Documents publicly readable" ON storage.objects;

CREATE POLICY "Authenticated can read documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');
