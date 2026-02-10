
-- =============================================
-- SISTEMA DI VERSIONAMENTO IMMUTABILE
-- =============================================

-- 1. Tabella ccnl_versions
CREATE TABLE public.ccnl_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ccnl_id UUID NOT NULL REFERENCES public.ccnl_contracts(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  data_json JSONB NOT NULL,
  change_summary TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- 2. Tabella payroll_settings_versions
CREATE TABLE public.payroll_settings_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payroll_settings_id UUID NOT NULL REFERENCES public.payroll_settings(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  data_json JSONB NOT NULL,
  change_summary TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- 3. Tabella contract_versions
CREATE TABLE public.contract_versions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES public.employment_contracts(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  data_json JSONB NOT NULL,
  change_summary TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- 4. Colonne aggiuntive su payroll_records
ALTER TABLE public.payroll_records
  ADD COLUMN payroll_settings_version_id UUID REFERENCES public.payroll_settings_versions(id),
  ADD COLUMN ccnl_version_id UUID REFERENCES public.ccnl_versions(id);

-- 5. Indici per performance
CREATE INDEX idx_ccnl_versions_ccnl_id ON public.ccnl_versions(ccnl_id);
CREATE INDEX idx_ccnl_versions_active ON public.ccnl_versions(ccnl_id, is_active) WHERE is_active = true;
CREATE INDEX idx_psv_settings_id ON public.payroll_settings_versions(payroll_settings_id);
CREATE INDEX idx_psv_active ON public.payroll_settings_versions(payroll_settings_id, is_active) WHERE is_active = true;
CREATE INDEX idx_cv_contract_id ON public.contract_versions(contract_id);
CREATE INDEX idx_cv_active ON public.contract_versions(contract_id, is_active) WHERE is_active = true;

-- 6. Funzione SECURITY DEFINER per auto-incremento version_number e gestione is_active
CREATE OR REPLACE FUNCTION public.handle_version_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-incremento version_number
  IF TG_TABLE_NAME = 'ccnl_versions' THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
    FROM public.ccnl_versions WHERE ccnl_id = NEW.ccnl_id;
    -- Disattiva versioni precedenti
    IF NEW.is_active = true THEN
      UPDATE public.ccnl_versions SET is_active = false
      WHERE ccnl_id = NEW.ccnl_id AND id != NEW.id AND is_active = true;
    END IF;
  ELSIF TG_TABLE_NAME = 'payroll_settings_versions' THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
    FROM public.payroll_settings_versions WHERE payroll_settings_id = NEW.payroll_settings_id;
    IF NEW.is_active = true THEN
      UPDATE public.payroll_settings_versions SET is_active = false
      WHERE payroll_settings_id = NEW.payroll_settings_id AND id != NEW.id AND is_active = true;
    END IF;
  ELSIF TG_TABLE_NAME = 'contract_versions' THEN
    SELECT COALESCE(MAX(version_number), 0) + 1 INTO NEW.version_number
    FROM public.contract_versions WHERE contract_id = NEW.contract_id;
    IF NEW.is_active = true THEN
      UPDATE public.contract_versions SET is_active = false
      WHERE contract_id = NEW.contract_id AND id != NEW.id AND is_active = true;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Trigger per ciascuna tabella
CREATE TRIGGER trg_ccnl_versions_insert
  BEFORE INSERT ON public.ccnl_versions
  FOR EACH ROW EXECUTE FUNCTION public.handle_version_insert();

CREATE TRIGGER trg_psv_insert
  BEFORE INSERT ON public.payroll_settings_versions
  FOR EACH ROW EXECUTE FUNCTION public.handle_version_insert();

CREATE TRIGGER trg_cv_insert
  BEFORE INSERT ON public.contract_versions
  FOR EACH ROW EXECUTE FUNCTION public.handle_version_insert();

-- 8. RLS - Abilitazione
ALTER TABLE public.ccnl_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_settings_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_versions ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies - ccnl_versions
CREATE POLICY "Users can view ccnl versions in their company"
  ON public.ccnl_versions FOR SELECT
  USING (
    company_id = get_user_company(auth.uid())
    OR has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
    OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
    OR is_superadmin(auth.uid())
  );

CREATE POLICY "HR can insert ccnl versions"
  ON public.ccnl_versions FOR INSERT
  WITH CHECK (
    has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
    OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
    OR is_superadmin(auth.uid())
  );

-- 10. RLS Policies - payroll_settings_versions
CREATE POLICY "Users can view payroll settings versions in their company"
  ON public.payroll_settings_versions FOR SELECT
  USING (
    company_id = get_user_company(auth.uid())
    OR has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
    OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
    OR is_superadmin(auth.uid())
  );

CREATE POLICY "HR can insert payroll settings versions"
  ON public.payroll_settings_versions FOR INSERT
  WITH CHECK (
    has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
    OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
    OR is_superadmin(auth.uid())
  );

-- 11. RLS Policies - contract_versions
CREATE POLICY "Users can view contract versions in their company"
  ON public.contract_versions FOR SELECT
  USING (
    company_id = get_user_company(auth.uid())
    OR has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
    OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
    OR is_superadmin(auth.uid())
  );

CREATE POLICY "HR can insert contract versions"
  ON public.contract_versions FOR INSERT
  WITH CHECK (
    has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
    OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
    OR has_role_in_company(auth.uid(), company_id, 'admin_sub_azienda'::user_role)
    OR is_superadmin(auth.uid())
  );
