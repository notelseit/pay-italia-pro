-- Create function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'superadmin'
      AND company_id IS NULL
  )
$$;

-- Update RLS policies to allow superadmin access to all companies
CREATE POLICY "Superadmins can view all companies"
ON public.companies
FOR SELECT
USING (is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can update all companies"
ON public.companies
FOR UPDATE
USING (is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can insert companies"
ON public.companies
FOR INSERT
WITH CHECK (is_superadmin(auth.uid()));

CREATE POLICY "Superadmins can delete companies"
ON public.companies
FOR DELETE
USING (is_superadmin(auth.uid()));

-- Allow superadmin to view all profiles
CREATE POLICY "Superadmins can view all profiles"
ON public.profiles
FOR SELECT
USING (is_superadmin(auth.uid()));

-- Allow superadmin to view all employees
CREATE POLICY "Superadmins can view all employees"
ON public.employees
FOR SELECT
USING (is_superadmin(auth.uid()));

-- Allow superadmin to manage all user roles
CREATE POLICY "Superadmins can manage all roles"
ON public.user_roles
FOR ALL
USING (is_superadmin(auth.uid()));