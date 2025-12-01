-- Create visit confirmations table
CREATE TABLE IF NOT EXISTS public.visit_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES medical_visits(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  confirmation_token UUID NOT NULL DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'pending',
  confirmed_at TIMESTAMP WITH TIME ZONE,
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create digital signatures table
CREATE TABLE IF NOT EXISTS public.digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  document_id UUID REFERENCES medical_documents(id) ON DELETE CASCADE,
  judgment_id UUID REFERENCES fitness_judgments(id) ON DELETE CASCADE,
  signed_by UUID NOT NULL REFERENCES auth.users(id),
  signature_data TEXT NOT NULL,
  signature_hash TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ip_address TEXT,
  user_agent TEXT,
  is_valid BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create DVR risks table
CREATE TABLE IF NOT EXISTS public.dvr_risks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  risk_code TEXT NOT NULL,
  risk_name TEXT NOT NULL,
  risk_category TEXT NOT NULL,
  description TEXT,
  severity_level TEXT,
  suggested_protocols JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.visit_confirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dvr_risks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for visit_confirmations
CREATE POLICY "Public can view confirmations by token"
  ON public.visit_confirmations FOR SELECT
  USING (true);

CREATE POLICY "Users can view confirmations in their company"
  ON public.visit_confirmations FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Admins and HR can manage confirmations"
  ON public.visit_confirmations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = visit_confirmations.company_id 
      AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
    )
  );

CREATE POLICY "Service role can update confirmations"
  ON public.visit_confirmations FOR UPDATE
  USING (auth.role() = 'service_role');

-- RLS Policies for digital_signatures
CREATE POLICY "Users can view signatures in their company"
  ON public.digital_signatures FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Authenticated users can create signatures"
  ON public.digital_signatures FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND signed_by = auth.uid()
  );

CREATE POLICY "Admins can manage signatures"
  ON public.digital_signatures FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = digital_signatures.company_id 
      AND role IN ('admin', 'superadmin')
    )
  );

-- RLS Policies for dvr_risks
CREATE POLICY "Users can view risks in their company"
  ON public.dvr_risks FOR SELECT
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Admins and HR can manage risks"
  ON public.dvr_risks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = dvr_risks.company_id 
      AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
    )
  );

-- Create indexes
CREATE INDEX idx_visit_confirmations_token ON visit_confirmations(confirmation_token);
CREATE INDEX idx_visit_confirmations_visit ON visit_confirmations(visit_id);
CREATE INDEX idx_digital_signatures_document ON digital_signatures(document_id);
CREATE INDEX idx_digital_signatures_judgment ON digital_signatures(judgment_id);
CREATE INDEX idx_dvr_risks_company ON dvr_risks(company_id);

-- Create triggers
CREATE TRIGGER update_visit_confirmations_updated_at
  BEFORE UPDATE ON visit_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_dvr_risks_updated_at
  BEFORE UPDATE ON dvr_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert common DVR risks
INSERT INTO public.dvr_risks (company_id, risk_code, risk_name, risk_category, description, severity_level, suggested_protocols)
SELECT 
  c.id,
  risk_data.risk_code,
  risk_data.risk_name,
  risk_data.risk_category,
  risk_data.description,
  risk_data.severity_level,
  risk_data.suggested_protocols
FROM companies c
CROSS JOIN (
  VALUES
    ('R001', 'Videoterminale', 'Ergonomico', 'Rischio da uso prolungato di VDT', 'medio', '["Protocollo Videoterminale"]'::jsonb),
    ('R002', 'Movimentazione Manuale Carichi', 'Biomeccanico', 'Sollevamento e trasporto manuale', 'alto', '["Protocollo Movimentazione Manuale Carichi"]'::jsonb),
    ('R003', 'Rumore', 'Fisico', 'Esposizione a rumore superiore a 80 dB', 'alto', '["Protocollo Rumore"]'::jsonb),
    ('R004', 'Vibrazioni', 'Fisico', 'Esposizione a vibrazioni mano-braccio o corpo intero', 'medio', '["Protocollo Vibrazioni"]'::jsonb),
    ('R005', 'Agenti Chimici', 'Chimico', 'Esposizione ad agenti chimici pericolosi', 'alto', '["Protocollo Agenti Chimici"]'::jsonb),
    ('R006', 'Lavoro Notturno', 'Organizzativo', 'Attività svolta in orario notturno', 'medio', '["Protocollo Lavoro Notturno"]'::jsonb),
    ('R007', 'Stress Lavoro-Correlato', 'Psicosociale', 'Condizioni di stress lavorativo', 'medio', '["Protocollo Stress Lavoro-Correlato"]'::jsonb),
    ('R008', 'Radiazioni Ionizzanti', 'Fisico', 'Esposizione a radiazioni ionizzanti', 'alto', '["Protocollo Radiazioni Ionizzanti"]'::jsonb)
) AS risk_data(risk_code, risk_name, risk_category, description, severity_level, suggested_protocols)
ON CONFLICT DO NOTHING;