
-- Drop all RESTRICTIVE policies and recreate as PERMISSIVE

-- VEHICLES
DROP POLICY IF EXISTS "Admin full access vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Gestionnaire read own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Gestionnaire update own vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Gestionnaire insert vehicles" ON public.vehicles;

CREATE POLICY "Admin full access vehicles" ON public.vehicles FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Gestionnaire read own vehicles" ON public.vehicles FOR SELECT USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND gestionnaire_id = get_my_profile_id());
CREATE POLICY "Gestionnaire update own vehicles" ON public.vehicles FOR UPDATE USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND gestionnaire_id = get_my_profile_id()) WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND gestionnaire_id = get_my_profile_id());
CREATE POLICY "Gestionnaire insert vehicles" ON public.vehicles FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role));

-- FUEL_ENTRIES
DROP POLICY IF EXISTS "Admin full access fuel" ON public.fuel_entries;
DROP POLICY IF EXISTS "Gestionnaire read own fuel" ON public.fuel_entries;
DROP POLICY IF EXISTS "Gestionnaire insert own fuel" ON public.fuel_entries;
DROP POLICY IF EXISTS "Gestionnaire update own fuel" ON public.fuel_entries;

CREATE POLICY "Admin full access fuel" ON public.fuel_entries FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Gestionnaire read own fuel" ON public.fuel_entries FOR SELECT USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = fuel_entries.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire insert own fuel" ON public.fuel_entries FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = fuel_entries.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire update own fuel" ON public.fuel_entries FOR UPDATE USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = fuel_entries.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));

-- REPAIR_TICKETS
DROP POLICY IF EXISTS "Admin full access tickets" ON public.repair_tickets;
DROP POLICY IF EXISTS "Gestionnaire read own tickets" ON public.repair_tickets;
DROP POLICY IF EXISTS "Gestionnaire insert tickets" ON public.repair_tickets;
DROP POLICY IF EXISTS "Gestionnaire update own tickets" ON public.repair_tickets;
DROP POLICY IF EXISTS "Authenticated can create tickets" ON public.repair_tickets;

CREATE POLICY "Admin full access tickets" ON public.repair_tickets FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Gestionnaire read own tickets" ON public.repair_tickets FOR SELECT USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = repair_tickets.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire insert tickets" ON public.repair_tickets FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = repair_tickets.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire update own tickets" ON public.repair_tickets FOR UPDATE USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = repair_tickets.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Authenticated can create tickets" ON public.repair_tickets FOR INSERT WITH CHECK ((created_by = auth.uid()) OR (created_by IS NULL));

-- WORK_ORDERS
DROP POLICY IF EXISTS "Admin full access work_orders" ON public.work_orders;
DROP POLICY IF EXISTS "Gestionnaire read own work_orders" ON public.work_orders;
DROP POLICY IF EXISTS "Gestionnaire insert own work_orders" ON public.work_orders;
DROP POLICY IF EXISTS "Gestionnaire update own work_orders" ON public.work_orders;

CREATE POLICY "Admin full access work_orders" ON public.work_orders FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Gestionnaire read own work_orders" ON public.work_orders FOR SELECT USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = work_orders.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire insert own work_orders" ON public.work_orders FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = work_orders.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire update own work_orders" ON public.work_orders FOR UPDATE USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = work_orders.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));

-- EXPENSES
DROP POLICY IF EXISTS "Admin full access expenses" ON public.expenses;
DROP POLICY IF EXISTS "Gestionnaire read own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Gestionnaire insert own expenses" ON public.expenses;
DROP POLICY IF EXISTS "Gestionnaire update own expenses" ON public.expenses;

CREATE POLICY "Admin full access expenses" ON public.expenses FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Gestionnaire read own expenses" ON public.expenses FOR SELECT USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = expenses.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire insert own expenses" ON public.expenses FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = expenses.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire update own expenses" ON public.expenses FOR UPDATE USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = expenses.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));

-- SCHEDULED_MAINTENANCE
DROP POLICY IF EXISTS "Admin full access maintenance" ON public.scheduled_maintenance;
DROP POLICY IF EXISTS "Gestionnaire read own maintenance" ON public.scheduled_maintenance;
DROP POLICY IF EXISTS "Gestionnaire insert own maintenance" ON public.scheduled_maintenance;
DROP POLICY IF EXISTS "Gestionnaire update own maintenance" ON public.scheduled_maintenance;

CREATE POLICY "Admin full access maintenance" ON public.scheduled_maintenance FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Gestionnaire read own maintenance" ON public.scheduled_maintenance FOR SELECT USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = scheduled_maintenance.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire insert own maintenance" ON public.scheduled_maintenance FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = scheduled_maintenance.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire update own maintenance" ON public.scheduled_maintenance FOR UPDATE USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = scheduled_maintenance.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));

