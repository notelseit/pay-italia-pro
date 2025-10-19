-- Create enum for email template types
CREATE TYPE email_template_type AS ENUM (
  'reset_password',
  'payroll_delivery',
  'general_communication',
  'welcome',
  'notification'
);

-- Create email_templates table for company-specific templates
CREATE TABLE public.email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  template_type email_template_type NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  text_body TEXT,
  sender_name TEXT NOT NULL DEFAULT 'PayHub',
  sender_email TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, template_type)
);

-- Create email_settings table (superadmin only - global SMTP settings)
CREATE TABLE public.email_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  smtp_host TEXT NOT NULL,
  smtp_port INTEGER NOT NULL,
  smtp_user TEXT NOT NULL,
  smtp_secure BOOLEAN DEFAULT true,
  use_custom_smtp BOOLEAN DEFAULT false,
  from_email TEXT NOT NULL,
  from_name TEXT NOT NULL DEFAULT 'PayHub',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default global SMTP settings (one record only)
INSERT INTO public.email_settings (
  smtp_host,
  smtp_port,
  smtp_user,
  smtp_secure,
  use_custom_smtp,
  from_email,
  from_name
) VALUES (
  'mail.unilabgroup.it',
  993,
  'crm@unilabgroup.it',
  true,
  true,
  'crm@unilabgroup.it',
  'PayHub System'
);

-- Enable RLS on email_templates
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_templates
CREATE POLICY "HR can manage email templates"
ON public.email_templates
FOR ALL
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) OR
  has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

CREATE POLICY "Users can view email templates in their company"
ON public.email_templates
FOR SELECT
USING (company_id = get_user_company(auth.uid()));

-- Enable RLS on email_settings
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for email_settings (only superadmins)
CREATE POLICY "Superadmins can manage email settings"
ON public.email_settings
FOR ALL
USING (is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can view email settings"
ON public.email_settings
FOR SELECT
USING (is_superadmin(auth.uid()));

-- Create trigger for updated_at on email_templates
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for updated_at on email_settings
CREATE TRIGGER update_email_settings_updated_at
BEFORE UPDATE ON public.email_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_email_templates_company_id ON public.email_templates(company_id);
CREATE INDEX idx_email_templates_template_type ON public.email_templates(template_type);
CREATE INDEX idx_email_templates_is_active ON public.email_templates(is_active);