-- Add new columns to presence_records table
ALTER TABLE public.presence_records 
ADD COLUMN exclude_weekends boolean DEFAULT false,
ADD COLUMN night_holiday_hours numeric DEFAULT 0;

COMMENT ON COLUMN public.presence_records.exclude_weekends IS 'Se true, sabato e domenica sono esclusi dal calcolo delle ore lavorative';
COMMENT ON COLUMN public.presence_records.night_holiday_hours IS 'Ore di lavoro notturno e festivo';