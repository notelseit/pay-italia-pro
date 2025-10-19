-- Create CCNL contracts table
CREATE TABLE public.ccnl_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_salary NUMERIC,
  work_hours NUMERIC DEFAULT 40,
  vacation_days INTEGER DEFAULT 26,
  sick_leave_days INTEGER DEFAULT 180,
  notice_period_days INTEGER DEFAULT 15,
  trial_period_days INTEGER DEFAULT 90,
  thirteenth_salary BOOLEAN DEFAULT true,
  fourteenth_salary BOOLEAN DEFAULT false,
  meal_vouchers BOOLEAN DEFAULT false,
  meal_voucher_amount NUMERIC DEFAULT 0,
  inps_rate NUMERIC,
  inail_rate NUMERIC,
  other_contributions JSONB,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ccnl_contracts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ccnl_contracts
CREATE POLICY "Users can view contracts in their company"
ON public.ccnl_contracts
FOR SELECT
USING (company_id = get_user_company(auth.uid()));

CREATE POLICY "HR can manage contracts"
ON public.ccnl_contracts
FOR ALL
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) OR 
  has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

-- Add default CCNL contract to companies table
ALTER TABLE public.companies
ADD COLUMN default_ccnl_contract_id UUID REFERENCES public.ccnl_contracts(id);

-- Modify employees table to use UUID for CCNL contract
ALTER TABLE public.employees
ADD COLUMN ccnl_contract_id UUID REFERENCES public.ccnl_contracts(id);

-- Create trigger for ccnl_contracts updated_at
CREATE TRIGGER update_ccnl_contracts_updated_at
BEFORE UPDATE ON public.ccnl_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();