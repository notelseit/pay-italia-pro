
-- 1. Fix domain_events INSERT policy: scope by company
DROP POLICY IF EXISTS "Authenticated users can insert domain events" ON public.domain_events;
CREATE POLICY "Company users can insert domain events"
ON public.domain_events
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
  AND company_id = get_user_company(auth.uid())
);

-- 2. Fix user_roles privilege escalation: replace admin ALL policy with scoped ones
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Admins can view roles in their company
CREATE POLICY "Admins can view roles in their company"
ON public.user_roles
FOR SELECT
TO authenticated
USING (has_role_in_company(auth.uid(), company_id, 'admin'::user_role));

-- Admins can INSERT roles but NOT superadmin, and only for their own company
CREATE POLICY "Admins can assign non-superadmin roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
  AND company_id IS NOT NULL
  AND role != 'superadmin'::user_role
);

-- Admins can UPDATE roles but NOT to superadmin
CREATE POLICY "Admins can update non-superadmin roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
  AND company_id IS NOT NULL
  AND role != 'superadmin'::user_role
)
WITH CHECK (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
  AND company_id IS NOT NULL
  AND role != 'superadmin'::user_role
);

-- Admins can DELETE roles but NOT superadmin
CREATE POLICY "Admins can delete non-superadmin roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
  AND company_id IS NOT NULL
  AND role != 'superadmin'::user_role
);

-- 3. Fix medical officer data exposure: create a restricted view
CREATE OR REPLACE VIEW public.employees_medical_view AS
SELECT
  id,
  company_id,
  full_name,
  first_name,
  last_name,
  email,
  birth_date,
  employee_type,
  hire_date,
  is_active,
  created_at,
  updated_at
FROM public.employees;

-- Grant access to the view
GRANT SELECT ON public.employees_medical_view TO authenticated;

-- 4. Remove domain_events from realtime publication
ALTER PUBLICATION supabase_realtime DROP TABLE public.domain_events;
