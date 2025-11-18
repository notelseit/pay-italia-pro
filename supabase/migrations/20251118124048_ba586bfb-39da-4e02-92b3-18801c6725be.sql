-- Drop existing policies with auth.users references
DROP POLICY IF EXISTS "Users can view medical records" ON public.medical_records;
DROP POLICY IF EXISTS "Users can view medical visits" ON public.medical_visits;
DROP POLICY IF EXISTS "Users can view fitness judgments" ON public.fitness_judgments;
DROP POLICY IF EXISTS "Users can view vaccinations" ON public.vaccinations;
DROP POLICY IF EXISTS "Users can view medical convocations" ON public.medical_convocations;

-- Recreate policies without auth.users references
CREATE POLICY "Users can view medical records"
  ON public.medical_records FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Users can view medical visits"
  ON public.medical_visits FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Users can view fitness judgments"
  ON public.fitness_judgments FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Users can view vaccinations"
  ON public.vaccinations FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );

CREATE POLICY "Users can view medical convocations"
  ON public.medical_convocations FOR SELECT
  USING (
    company_id IN (
      SELECT company_id FROM public.profiles WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'superadmin'
    )
  );