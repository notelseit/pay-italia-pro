-- Create visit checklists table
CREATE TABLE IF NOT EXISTS public.visit_checklists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES medical_visits(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  checklist_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create medical documents table
CREATE TABLE IF NOT EXISTS public.medical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  medical_record_id UUID REFERENCES medical_records(id) ON DELETE SET NULL,
  visit_id UUID REFERENCES medical_visits(id) ON DELETE SET NULL,
  document_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  notes TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visit_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visit_checklists
CREATE POLICY "Users can view checklists in their company"
  ON public.visit_checklists FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Admins and HR can manage checklists"
  ON public.visit_checklists FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = visit_checklists.company_id 
      AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
    )
  );

-- RLS Policies for medical_documents
CREATE POLICY "Users can view documents in their company"
  ON public.medical_documents FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Admins and HR can manage documents"
  ON public.medical_documents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = medical_documents.company_id 
      AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
    )
  );

-- Create indexes
CREATE INDEX idx_visit_checklists_visit ON visit_checklists(visit_id);
CREATE INDEX idx_visit_checklists_employee ON visit_checklists(employee_id);
CREATE INDEX idx_medical_documents_employee ON medical_documents(employee_id);
CREATE INDEX idx_medical_documents_record ON medical_documents(medical_record_id);

-- Create triggers
CREATE TRIGGER update_visit_checklists_updated_at
  BEFORE UPDATE ON visit_checklists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medical_documents_updated_at
  BEFORE UPDATE ON medical_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();