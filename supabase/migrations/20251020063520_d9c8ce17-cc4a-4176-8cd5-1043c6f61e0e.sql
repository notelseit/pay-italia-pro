-- Add birth and address fields to employees table
ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS birth_date date,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS postal_code text,
ADD COLUMN IF NOT EXISTS province text,
ADD COLUMN IF NOT EXISTS country text DEFAULT 'Italia';