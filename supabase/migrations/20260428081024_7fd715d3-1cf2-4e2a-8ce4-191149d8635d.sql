-- 1. Allow company admins and HR managers to view email logs for their own company
CREATE POLICY "HR can view email logs in their company"
ON public.email_logs
FOR SELECT
TO authenticated
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
  OR has_role_in_company(auth.uid(), company_id, 'admin_sub_azienda'::user_role)
  OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

-- 2. Prevent admins from assigning/updating/deleting roles for themselves
-- (privilege escalation hardening). Superadmins are unaffected by their separate policy.
DROP POLICY IF EXISTS "Admins can assign non-superadmin roles" ON public.user_roles;
CREATE POLICY "Admins can assign non-superadmin roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
  AND company_id IS NOT NULL
  AND role <> 'superadmin'::user_role
  AND user_id <> auth.uid()
);

DROP POLICY IF EXISTS "Admins can update non-superadmin roles" ON public.user_roles;
CREATE POLICY "Admins can update non-superadmin roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
  AND company_id IS NOT NULL
  AND role <> 'superadmin'::user_role
  AND user_id <> auth.uid()
)
WITH CHECK (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
  AND company_id IS NOT NULL
  AND role <> 'superadmin'::user_role
  AND user_id <> auth.uid()
);

DROP POLICY IF EXISTS "Admins can delete non-superadmin roles" ON public.user_roles;
CREATE POLICY "Admins can delete non-superadmin roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role)
  AND company_id IS NOT NULL
  AND role <> 'superadmin'::user_role
  AND user_id <> auth.uid()
);