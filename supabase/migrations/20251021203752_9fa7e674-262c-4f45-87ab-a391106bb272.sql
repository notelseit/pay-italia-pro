-- Allow admin_sub_azienda to view their own company
CREATE POLICY "Admin sub azienda can view their company" 
ON public.companies
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin_sub_azienda'
      AND user_roles.company_id = companies.id
  )
);

-- Update access logs policy to allow service role and all authenticated users
DROP POLICY IF EXISTS "Authenticated users can insert email logs" ON public.platform_access_logs;

CREATE POLICY "Authenticated users can insert access logs" 
ON public.platform_access_logs
FOR INSERT
WITH CHECK (
  (auth.uid() IS NOT NULL) AND 
  ((user_id = auth.uid()) OR (user_id IS NULL) OR (auth.role() = 'service_role'))
);