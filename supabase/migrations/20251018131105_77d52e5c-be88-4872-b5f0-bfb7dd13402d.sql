-- Drop the problematic INSERT policy
DROP POLICY IF EXISTS "Users can create a company during signup" ON public.companies;

-- Create a security definer function to handle company creation during signup
CREATE OR REPLACE FUNCTION public.create_company_for_user(
  _user_id uuid,
  _company_name text,
  _company_email text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _company_id uuid;
BEGIN
  -- Create the company
  INSERT INTO public.companies (name, email)
  VALUES (_company_name, _company_email)
  RETURNING id INTO _company_id;
  
  -- Update user profile with company_id
  UPDATE public.profiles
  SET company_id = _company_id
  WHERE id = _user_id;
  
  -- Assign admin role to user
  INSERT INTO public.user_roles (user_id, company_id, role)
  VALUES (_user_id, _company_id, 'admin');
  
  RETURN _company_id;
END;
$$;