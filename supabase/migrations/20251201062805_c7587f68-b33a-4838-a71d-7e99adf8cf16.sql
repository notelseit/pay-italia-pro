-- Remove overly permissive RLS policy on visit_confirmations table
-- This policy allowed anyone to read ALL confirmation records
DROP POLICY IF EXISTS "Public can view confirmations by token" ON public.visit_confirmations;

-- The confirm-visit edge function uses service role key which bypasses RLS,
-- so no public policy is needed