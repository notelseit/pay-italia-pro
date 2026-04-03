
-- Recreate view with SECURITY INVOKER
DROP VIEW IF EXISTS public.employees_medical_view;
CREATE VIEW public.employees_medical_view
WITH (security_invoker = true)
AS
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

GRANT SELECT ON public.employees_medical_view TO authenticated;
