-- Tabella per configurazioni notifiche per azienda
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'medical_visit' o 'fitness_judgment'
  days_before_expiry INTEGER[] NOT NULL DEFAULT ARRAY[30, 15, 7], -- Array di giorni prima della scadenza
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, notification_type)
);

-- Tabella per storico notifiche inviate
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  notification_type TEXT NOT NULL, -- 'medical_visit' o 'fitness_judgment'
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  reference_id UUID NOT NULL, -- ID della visita o giudizio
  days_before_expiry INTEGER NOT NULL,
  notification_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_sent BOOLEAN DEFAULT false,
  email_recipient TEXT,
  email_status TEXT, -- 'sent', 'failed', 'pending'
  email_error TEXT,
  message_content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_settings
CREATE POLICY "Users can view notification settings in their company"
  ON public.notification_settings
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  ));

CREATE POLICY "Admins and HR can manage notification settings"
  ON public.notification_settings
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = notification_settings.company_id 
    AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
  ));

-- RLS Policies for notification_logs
CREATE POLICY "Users can view notification logs in their company"
  ON public.notification_logs
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  ));

CREATE POLICY "Service role can insert notification logs"
  ON public.notification_logs
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role' OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = notification_logs.company_id 
    AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
  ));

-- Trigger per updated_at su notification_settings
CREATE TRIGGER update_notification_settings_updated_at
  BEFORE UPDATE ON public.notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserisci configurazioni default per tutte le aziende esistenti
INSERT INTO public.notification_settings (company_id, notification_type, days_before_expiry)
SELECT id, 'medical_visit', ARRAY[30, 15, 7]
FROM companies
ON CONFLICT (company_id, notification_type) DO NOTHING;

INSERT INTO public.notification_settings (company_id, notification_type, days_before_expiry)
SELECT id, 'fitness_judgment', ARRAY[60, 30, 15]
FROM companies
ON CONFLICT (company_id, notification_type) DO NOTHING;

-- Indici per performance
CREATE INDEX idx_notification_logs_company_id ON public.notification_logs(company_id);
CREATE INDEX idx_notification_logs_employee_id ON public.notification_logs(employee_id);
CREATE INDEX idx_notification_logs_notification_date ON public.notification_logs(notification_date);
CREATE INDEX idx_notification_logs_notification_type ON public.notification_logs(notification_type);