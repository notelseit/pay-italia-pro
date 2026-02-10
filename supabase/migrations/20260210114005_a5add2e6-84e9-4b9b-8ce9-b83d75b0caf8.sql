
-- Aggiornare RLS per medical_records
DROP POLICY IF EXISTS "Admins and HR can manage medical records" ON public.medical_records;
CREATE POLICY "Admins HR and Medical Officer can manage medical records"
  ON public.medical_records FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = medical_records.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'hr_manager'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Aggiornare RLS per medical_visits
DROP POLICY IF EXISTS "Admins and HR can manage medical visits" ON public.medical_visits;
CREATE POLICY "Admins HR and Medical Officer can manage medical visits"
  ON public.medical_visits FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = medical_visits.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'hr_manager'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Aggiornare RLS per fitness_judgments
DROP POLICY IF EXISTS "Admins and HR can manage fitness judgments" ON public.fitness_judgments;
CREATE POLICY "Admins HR and Medical Officer can manage fitness judgments"
  ON public.fitness_judgments FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = fitness_judgments.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'hr_manager'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Aggiornare RLS per medical_documents
DROP POLICY IF EXISTS "Admins and HR can manage medical documents" ON public.medical_documents;
CREATE POLICY "Admins HR and Medical Officer can manage medical documents"
  ON public.medical_documents FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = medical_documents.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'hr_manager'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Aggiornare RLS per medical_protocols
DROP POLICY IF EXISTS "Admins can manage protocols" ON public.medical_protocols;
CREATE POLICY "Admins and Medical Officer can manage protocols"
  ON public.medical_protocols FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = medical_protocols.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Aggiornare RLS per vaccinations
DROP POLICY IF EXISTS "Admins and HR can manage vaccinations" ON public.vaccinations;
CREATE POLICY "Admins HR and Medical Officer can manage vaccinations"
  ON public.vaccinations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = vaccinations.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'hr_manager'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Aggiornare RLS per medical_convocations
DROP POLICY IF EXISTS "Admins and HR can manage convocations" ON public.medical_convocations;
CREATE POLICY "Admins HR and Medical Officer can manage convocations"
  ON public.medical_convocations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = medical_convocations.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'hr_manager'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Aggiornare RLS per visit_checklists
DROP POLICY IF EXISTS "Admins and HR can manage checklists" ON public.visit_checklists;
CREATE POLICY "Admins HR and Medical Officer can manage checklists"
  ON public.visit_checklists FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = visit_checklists.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'hr_manager'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Aggiornare RLS per job_role_protocols
DROP POLICY IF EXISTS "Admins and HR can manage job role protocols" ON public.job_role_protocols;
CREATE POLICY "Admins HR and Medical Officer can manage job role protocols"
  ON public.job_role_protocols FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = job_role_protocols.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'hr_manager'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Aggiornare RLS per dvr_risks
DROP POLICY IF EXISTS "Admins and HR can manage risks" ON public.dvr_risks;
CREATE POLICY "Admins HR and Medical Officer can manage risks"
  ON public.dvr_risks FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = dvr_risks.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'hr_manager'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Aggiornare RLS per digital_signatures
DROP POLICY IF EXISTS "Admins can manage signatures" ON public.digital_signatures;
CREATE POLICY "Admins and Medical Officer can manage signatures"
  ON public.digital_signatures FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = digital_signatures.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Aggiornare RLS per visit_confirmations
DROP POLICY IF EXISTS "Admins and HR can manage confirmations" ON public.visit_confirmations;
CREATE POLICY "Admins HR and Medical Officer can manage confirmations"
  ON public.visit_confirmations FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.company_id = visit_confirmations.company_id
      AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'hr_manager'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
  ));

-- Medical officer può vedere i dipendenti (sola lettura)
CREATE POLICY "Medical officer can view employees"
  ON public.employees FOR SELECT
  USING (has_role_in_company(auth.uid(), company_id, 'medical_officer'::user_role));

-- Aggiornare notification_logs insert policy
DROP POLICY IF EXISTS "Service role can insert notification logs" ON public.notification_logs;
CREATE POLICY "Service role and medical can insert notification logs"
  ON public.notification_logs FOR INSERT
  WITH CHECK (
    (auth.role() = 'service_role'::text) OR
    (EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.company_id = notification_logs.company_id
        AND user_roles.role = ANY (ARRAY['admin'::user_role, 'admin_sub_azienda'::user_role, 'hr_manager'::user_role, 'superadmin'::user_role, 'medical_officer'::user_role])
    ))
  );
