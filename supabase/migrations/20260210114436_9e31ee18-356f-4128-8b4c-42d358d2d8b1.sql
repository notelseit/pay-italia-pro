
-- Tabella domain_events per tracciare eventi di dominio critici
CREATE TABLE public.domain_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  payload jsonb DEFAULT '{}',
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indici per query efficienti
CREATE INDEX idx_domain_events_company_created ON public.domain_events (company_id, created_at DESC);
CREATE INDEX idx_domain_events_entity ON public.domain_events (entity_type, entity_id);
CREATE INDEX idx_domain_events_type ON public.domain_events (event_type);

-- RLS
ALTER TABLE public.domain_events ENABLE ROW LEVEL SECURITY;

-- Superadmin: vede tutto
CREATE POLICY "Superadmin can view all domain events"
  ON public.domain_events FOR SELECT
  USING (public.is_superadmin(auth.uid()));

-- Admin/HR/Medical Officer: vede solo la propria company
CREATE POLICY "Company roles can view own domain events"
  ON public.domain_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.company_id = domain_events.company_id
        AND user_roles.role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'medical_officer')
    )
  );

-- INSERT: qualsiasi utente autenticato (i permessi sono controllati a livello applicativo)
CREATE POLICY "Authenticated users can insert domain events"
  ON public.domain_events FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Nessuna policy UPDATE/DELETE: gli eventi sono immutabili

-- Abilita Realtime per webhook futuri
ALTER PUBLICATION supabase_realtime ADD TABLE public.domain_events;