-- ALERTS
DROP POLICY IF EXISTS "Admin full access alerts" ON public.alerts;
DROP POLICY IF EXISTS "Gestionnaire read own alerts" ON public.alerts;

CREATE POLICY "Admin full access alerts" ON public.alerts FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Gestionnaire read own alerts" ON public.alerts FOR SELECT USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND (vehicle_id IS NULL OR EXISTS (SELECT 1 FROM vehicles v WHERE v.id = alerts.vehicle_id AND v.gestionnaire_id = get_my_profile_id())));

-- ADMIN_DOCUMENTS
DROP POLICY IF EXISTS "Admin full access documents" ON public.admin_documents;
DROP POLICY IF EXISTS "Gestionnaire read own documents" ON public.admin_documents;
DROP POLICY IF EXISTS "Gestionnaire insert own documents" ON public.admin_documents;

CREATE POLICY "Admin full access documents" ON public.admin_documents FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Gestionnaire read own documents" ON public.admin_documents FOR SELECT USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = admin_documents.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire insert own documents" ON public.admin_documents FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = admin_documents.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));

-- VEHICLE_ASSIGNMENT_HISTORY
DROP POLICY IF EXISTS "Admin full access assignments" ON public.vehicle_assignment_history;
DROP POLICY IF EXISTS "Gestionnaire read own assignments" ON public.vehicle_assignment_history;
DROP POLICY IF EXISTS "Gestionnaire insert own assignments" ON public.vehicle_assignment_history;

CREATE POLICY "Admin full access assignments" ON public.vehicle_assignment_history FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Gestionnaire read own assignments" ON public.vehicle_assignment_history FOR SELECT USING (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = vehicle_assignment_history.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));
CREATE POLICY "Gestionnaire insert own assignments" ON public.vehicle_assignment_history FOR INSERT WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role) AND EXISTS (SELECT 1 FROM vehicles v WHERE v.id = vehicle_assignment_history.vehicle_id AND v.gestionnaire_id = get_my_profile_id()));

-- REFERENTIAL TABLES
DROP POLICY IF EXISTS "Admin manage sites" ON public.sites;
DROP POLICY IF EXISTS "Authenticated read sites" ON public.sites;
CREATE POLICY "Admin manage sites" ON public.sites FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Authenticated read sites" ON public.sites FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage structures" ON public.structures;
DROP POLICY IF EXISTS "Authenticated read structures" ON public.structures;
CREATE POLICY "Admin manage structures" ON public.structures FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Authenticated read structures" ON public.structures FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage stations" ON public.stations;
DROP POLICY IF EXISTS "Authenticated read stations" ON public.stations;
CREATE POLICY "Admin manage stations" ON public.stations FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Authenticated read stations" ON public.stations FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage prestataires" ON public.prestataires;
DROP POLICY IF EXISTS "Authenticated read prestataires" ON public.prestataires;
DROP POLICY IF EXISTS "Gestionnaire manage prestataires" ON public.prestataires;
CREATE POLICY "Admin manage prestataires" ON public.prestataires FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Authenticated read prestataires" ON public.prestataires FOR SELECT USING (true);
CREATE POLICY "Gestionnaire manage prestataires" ON public.prestataires FOR ALL USING (has_role(auth.uid(), 'gestionnaire'::user_role)) WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role));

DROP POLICY IF EXISTS "Admin manage chauffeurs" ON public.chauffeurs;
DROP POLICY IF EXISTS "Authenticated read chauffeurs" ON public.chauffeurs;
DROP POLICY IF EXISTS "Gestionnaire manage chauffeurs" ON public.chauffeurs;
CREATE POLICY "Admin manage chauffeurs" ON public.chauffeurs FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Authenticated read chauffeurs" ON public.chauffeurs FOR SELECT USING (true);
CREATE POLICY "Gestionnaire manage chauffeurs" ON public.chauffeurs FOR ALL USING (has_role(auth.uid(), 'gestionnaire'::user_role)) WITH CHECK (has_role(auth.uid(), 'gestionnaire'::user_role));

DROP POLICY IF EXISTS "Admin manage gestionnaires" ON public.gestionnaires;
DROP POLICY IF EXISTS "Authenticated read gestionnaires" ON public.gestionnaires;
CREATE POLICY "Admin manage gestionnaires" ON public.gestionnaires FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Authenticated read gestionnaires" ON public.gestionnaires FOR SELECT USING (true);

-- PROFILES
DROP POLICY IF EXISTS "Authenticated can read profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Authenticated can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE USING (has_role(auth.uid(), 'admin'::user_role));

-- USER_ROLES
DROP POLICY IF EXISTS "Admins full access roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can read own role" ON public.user_roles;
CREATE POLICY "Admins full access roles" ON public.user_roles FOR ALL USING (has_role(auth.uid(), 'admin'::user_role)) WITH CHECK (has_role(auth.uid(), 'admin'::user_role));
CREATE POLICY "Users can read own role" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
