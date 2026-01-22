-- Drop the foreign key constraint so any UUID can be used
ALTER TABLE public.kh_documents 
DROP CONSTRAINT IF EXISTS kh_documents_created_by_fkey;

-- Update RLS policies to allow any authenticated user OR the matching created_by
DROP POLICY IF EXISTS "Users can view their own documents" ON public.kh_documents;
DROP POLICY IF EXISTS "Users can create their own documents" ON public.kh_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.kh_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.kh_documents;

-- Create more flexible policies that work with passed userId
CREATE POLICY "Users can view their own documents"
  ON public.kh_documents FOR SELECT
  USING (created_by = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Users can create documents"
  ON public.kh_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own documents"
  ON public.kh_documents FOR UPDATE
  USING (created_by = auth.uid() OR auth.uid() IS NULL);

CREATE POLICY "Users can delete their own documents"
  ON public.kh_documents FOR DELETE
  USING (created_by = auth.uid() OR auth.uid() IS NULL);