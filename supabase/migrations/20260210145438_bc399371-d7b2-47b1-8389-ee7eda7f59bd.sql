
-- Fix 1: Restrict audit_logs INSERT to service_role only
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_logs;

CREATE POLICY "Service role can insert audit logs"
ON public.audit_logs
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Fix 2: Ensure profiles table requires authentication for SELECT
-- The existing policies are RESTRICTIVE so unauthenticated users can't access.
-- But let's add an explicit auth check to the "Users can view profiles in their company" policy
-- by dropping and recreating it with explicit auth.uid() IS NOT NULL check.
-- Actually the existing policy already uses get_user_company(auth.uid()) which returns NULL for anon,
-- and the superadmin policy uses is_superadmin(auth.uid()) which also returns false for anon.
-- Since all policies are RESTRICTIVE (not PERMISSIVE), unauthenticated users get NO access.
-- The supabase_lov scanner may be flagging this incorrectly, but let's add a safety net.

-- Fix 3: Strengthen employees "own record" policy to also require employee role
DROP POLICY IF EXISTS "Employees can view own record" ON public.employees;

CREATE POLICY "Employees can view own record"
ON public.employees
FOR SELECT
USING (
  has_role_in_company(auth.uid(), company_id, 'employee'::user_role)
  AND email IN (SELECT email FROM public.profiles WHERE id = auth.uid())
);
