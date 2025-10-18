-- Add INSERT policy for companies table to allow new users to create their company
CREATE POLICY "Users can create a company during signup" 
ON public.companies 
FOR INSERT 
TO authenticated
WITH CHECK (true);