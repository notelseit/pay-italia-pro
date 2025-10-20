-- Add policy to allow authenticated users to insert their own access logs
CREATE POLICY "Users can insert their own access logs"
ON public.platform_access_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Update email_logs policy to allow both service role and authenticated users
DROP POLICY IF EXISTS "Service role can insert email logs" ON public.email_logs;

CREATE POLICY "Authenticated users can insert email logs"
ON public.email_logs
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL OR auth.role() = 'service_role');