
-- Revoke direct access to the view from public roles
-- With security_invoker = true (already set), the view uses the caller's permissions
-- The underlying employees table has proper RLS, so access is controlled there
REVOKE SELECT ON public.employees_medical_view FROM anon;
REVOKE SELECT ON public.employees_medical_view FROM authenticated;

-- Grant back to authenticated only - they'll still be filtered by employees table RLS
GRANT SELECT ON public.employees_medical_view TO authenticated;
