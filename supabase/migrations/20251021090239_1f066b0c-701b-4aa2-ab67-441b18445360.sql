-- Permetti agli admin di inserire nuove aziende
CREATE POLICY "Admins can insert companies"
ON public.companies
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Permetti agli admin di vedere tutte le aziende (non solo la propria)
CREATE POLICY "Admins can view all companies"
ON public.companies
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);