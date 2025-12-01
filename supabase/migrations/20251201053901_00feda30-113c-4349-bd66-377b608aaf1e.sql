-- Aggiungi una tabella per mappare mansioni ai protocolli sanitari
CREATE TABLE IF NOT EXISTS public.job_role_protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  job_role TEXT NOT NULL,
  protocol_id UUID NOT NULL REFERENCES public.medical_protocols(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id, job_role, protocol_id)
);

-- Enable RLS
ALTER TABLE public.job_role_protocols ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view job role protocols in their company"
  ON public.job_role_protocols
  FOR SELECT
  USING (company_id IN (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'superadmin'
  ));

CREATE POLICY "Admins and HR can manage job role protocols"
  ON public.job_role_protocols
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND company_id = job_role_protocols.company_id 
    AND role IN ('admin', 'admin_sub_azienda', 'hr_manager', 'superadmin')
  ));

-- Aggiungi mappature comuni per mansioni-protocolli (esempi)
INSERT INTO public.job_role_protocols (company_id, job_role, protocol_id)
SELECT 
  c.id as company_id,
  job_role.role,
  mp.id as protocol_id
FROM companies c
CROSS JOIN (
  VALUES 
    ('Operatore VDT'),
    ('Impiegato Amministrativo'),
    ('Segretaria')
) AS job_role(role)
JOIN medical_protocols mp ON mp.company_id = c.id AND mp.name = 'Videoterminali (VDT)'
ON CONFLICT DO NOTHING;

INSERT INTO public.job_role_protocols (company_id, job_role, protocol_id)
SELECT 
  c.id as company_id,
  job_role.role,
  mp.id as protocol_id
FROM companies c
CROSS JOIN (
  VALUES 
    ('Magazziniere'),
    ('Operaio'),
    ('Facchino')
) AS job_role(role)
JOIN medical_protocols mp ON mp.company_id = c.id AND mp.name = 'Movimentazione Manuale Carichi'
ON CONFLICT DO NOTHING;

INSERT INTO public.job_role_protocols (company_id, job_role, protocol_id)
SELECT 
  c.id as company_id,
  job_role.role,
  mp.id as protocol_id
FROM companies c
CROSS JOIN (
  VALUES 
    ('Operatore Notturno'),
    ('Vigilante Notturno'),
    ('Guardiano Notturno')
) AS job_role(role)
JOIN medical_protocols mp ON mp.company_id = c.id AND mp.name = 'Lavoro Notturno'
ON CONFLICT DO NOTHING;

-- Function per assegnare automaticamente protocolli ai dipendenti
CREATE OR REPLACE FUNCTION public.assign_protocols_to_employee()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_protocol_id UUID;
BEGIN
  -- Se il dipendente ha una mansione specificata
  IF NEW.employee_type IS NOT NULL THEN
    -- Trova i protocolli associati a quella mansione
    FOR v_protocol_id IN 
      SELECT protocol_id 
      FROM job_role_protocols 
      WHERE company_id = NEW.company_id 
      AND job_role = NEW.employee_type
    LOOP
      -- Aggiorna o crea la cartella sanitaria con il protocollo
      INSERT INTO medical_records (
        company_id,
        employee_id,
        protocol_id,
        status
      ) VALUES (
        NEW.company_id,
        NEW.id,
        v_protocol_id,
        'active'
      )
      ON CONFLICT (employee_id) WHERE status = 'active'
      DO UPDATE SET 
        protocol_id = v_protocol_id,
        updated_at = NOW();
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger per assegnazione automatica protocolli quando viene creato o aggiornato un dipendente
CREATE TRIGGER auto_assign_protocols_on_employee
  AFTER INSERT OR UPDATE OF employee_type ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_protocols_to_employee();