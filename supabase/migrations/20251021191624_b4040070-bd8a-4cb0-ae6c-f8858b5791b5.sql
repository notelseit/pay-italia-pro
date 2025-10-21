-- Drop existing RLS policies for ccnl_contracts
DROP POLICY IF EXISTS "HR can manage contracts" ON public.ccnl_contracts;
DROP POLICY IF EXISTS "Users can view contracts in their company" ON public.ccnl_contracts;

-- Create new RLS policies that allow admins to see contracts from companies they created
CREATE POLICY "Superadmins can manage all contracts"
ON public.ccnl_contracts
FOR ALL
TO authenticated
USING (is_superadmin(auth.uid()));

CREATE POLICY "Admins can manage contracts in owned companies"
ON public.ccnl_contracts
FOR ALL
TO authenticated
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) 
  OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
  OR EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = ccnl_contracts.company_id 
    AND companies.created_by = auth.uid()
  )
);

CREATE POLICY "Users can view contracts in accessible companies"
ON public.ccnl_contracts
FOR SELECT
TO authenticated
USING (
  company_id = get_user_company(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.companies 
    WHERE companies.id = ccnl_contracts.company_id 
    AND companies.created_by = auth.uid()
  )
);