-- Create documents table
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view documents in their company"
ON public.documents
FOR SELECT
USING (company_id = get_user_company(auth.uid()));

CREATE POLICY "HR can manage documents"
ON public.documents
FOR ALL
USING (
  has_role_in_company(auth.uid(), company_id, 'admin'::user_role) OR
  has_role_in_company(auth.uid(), company_id, 'hr_manager'::user_role)
);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can view documents in their company"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'documents' AND
  auth.uid() IN (
    SELECT p.id FROM profiles p
    WHERE p.company_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "HR can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur
    JOIN profiles p ON p.id = ur.user_id
    WHERE (ur.role = 'admin'::user_role OR ur.role = 'hr_manager'::user_role)
    AND p.company_id::text = (storage.foldername(name))[1]
  )
);

CREATE POLICY "HR can delete documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'documents' AND
  auth.uid() IN (
    SELECT ur.user_id FROM user_roles ur
    JOIN profiles p ON p.id = ur.user_id
    WHERE (ur.role = 'admin'::user_role OR ur.role = 'hr_manager'::user_role)
    AND p.company_id::text = (storage.foldername(name))[1]
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();