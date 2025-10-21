-- Add created_by field to track who created the company
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Add parent_company_id to track company hierarchy
ALTER TABLE public.companies
ADD COLUMN IF NOT EXISTS parent_company_id UUID REFERENCES public.companies(id);

-- Drop ALL existing policies on companies table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'companies' AND schemaname = 'public')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON public.companies';
    END LOOP;
END $$;

-- Superadmins can see all companies
CREATE POLICY "Superadmins can view all companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'superadmin'
  )
);

-- Admins can see only companies they created
CREATE POLICY "Admins can view their created companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND companies.created_by = auth.uid()
  )
);

-- Users can see their own company
CREATE POLICY "Users can view their own company"
ON public.companies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.company_id = companies.id
  )
);

-- Superadmins and admins can insert companies
CREATE POLICY "Superadmins and admins can create companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role IN ('superadmin', 'admin')
  )
);

-- Only superadmins can update all companies, admins can only update their created companies
CREATE POLICY "Superadmins can update all companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'superadmin'
  )
);

CREATE POLICY "Admins can update their created companies"
ON public.companies
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
    AND companies.created_by = auth.uid()
  )
);

-- Only superadmins can delete companies
CREATE POLICY "Superadmins can delete companies"
ON public.companies
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'superadmin'
  )
);