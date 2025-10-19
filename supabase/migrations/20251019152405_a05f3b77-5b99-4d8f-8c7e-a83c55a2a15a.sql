-- Fix RLS policies for employees table to allow INSERT operations
-- Drop existing policy that only has USING clause
DROP POLICY IF EXISTS "HR can manage employees" ON public.employees;

-- Create separate policies for different operations with proper WITH CHECK clauses

-- Policy for SELECT
CREATE POLICY "HR can view employees"
ON public.employees
FOR SELECT
TO authenticated
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) 
  OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

-- Policy for INSERT with WITH CHECK clause
CREATE POLICY "HR can insert employees"
ON public.employees
FOR INSERT
TO authenticated
WITH CHECK (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) 
  OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

-- Policy for UPDATE with both USING and WITH CHECK
CREATE POLICY "HR can update employees"
ON public.employees
FOR UPDATE
TO authenticated
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) 
  OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
)
WITH CHECK (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) 
  OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

-- Policy for DELETE
CREATE POLICY "HR can delete employees"
ON public.employees
FOR DELETE
TO authenticated
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) 
  OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);