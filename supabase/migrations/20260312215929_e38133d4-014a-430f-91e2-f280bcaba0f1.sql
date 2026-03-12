
-- Replace the permissive insert policy with one scoped to authenticated users
DROP POLICY IF EXISTS "Service insert audit_events" ON public.audit_events;

-- Only authenticated users (via triggers) can insert
CREATE POLICY "Authenticated insert audit_events" ON public.audit_events
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);
