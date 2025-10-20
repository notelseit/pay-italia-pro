-- Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  status TEXT NOT NULL, -- 'success', 'failed'
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  template_type TEXT,
  full_log JSONB
);

-- Enable RLS
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for superadmins to view all email logs
CREATE POLICY "Superadmins can view all email logs"
ON public.email_logs
FOR SELECT
USING (is_superadmin(auth.uid()));

-- Create policy for system to insert logs (using service role)
CREATE POLICY "Service role can insert email logs"
ON public.email_logs
FOR INSERT
WITH CHECK (true);

-- Create index for faster queries
CREATE INDEX idx_email_logs_company_id ON public.email_logs(company_id);
CREATE INDEX idx_email_logs_sent_at ON public.email_logs(sent_at DESC);