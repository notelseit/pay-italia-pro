-- Add INPS and INAIL fields to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS matricola_inps text,
ADD COLUMN IF NOT EXISTS posizione_inail text,
ADD COLUMN IF NOT EXISTS voce_inail text;