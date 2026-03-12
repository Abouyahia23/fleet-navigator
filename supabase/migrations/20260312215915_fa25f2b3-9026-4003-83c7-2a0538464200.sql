
-- 1. Add updated_by column to key tables
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.fuel_entries ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.repair_tickets ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.work_orders ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS updated_by uuid;
ALTER TABLE public.scheduled_maintenance ADD COLUMN IF NOT EXISTS updated_by uuid;

-- 2. Create audit_events table (append-only log)
CREATE TABLE IF NOT EXISTS public.audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  user_id uuid,
  changes jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_events_table ON public.audit_events(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_events_record ON public.audit_events(record_id);
CREATE INDEX IF NOT EXISTS idx_audit_events_created ON public.audit_events(created_at);

-- 3. Enable RLS on audit_events
ALTER TABLE public.audit_events ENABLE ROW LEVEL SECURITY;

-- Admin full access
CREATE POLICY "Admin full access audit_events" ON public.audit_events
  FOR ALL TO public
  USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Gestionnaire read own vehicle audit events
CREATE POLICY "Gestionnaire read own audit_events" ON public.audit_events
  FOR SELECT TO public
  USING (
    has_role(auth.uid(), 'gestionnaire') AND (
      user_id = auth.uid() OR
      (table_name = 'vehicles' AND EXISTS (
        SELECT 1 FROM vehicles v WHERE v.id = audit_events.record_id AND v.gestionnaire_id = get_my_profile_id()
      ))
    )
  );

-- Service role can insert (for triggers)
CREATE POLICY "Service insert audit_events" ON public.audit_events
  FOR INSERT TO public
  WITH CHECK (true);

-- 4. Generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_fn()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _user_id uuid;
  _record_id uuid;
  _changes jsonb;
BEGIN
  _user_id := auth.uid();
  
  IF TG_OP = 'DELETE' THEN
    _record_id := OLD.id;
    _changes := to_jsonb(OLD);
  ELSIF TG_OP = 'UPDATE' THEN
    _record_id := NEW.id;
    NEW.updated_at := now();
    NEW.updated_by := _user_id;
    -- Store only changed fields
    _changes := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSE -- INSERT
    _record_id := NEW.id;
    _changes := to_jsonb(NEW);
  END IF;

  INSERT INTO public.audit_events (table_name, record_id, action, user_id, changes)
  VALUES (TG_TABLE_NAME, _record_id, TG_OP, _user_id, _changes);

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- 5. Attach triggers to key tables
CREATE TRIGGER audit_vehicles
  AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_fuel_entries
  AFTER INSERT OR UPDATE OR DELETE ON public.fuel_entries
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_repair_tickets
  AFTER INSERT OR UPDATE OR DELETE ON public.repair_tickets
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_work_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.work_orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_expenses
  AFTER INSERT OR UPDATE OR DELETE ON public.expenses
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();

CREATE TRIGGER audit_scheduled_maintenance
  AFTER INSERT OR UPDATE OR DELETE ON public.scheduled_maintenance
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_fn();
