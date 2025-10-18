-- Add new columns to employees table for complete employee management

-- Split full_name into first_name and last_name
ALTER TABLE public.employees ADD COLUMN first_name text;
ALTER TABLE public.employees ADD COLUMN last_name text;

-- Libro paga fields (already have base_salary, contract_type, hire_date)
ALTER TABLE public.employees ADD COLUMN dependents_count integer DEFAULT 0;
ALTER TABLE public.employees ADD COLUMN iban text;
ALTER TABLE public.employees ADD COLUMN inps_position text;
ALTER TABLE public.employees ADD COLUMN inail_position text;
ALTER TABLE public.employees ADD COLUMN pension_fund text;
ALTER TABLE public.employees ADD COLUMN tax_deductions numeric DEFAULT 0;
ALTER TABLE public.employees ADD COLUMN employee_type text;
ALTER TABLE public.employees ADD COLUMN national_contract_type text;
ALTER TABLE public.employees ADD COLUMN payment_category text;
ALTER TABLE public.employees ADD COLUMN working_hours numeric;

-- Cittadinanza fields
ALTER TABLE public.employees ADD COLUMN nationality text DEFAULT 'Italiana';
ALTER TABLE public.employees ADD COLUMN id_card_issue_date date;
ALTER TABLE public.employees ADD COLUMN id_card_expiry_date date;
ALTER TABLE public.employees ADD COLUMN id_card_municipality text;
ALTER TABLE public.employees ADD COLUMN id_card_province text;
ALTER TABLE public.employees ADD COLUMN passport_number text;
ALTER TABLE public.employees ADD COLUMN passport_issue_date date;
ALTER TABLE public.employees ADD COLUMN passport_expiry_date date;
ALTER TABLE public.employees ADD COLUMN passport_municipality text;
ALTER TABLE public.employees ADD COLUMN passport_province text;
ALTER TABLE public.employees ADD COLUMN marital_status text;
ALTER TABLE public.employees ADD COLUMN visa_number text;
ALTER TABLE public.employees ADD COLUMN work_permit_number text;
ALTER TABLE public.employees ADD COLUMN police_station text;
ALTER TABLE public.employees ADD COLUMN visa_issue_date date;
ALTER TABLE public.employees ADD COLUMN visa_expiry_date date;
ALTER TABLE public.employees ADD COLUMN visa_document_url text;

-- Formazione fields
ALTER TABLE public.employees ADD COLUMN cv_url text;

-- Create education_records table for training/education history
CREATE TABLE IF NOT EXISTS public.education_records (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
  employee_id uuid NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name text NOT NULL,
  grade text,
  date date,
  type text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on education_records
ALTER TABLE public.education_records ENABLE ROW LEVEL SECURITY;

-- RLS policies for education_records
CREATE POLICY "HR can manage education records"
  ON public.education_records
  FOR ALL
  USING (
    has_role_in_company(auth.uid(), company_id, 'admin'::user_role) OR 
    has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
  );

CREATE POLICY "Users can view education records in their company"
  ON public.education_records
  FOR SELECT
  USING (company_id = get_user_company(auth.uid()));

-- Add trigger for updated_at on education_records
CREATE TRIGGER update_education_records_updated_at
  BEFORE UPDATE ON public.education_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();