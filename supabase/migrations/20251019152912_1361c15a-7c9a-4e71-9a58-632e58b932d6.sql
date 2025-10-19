-- Add new fields to presence_records for maternity, parental leave, and other data

-- Maternità obbligatoria
ALTER TABLE public.presence_records
ADD COLUMN mandatory_maternity_days integer DEFAULT 0,
ADD COLUMN maternity_code_ma1 boolean DEFAULT false;

-- Congedo parentale (maternità facoltativa)
ALTER TABLE public.presence_records
ADD COLUMN parental_leave_pg4_days integer DEFAULT 0, -- Congedo parentale orario indennizzato 80%
ADD COLUMN parental_leave_pg5_days integer DEFAULT 0; -- Congedo parentale giornaliero indennizzato 80%

-- Altro: integrazioni salariali, competenze, trattenute
ALTER TABLE public.presence_records
ADD COLUMN wage_integration numeric(10,2) DEFAULT 0,
ADD COLUMN allowances numeric(10,2) DEFAULT 0,
ADD COLUMN deductions numeric(10,2) DEFAULT 0,
ADD COLUMN bilateral_entity_amount numeric(10,2) DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN public.presence_records.mandatory_maternity_days IS 'Giorni di maternità obbligatoria';
COMMENT ON COLUMN public.presence_records.maternity_code_ma1 IS 'Codice MA1 - Congedo di Maternità e Paternità Alternativo';
COMMENT ON COLUMN public.presence_records.parental_leave_pg4_days IS 'Codice PG4 - Congedo parentale orario indennizzato 80%';
COMMENT ON COLUMN public.presence_records.parental_leave_pg5_days IS 'Codice PG5 - Congedo parentale giornaliero indennizzato 80%';
COMMENT ON COLUMN public.presence_records.wage_integration IS 'Integrazioni salariali';
COMMENT ON COLUMN public.presence_records.allowances IS 'Competenze';
COMMENT ON COLUMN public.presence_records.deductions IS 'Trattenute';
COMMENT ON COLUMN public.presence_records.bilateral_entity_amount IS 'Calcolo ente bilaterale';