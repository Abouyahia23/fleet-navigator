
-- Helper: get current user's profile ID
CREATE OR REPLACE FUNCTION public.get_my_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- ============================================================
-- DROP ALL EXISTING POLICIES
-- ============================================================

-- vehicles
DROP POLICY IF EXISTS "Gestionnaires can manage vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Vehicles viewable by authenticated" ON public.vehicles;

-- fuel_entries
DROP POLICY IF EXISTS "Authenticated can insert fuel entries" ON public.fuel_entries;
DROP POLICY IF EXISTS "Fuel entries viewable by authenticated" ON public.fuel_entries;
DROP POLICY IF EXISTS "Gestionnaires can manage fuel entries" ON public.fuel_entries;

-- repair_tickets
DROP POLICY IF EXISTS "Authenticated can create tickets" ON public.repair_tickets;
DROP POLICY IF EXISTS "Gestionnaires can manage tickets" ON public.repair_tickets;
DROP POLICY IF EXISTS "Tickets viewable by authenticated" ON public.repair_tickets;

-- work_orders
DROP POLICY IF EXISTS "Gestionnaires can manage work orders" ON public.work_orders;
DROP POLICY IF EXISTS "Work orders viewable by authenticated" ON public.work_orders;

-- expenses
DROP POLICY IF EXISTS "Expenses viewable by authenticated" ON public.expenses;
DROP POLICY IF EXISTS "Gestionnaires can manage expenses" ON public.expenses;

-- scheduled_maintenance
DROP POLICY IF EXISTS "Gestionnaires can manage scheduled maintenance" ON public.scheduled_maintenance;
DROP POLICY IF EXISTS "Scheduled maintenance viewable by authenticated" ON public.scheduled_maintenance;

-- alerts
DROP POLICY IF EXISTS "Alerts viewable by authenticated" ON public.alerts;
DROP POLICY IF EXISTS "Gestionnaires can manage alerts" ON public.alerts;

-- admin_documents
DROP POLICY IF EXISTS "Admin documents viewable by authenticated" ON public.admin_documents;
DROP POLICY IF EXISTS "Gestionnaires can manage admin documents" ON public.admin_documents;

-- profiles
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- user_roles
DROP POLICY IF EXISTS "Admins and users can view roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- reference tables
DROP POLICY IF EXISTS "Admins can manage sites" ON public.sites;
DROP POLICY IF EXISTS "Sites viewable by authenticated" ON public.sites;
DROP POLICY IF EXISTS "Admins can manage structures" ON public.structures;
DROP POLICY IF EXISTS "Structures viewable by authenticated" ON public.structures;
DROP POLICY IF EXISTS "Admins can manage stations" ON public.stations;
DROP POLICY IF EXISTS "Stations viewable by authenticated" ON public.stations;
DROP POLICY IF EXISTS "Gestionnaires can manage prestataires" ON public.prestataires;
DROP POLICY IF EXISTS "Prestataires viewable by authenticated" ON public.prestataires;
DROP POLICY IF EXISTS "Gestionnaires can manage chauffeurs" ON public.chauffeurs;
DROP POLICY IF EXISTS "Chauffeurs viewable by authenticated" ON public.chauffeurs;
DROP POLICY IF EXISTS "Gestionnaires can manage assignment history" ON public.vehicle_assignment_history;
DROP POLICY IF EXISTS "Assignment history viewable by authenticated" ON public.vehicle_assignment_history;
DROP POLICY IF EXISTS "Gestionnaires can manage gestionnaires" ON public.gestionnaires;
DROP POLICY IF EXISTS "Admins can manage gestionnaires" ON public.gestionnaires;
DROP POLICY IF EXISTS "Gestionnaires viewable by authenticated" ON public.gestionnaires;

-- ============================================================
-- PROFILES — everyone reads, users update own, admins update all
-- ============================================================
CREATE POLICY "Authenticated can read profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::user_role));

-- ============================================================
-- USER_ROLES — users read own, admins manage all
-- ============================================================
CREATE POLICY "Users can read own role" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins full access roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- ============================================================
-- VEHICLES
-- ============================================================
-- Admin: full access
CREATE POLICY "Admin full access vehicles" ON public.vehicles
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- Gestionnaire: CRUD on own vehicles (gestionnaire_id = profile.id)
CREATE POLICY "Gestionnaire read own vehicles" ON public.vehicles
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND gestionnaire_id = get_my_profile_id());

CREATE POLICY "Gestionnaire update own vehicles" ON public.vehicles
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND gestionnaire_id = get_my_profile_id())
  WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND gestionnaire_id = get_my_profile_id());

