-- Add new fields to ccnl_contracts table
ALTER TABLE public.ccnl_contracts
ADD COLUMN IF NOT EXISTS contractual_entities jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS trial_periods jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS sick_leave_rules jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS part_time_allowed boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS fixed_term_allowed boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS permits jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS overtime_rules jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS salary_table jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.ccnl_contracts.contractual_entities IS 'Array of contractual entities: [{name: string, contribution_rate: number}]';
COMMENT ON COLUMN public.ccnl_contracts.trial_periods IS 'Array of trial periods by category: [{category: string, days: number}]';
COMMENT ON COLUMN public.ccnl_contracts.sick_leave_rules IS 'Array of sick leave rules: [{type: string, days: number, percentage: number}]';
COMMENT ON COLUMN public.ccnl_contracts.permits IS 'Permits configuration: {annual_hours: number, rol_hours: number, ex_festivity_hours: number}';
COMMENT ON COLUMN public.ccnl_contracts.overtime_rules IS 'Overtime rules: {max_hours_month: number, max_hours_year: number, percentage_increase: number}';
COMMENT ON COLUMN public.ccnl_contracts.salary_table IS 'Salary table by level: [{level: string, monthly_salary: number, annual_salary: number}]';