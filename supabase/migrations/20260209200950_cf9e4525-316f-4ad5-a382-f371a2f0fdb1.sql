
-- Add affectataire_type enum
CREATE TYPE public.affectataire_type AS ENUM ('Chauffeur', 'Cadre', 'Parc auto de direction', 'Parc auto centrale');

-- Add affectataire_type column to vehicles
ALTER TABLE public.vehicles ADD COLUMN affectataire_type public.affectataire_type NULL;

-- Create vehicle assignment history table
CREATE TABLE public.vehicle_assignment_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  affectataire TEXT NOT NULL,
  affectataire_type public.affectataire_type NOT NULL,
  date_debut DATE NOT NULL DEFAULT CURRENT_DATE,
  date_fin DATE NULL,
  observations TEXT NULL,
  created_by UUID NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.vehicle_assignment_history ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Assignment history viewable by authenticated"
ON public.vehicle_assignment_history FOR SELECT USING (true);

CREATE POLICY "Gestionnaires can manage assignment history"
ON public.vehicle_assignment_history FOR ALL
USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'gestionnaire'::user_role));
