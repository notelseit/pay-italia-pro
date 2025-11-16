-- Tabella per i protocolli sanitari
CREATE TABLE public.medical_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  reference_law TEXT, -- D.Lgs. 81/08, D.Lgs. 101/20, etc.
  risk_assessment TEXT, -- VDR - Valutazione Dei Rischi
  allegato_3b_mapping JSONB, -- Mappatura Allegato 3B D.Lgs. 81/08
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per le cartelle sanitarie e di rischio
CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  protocol_id UUID REFERENCES public.medical_protocols(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, suspended, closed
  risk_profile JSONB, -- profilo di rischio del lavoratore
  work_history TEXT, -- anamnesi lavorativa
  personal_history TEXT, -- anamnesi personale
  family_history TEXT, -- anamnesi familiare
  remote_pathology TEXT, -- patologica remota
  recent_pathology TEXT, -- patologica prossima
  notes TEXT,
  opened_at TIMESTAMPTZ DEFAULT now(),
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per le visite mediche
CREATE TABLE public.medical_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE,
  visit_type TEXT NOT NULL, -- preventiva, periodica, cambio_mansione, richiesta_lavoratore, fine_rapporto
  scheduled_date DATE NOT NULL,
  completed_date DATE,
  doctor_name TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  objective_examination TEXT, -- esame obiettivo
  target_organs TEXT, -- organi bersaglio
  additional_tests JSONB, -- accertamenti aggiuntivi
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per i giudizi di idoneità
CREATE TABLE public.fitness_judgments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES public.medical_visits(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  judgment_type TEXT NOT NULL, -- idoneo, idoneo_con_prescrizioni, non_idoneo, idoneo_temporaneamente
  judgment_date DATE NOT NULL,
  expiry_date DATE,
  prescriptions TEXT, -- prescrizioni e limitazioni
  limitations TEXT,
  notes TEXT,
  document_url TEXT, -- URL del documento PDF del giudizio
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per le vaccinazioni
CREATE TABLE public.vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  medical_record_id UUID REFERENCES public.medical_records(id) ON DELETE CASCADE,
  vaccine_name TEXT NOT NULL,
  administration_date DATE NOT NULL,
  expiry_date DATE,
  batch_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabella per le convocazioni
CREATE TABLE public.medical_convocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES public.medical_visits(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  convocation_date TIMESTAMPTZ DEFAULT now(),
  notification_type TEXT NOT NULL, -- email, sms, both
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, sent, failed
  message_content TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.medical_protocols ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_judgments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_convocations ENABLE ROW LEVEL SECURITY;

-- Policies per medical_protocols
CREATE POLICY "Users can view protocols of their company"
  ON public.medical_protocols FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Admins can manage protocols"
  ON public.medical_protocols FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = medical_protocols.company_id
      AND role IN ('admin', 'admin_sub_azienda', 'superadmin')
    )
  );

-- Policies per medical_records
CREATE POLICY "Users can view medical records"
  ON public.medical_records FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR employee_id IN (
      SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Admins and HR can manage medical records"
  ON public.medical_records FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = medical_records.company_id
      AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
    )
  );

-- Policies per medical_visits
CREATE POLICY "Users can view medical visits"
  ON public.medical_visits FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR employee_id IN (
      SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Admins and HR can manage medical visits"
  ON public.medical_visits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = medical_visits.company_id
      AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
    )
  );

-- Policies per fitness_judgments
CREATE POLICY "Users can view fitness judgments"
  ON public.fitness_judgments FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR employee_id IN (
      SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Admins and HR can manage fitness judgments"
  ON public.fitness_judgments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = fitness_judgments.company_id
      AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
    )
  );

-- Policies per vaccinations
CREATE POLICY "Users can view vaccinations"
  ON public.vaccinations FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR employee_id IN (
      SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Admins and HR can manage vaccinations"
  ON public.vaccinations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = vaccinations.company_id
      AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
    )
  );

-- Policies per medical_convocations
CREATE POLICY "Users can view convocations"
  ON public.medical_convocations FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR employee_id IN (
      SELECT id FROM public.employees WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Admins and HR can manage convocations"
  ON public.medical_convocations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND company_id = medical_convocations.company_id
      AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
    )
  );

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_medical_protocols_updated_at
  BEFORE UPDATE ON public.medical_protocols
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_records_updated_at
  BEFORE UPDATE ON public.medical_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_medical_visits_updated_at
  BEFORE UPDATE ON public.medical_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fitness_judgments_updated_at
  BEFORE UPDATE ON public.fitness_judgments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_vaccinations_updated_at
  BEFORE UPDATE ON public.vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();