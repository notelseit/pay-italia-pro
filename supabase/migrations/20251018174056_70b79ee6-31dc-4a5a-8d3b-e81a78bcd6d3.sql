-- Drop existing policies for payroll_records
DROP POLICY IF EXISTS "Users can view payroll in their company" ON public.payroll_records;
DROP POLICY IF EXISTS "HR can manage payroll records" ON public.payroll_records;

-- Create new policies for payroll_records
-- HR and admins can see all payroll records in their company
CREATE POLICY "HR can view all payroll records"
ON public.payroll_records
FOR SELECT
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) 
  OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

-- Employees can see only their own payroll records
CREATE POLICY "Employees can view their own payroll"
ON public.payroll_records
FOR SELECT
USING (
  has_role_in_company(auth.uid(), company_id, 'employee'::user_role)
  AND employee_id IN (
    SELECT e.id 
    FROM public.employees e
    JOIN public.profiles p ON p.email = e.email
    WHERE p.id = auth.uid()
  )
);

-- HR can manage (insert, update, delete) payroll records
CREATE POLICY "HR can manage payroll records"
ON public.payroll_records
FOR ALL
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) 
  OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

-- Drop existing policies for presence_records
DROP POLICY IF EXISTS "Users can view presence in their company" ON public.presence_records;
DROP POLICY IF EXISTS "HR can manage presence records" ON public.presence_records;

-- Create new policies for presence_records
-- HR and admins can see all presence records in their company
CREATE POLICY "HR can view all presence records"
ON public.presence_records
FOR SELECT
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) 
  OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

-- Employees can see only their own presence records
CREATE POLICY "Employees can view their own presence"
ON public.presence_records
FOR SELECT
USING (
  has_role_in_company(auth.uid(), company_id, 'employee'::user_role)
  AND employee_id IN (
    SELECT e.id 
    FROM public.employees e
    JOIN public.profiles p ON p.email = e.email
    WHERE p.id = auth.uid()
  )
);

-- HR can manage (insert, update, delete) presence records
CREATE POLICY "HR can manage presence records"
ON public.presence_records
FOR ALL
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) 
  OR has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);