CREATE POLICY "Gestionnaire insert vehicles" ON public.vehicles
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role));

-- ============================================================
-- FUEL_ENTRIES — Admin full, Gestionnaire own vehicles, authenticated insert
-- ============================================================
CREATE POLICY "Admin full access fuel" ON public.fuel_entries
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Gestionnaire read own fuel" ON public.fuel_entries
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = fuel_entries.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire insert own fuel" ON public.fuel_entries
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = fuel_entries.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire update own fuel" ON public.fuel_entries
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = fuel_entries.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

-- ============================================================
-- REPAIR_TICKETS — same pattern
-- ============================================================
CREATE POLICY "Admin full access tickets" ON public.repair_tickets
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Gestionnaire read own tickets" ON public.repair_tickets
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = repair_tickets.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire insert tickets" ON public.repair_tickets
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = repair_tickets.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire update own tickets" ON public.repair_tickets
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = repair_tickets.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

-- Authenticated can create tickets (any user can report)
CREATE POLICY "Authenticated can create tickets" ON public.repair_tickets
  FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================================
-- WORK_ORDERS
-- ============================================================
CREATE POLICY "Admin full access work_orders" ON public.work_orders
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Gestionnaire read own work_orders" ON public.work_orders
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = work_orders.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire insert own work_orders" ON public.work_orders
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = work_orders.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire update own work_orders" ON public.work_orders
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = work_orders.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

-- ============================================================
-- EXPENSES
-- ============================================================
CREATE POLICY "Admin full access expenses" ON public.expenses
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Gestionnaire read own expenses" ON public.expenses
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = expenses.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire insert own expenses" ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = expenses.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire update own expenses" ON public.expenses
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = expenses.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

-- ============================================================
-- SCHEDULED_MAINTENANCE
-- ============================================================
CREATE POLICY "Admin full access maintenance" ON public.scheduled_maintenance
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Gestionnaire read own maintenance" ON public.scheduled_maintenance
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = scheduled_maintenance.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire insert own maintenance" ON public.scheduled_maintenance
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = scheduled_maintenance.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire update own maintenance" ON public.scheduled_maintenance
  FOR UPDATE TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = scheduled_maintenance.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

-- ============================================================
-- ALERTS
-- ============================================================
CREATE POLICY "Admin full access alerts" ON public.alerts
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Gestionnaire read own alerts" ON public.alerts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND (
    vehicle_id IS NULL OR EXISTS (
      SELECT 1 FROM public.vehicles v WHERE v.id = alerts.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
    )
  ));

-- ============================================================
-- ADMIN_DOCUMENTS
-- ============================================================
CREATE POLICY "Admin full access documents" ON public.admin_documents
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Gestionnaire read own documents" ON public.admin_documents
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = admin_documents.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire insert own documents" ON public.admin_documents
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = admin_documents.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

-- ============================================================
-- VEHICLE_ASSIGNMENT_HISTORY
-- ============================================================
CREATE POLICY "Admin full access assignments" ON public.vehicle_assignment_history
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Gestionnaire read own assignments" ON public.vehicle_assignment_history
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_assignment_history.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

CREATE POLICY "Gestionnaire insert own assignments" ON public.vehicle_assignment_history
  FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (
    SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_assignment_history.vehicle_id AND v.gestionnaire_id = get_my_profile_id()
  ));

-- ============================================================
-- REFERENCE TABLES — everyone reads, admin manages
-- ============================================================

-- SITES
CREATE POLICY "Authenticated read sites" ON public.sites
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage sites" ON public.sites
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- STRUCTURES
CREATE POLICY "Authenticated read structures" ON public.structures
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage structures" ON public.structures
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- STATIONS
CREATE POLICY "Authenticated read stations" ON public.stations
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage stations" ON public.stations
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));

-- PRESTATAIRES
CREATE POLICY "Authenticated read prestataires" ON public.prestataires
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage prestataires" ON public.prestataires
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Gestionnaire manage prestataires" ON public.prestataires
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role))
  WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role));

-- CHAUFFEURS
CREATE POLICY "Authenticated read chauffeurs" ON public.chauffeurs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage chauffeurs" ON public.chauffeurs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Gestionnaire manage chauffeurs" ON public.chauffeurs
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'gestionnaire'::user_role))
  WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role));

-- GESTIONNAIRES
CREATE POLICY "Authenticated read gestionnaires" ON public.gestionnaires
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin manage gestionnaires" ON public.gestionnaires
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::user_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
