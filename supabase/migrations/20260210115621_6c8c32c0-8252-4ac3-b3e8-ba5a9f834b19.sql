
-- Tabella presence_daily per dati giornalieri
CREATE TABLE public.presence_daily (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  presence_record_id uuid NOT NULL REFERENCES public.presence_records(id) ON DELETE CASCADE,
  day_date date NOT NULL,
  day_type text NOT NULL DEFAULT 'working',
  overtime_hours numeric NOT NULL DEFAULT 0,
  night_holiday_hours numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_presence_day UNIQUE (presence_record_id, day_date)
);

-- Indici
CREATE INDEX idx_presence_daily_record ON public.presence_daily(presence_record_id);
CREATE INDEX idx_presence_daily_date ON public.presence_daily(day_date);

-- RLS
ALTER TABLE public.presence_daily ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view presence_daily for their company"
  ON public.presence_daily FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.presence_records pr
      JOIN public.profiles p ON p.company_id = pr.company_id
      WHERE pr.id = presence_daily.presence_record_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can insert presence_daily for their company"
  ON public.presence_daily FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.presence_records pr
      JOIN public.profiles p ON p.company_id = pr.company_id
      WHERE pr.id = presence_daily.presence_record_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can update presence_daily for their company"
  ON public.presence_daily FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.presence_records pr
      JOIN public.profiles p ON p.company_id = pr.company_id
      WHERE pr.id = presence_daily.presence_record_id
      AND p.id = auth.uid()
    )
  );

CREATE POLICY "Users can delete presence_daily for their company"
  ON public.presence_daily FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.presence_records pr
      JOIN public.profiles p ON p.company_id = pr.company_id
      WHERE pr.id = presence_daily.presence_record_id
      AND p.id = auth.uid()
    )
  );
