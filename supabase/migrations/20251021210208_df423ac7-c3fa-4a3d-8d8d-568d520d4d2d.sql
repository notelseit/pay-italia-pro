-- Crea la tabella per i contratti di assunzione
CREATE TABLE public.employment_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  contract_name TEXT NOT NULL,
  contract_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  base_salary NUMERIC NOT NULL,
  working_hours NUMERIC NOT NULL DEFAULT 40,
  trial_period_days INTEGER DEFAULT 0,
  notice_period_days INTEGER DEFAULT 15,
  job_title TEXT,
  job_description TEXT,
  work_location TEXT,
  benefits TEXT,
  additional_clauses TEXT,
  is_template BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Abilita RLS
ALTER TABLE public.employment_contracts ENABLE ROW LEVEL SECURITY;

-- Policy per superadmin (può vedere e gestire tutto)
CREATE POLICY "Superadmins can manage all contracts"
ON public.employment_contracts
FOR ALL
USING (is_superadmin(auth.uid()));

-- Policy per admin, hr_manager, admin_sub_azienda (possono vedere i contratti della loro azienda)
CREATE POLICY "HR can view contracts in their company"
ON public.employment_contracts
FOR SELECT
USING (
  company_id = get_user_company(auth.uid()) OR
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) OR
  has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role) OR
  has_role_in_company(auth.uid(), company_id, 'admin_sub_azienda'::user_role)
);

-- Policy per inserimento (admin, hr_manager, admin_sub_azienda)
CREATE POLICY "HR can insert contracts"
ON public.employment_contracts
FOR INSERT
WITH CHECK (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) OR
  has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role) OR
  has_role_in_company(auth.uid(), company_id, 'admin_sub_azienda'::user_role)
);

-- Policy per aggiornamento (admin, hr_manager, admin_sub_azienda)
CREATE POLICY "HR can update contracts"
ON public.employment_contracts
FOR UPDATE
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) OR
  has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role) OR
  has_role_in_company(auth.uid(), company_id, 'admin_sub_azienda'::user_role)
);

-- Policy per eliminazione (admin, hr_manager)
CREATE POLICY "HR can delete contracts"
ON public.employment_contracts
FOR DELETE
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) OR
  has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

-- Trigger per aggiornare updated_at
CREATE TRIGGER update_employment_contracts_updated_at
BEFORE UPDATE ON public.employment_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserisci 4 modelli demo (con company_id NULL per renderli disponibili come template globali)
-- Nota: Questi template saranno visibili solo ai superadmin. Ogni azienda dovrà creare i propri template.
INSERT INTO public.employment_contracts (
  company_id,
  contract_name,
  contract_type,
  start_date,
  base_salary,
  working_hours,
  trial_period_days,
  notice_period_days,
  job_title,
  job_description,
  work_location,
  benefits,
  additional_clauses,
  is_template,
  is_active
) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'Contratto Tempo Indeterminato - Impiegato',
  'indeterminato',
  CURRENT_DATE,
  1800.00,
  40,
  90,
  30,
  'Impiegato Amministrativo',
  'Il dipendente svolgerà mansioni di tipo amministrativo, gestione documentale, supporto alla direzione e attività di segreteria.',
  'Sede aziendale',
  '- 26 giorni di ferie annue
- Tredicesima mensilità
- Buoni pasto da €7,00 giornalieri
- Assicurazione sanitaria integrativa',
  'Il presente contratto è regolato dal CCNL Commercio. Il dipendente si impegna a rispettare il regolamento aziendale e le norme sulla privacy e sicurezza sul lavoro.',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Contratto Tempo Determinato - Stagionale',
  'determinato',
  CURRENT_DATE,
  1500.00,
  40,
  0,
  15,
  'Operatore Turistico',
  'Il dipendente si occuperà dell''accoglienza clienti, gestione prenotazioni e supporto nelle attività turistiche durante la stagione estiva.',
  'Stabilimento balneare/Hotel',
  '- Ferie proporzionali al periodo lavorato
- Tredicesima mensilità proporzionale
- Vitto durante i turni di lavoro',
  'Contratto a tempo determinato per esigenze stagionali dal 01/06 al 30/09. Possibilità di rinnovo per la stagione successiva.',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Contratto Apprendistato Professionalizzante',
  'apprendistato',
  CURRENT_DATE,
  1200.00,
  40,
  0,
  15,
  'Apprendista Tecnico',
  'L''apprendista sarà formato per svolgere mansioni tecniche specializzate nel settore informatico, con affiancamento di un tutor aziendale.',
  'Sede aziendale',
  '- Formazione professionale obbligatoria (120 ore annue)
- Tredicesima mensilità
- Buoni pasto da €5,00 giornalieri
- Possibilità di assunzione a tempo indeterminato al termine dell''apprendistato',
  'Contratto di apprendistato professionalizzante della durata di 36 mesi, regolato dal CCNL Metalmeccanica. Al termine del periodo formativo, previo superamento della valutazione finale, il contratto potrà essere trasformato a tempo indeterminato.',
  true,
  true
),
(
  '00000000-0000-0000-0000-000000000000',
  'Contratto Part-Time 50%',
  'indeterminato',
  CURRENT_DATE,
  900.00,
  20,
  60,
  30,
  'Addetto Vendite Part-Time',
  'Il dipendente svolgerà attività di vendita, assistenza clienti e gestione del punto vendita in modalità part-time (20 ore settimanali).',
  'Punto vendita',
  '- 13 giorni di ferie annue (proporzionali al part-time)
- Tredicesima mensilità
- Sconto dipendenti del 20% sugli acquisti
- Possibilità di passaggio a full-time',
  'Contratto part-time al 50% con orario flessibile da concordare. Il dipendente avrà diritto a tutti i benefit aziendali in forma proporzionale alle ore lavorate.',
  true,
  true
);