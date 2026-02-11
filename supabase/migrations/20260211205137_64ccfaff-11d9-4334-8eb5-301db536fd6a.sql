
-- Table pour les documents administratifs des véhicules
CREATE TABLE public.admin_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- assurance, carte_grise, visite_technique, vignette, gpl, etc.
  numero TEXT,
  date_debut DATE,
  date_expiration DATE,
  fichier_url TEXT,
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admin documents viewable by authenticated"
  ON public.admin_documents FOR SELECT USING (true);

CREATE POLICY "Gestionnaires can manage admin documents"
  ON public.admin_documents FOR ALL
  USING (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'gestionnaire'::user_role));

-- Trigger updated_at
CREATE TRIGGER update_admin_documents_updated_at
  BEFORE UPDATE ON public.admin_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for document files
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', true);

CREATE POLICY "Documents publicly readable"
  ON storage.objects FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'documents' AND auth.role() = 'authenticated');

CREATE POLICY "Gestionnaires can delete documents"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'documents' AND (has_role(auth.uid(), 'admin'::user_role) OR has_role(auth.uid(), 'gestionnaire'::user_role)));
