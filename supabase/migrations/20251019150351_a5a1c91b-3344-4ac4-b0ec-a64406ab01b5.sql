-- Add ON DELETE CASCADE to all foreign keys referencing companies
-- This ensures that when a company is deleted, all related data is automatically removed

-- Drop and recreate foreign keys with CASCADE for employees table
ALTER TABLE public.employees 
  DROP CONSTRAINT IF EXISTS employees_company_id_fkey,
  ADD CONSTRAINT employees_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES public.companies(id) 
    ON DELETE CASCADE;

-- Drop and recreate foreign keys with CASCADE for profiles table
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_company_id_fkey,
  ADD CONSTRAINT profiles_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES public.companies(id) 
    ON DELETE CASCADE;

-- Drop and recreate foreign keys with CASCADE for user_roles table
ALTER TABLE public.user_roles 
  DROP CONSTRAINT IF EXISTS user_roles_company_id_fkey,
  ADD CONSTRAINT user_roles_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES public.companies(id) 
    ON DELETE CASCADE;

-- Drop and recreate foreign keys with CASCADE for payroll_records table
ALTER TABLE public.payroll_records 
  DROP CONSTRAINT IF EXISTS payroll_records_company_id_fkey,
  ADD CONSTRAINT payroll_records_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES public.companies(id) 
    ON DELETE CASCADE;

-- Drop and recreate foreign keys with CASCADE for presence_records table
ALTER TABLE public.presence_records 
  DROP CONSTRAINT IF EXISTS presence_records_company_id_fkey,
  ADD CONSTRAINT presence_records_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES public.companies(id) 
    ON DELETE CASCADE;

-- Drop and recreate foreign keys with CASCADE for documents table
ALTER TABLE public.documents 
  DROP CONSTRAINT IF EXISTS documents_company_id_fkey,
  ADD CONSTRAINT documents_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES public.companies(id) 
    ON DELETE CASCADE;

-- Drop and recreate foreign keys with CASCADE for education_records table
ALTER TABLE public.education_records 
  DROP CONSTRAINT IF EXISTS education_records_company_id_fkey,
  ADD CONSTRAINT education_records_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES public.companies(id) 
    ON DELETE CASCADE;

-- Drop and recreate foreign keys with CASCADE for payroll_settings table
ALTER TABLE public.payroll_settings 
  DROP CONSTRAINT IF EXISTS payroll_settings_company_id_fkey,
  ADD CONSTRAINT payroll_settings_company_id_fkey 
    FOREIGN KEY (company_id) 
    REFERENCES public.companies(id) 
    ON DELETE CASCADE;