-- Fix RLS policy for platform_access_logs to allow authenticated users to insert their logs
DROP POLICY IF EXISTS "Users can insert their own access logs" ON public.platform_access_logs;

CREATE POLICY "Users can insert their own access logs"
ON public.platform_access_logs
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND (user_id = auth.uid() OR user_id IS NULL)
);