-- Create table for payroll calculation parameters
CREATE TABLE public.payroll_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- IRPEF brackets (stored as JSON array)
  irpef_brackets jsonb NOT NULL DEFAULT '[
    {"min": 0, "max": 28000, "rate": 0.23},
    {"min": 28000, "max": 50000, "rate": 0.35},
    {"min": 50000, "max": null, "rate": 0.43}
  ]'::jsonb,
  
  -- INPS rates
  inps_employee_rate numeric NOT NULL DEFAULT 0.0919,
  inps_employer_rate numeric NOT NULL DEFAULT 0.3008,
  
  -- TFR rate
  tfr_rate numeric NOT NULL DEFAULT 0.0691,
  
  -- INAIL rate
  inail_rate numeric NOT NULL DEFAULT 0.015,
  
  -- Regional tax rate
  regional_tax_rate numeric NOT NULL DEFAULT 0.0123,
  
  -- Municipal tax rate
  municipal_tax_rate numeric NOT NULL DEFAULT 0.008,
  
  -- Work deductions (JSON array with income thresholds)
  work_deductions jsonb NOT NULL DEFAULT '[
    {"max_income": 15000, "deduction": 1955},
    {"max_income": 28000, "deduction": 1910},
    {"max_income": 50000, "deduction": 1910}
  ]'::jsonb,
  
  -- Family deductions
  deduction_per_child numeric NOT NULL DEFAULT 950,
  
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE public.payroll_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "HR can manage payroll settings"
ON public.payroll_settings
FOR ALL
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) OR
  has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

CREATE POLICY "Users can view payroll settings in their company"
ON public.payroll_settings
FOR SELECT
USING (company_id = get_user_company(auth.uid()));

-- Create trigger for updated_at
CREATE TRIGGER update_payroll_settings_updated_at
  BEFORE UPDATE ON public.payroll_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();