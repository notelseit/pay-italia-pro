-- Fix critical security issue: Employees should only see their own data unless they have HR roles

-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view employees in their company" ON public.employees;

-- Create new policy: Employees can only view their own record
CREATE POLICY "Employees can view own record"
ON public.employees
FOR SELECT
USING (
  company_id = get_user_company(auth.uid()) AND
  (
    -- HR and Admins can see all employees
    has_role_in_company(auth.uid(), company_id, 'admin'::user_role) OR
    has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role) OR
    -- Regular employees can only see their own record (matched by email)
    email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
  )
);