-- Create FTP upload logs table
CREATE TABLE public.ftp_upload_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_category TEXT NOT NULL,
  upload_status TEXT NOT NULL, -- 'success' or 'failed'
  error_message TEXT,
  file_size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create platform access logs table
CREATE TABLE public.platform_access_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  user_agent TEXT,
  accessed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ftp_upload_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_access_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ftp_upload_logs
CREATE POLICY "Superadmins can view all FTP logs"
ON public.ftp_upload_logs
FOR SELECT
USING (is_superadmin(auth.uid()));

-- RLS Policies for platform_access_logs
CREATE POLICY "Superadmins can view all access logs"
ON public.platform_access_logs
FOR SELECT
USING (is_superadmin(auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_ftp_upload_logs_company_id ON public.ftp_upload_logs(company_id);
CREATE INDEX idx_ftp_upload_logs_uploaded_at ON public.ftp_upload_logs(uploaded_at DESC);
CREATE INDEX idx_platform_access_logs_company_id ON public.platform_access_logs(company_id);
CREATE INDEX idx_platform_access_logs_user_id ON public.platform_access_logs(user_id);
CREATE INDEX idx_platform_access_logs_accessed_at ON public.platform_access_logs(accessed_at DESC);