-- Add detailed address fields to companies table
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS street_number text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS province text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'Italia';