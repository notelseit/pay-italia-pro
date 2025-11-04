-- Create table for HR news sources configuration
CREATE TABLE IF NOT EXISTS public.hr_news_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.hr_news_sources ENABLE ROW LEVEL SECURITY;

-- Only superadmin can manage sources
CREATE POLICY "Superadmin can manage HR news sources"
ON public.hr_news_sources
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'superadmin'
  )
);

-- Create updated_at trigger
CREATE TRIGGER update_hr_news_sources_updated_at
BEFORE UPDATE ON public.hr_news_sources
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();