-- Drop all block policies first
DROP POLICY IF EXISTS "Users can view blocks in their documents" ON public.kh_blocks;
DROP POLICY IF EXISTS "Users can create blocks in their documents" ON public.kh_blocks;
DROP POLICY IF EXISTS "Users can update blocks in their documents" ON public.kh_blocks;
DROP POLICY IF EXISTS "Users can delete blocks in their documents" ON public.kh_blocks;

-- Drop all document policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.kh_documents;
DROP POLICY IF EXISTS "Users can create documents" ON public.kh_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.kh_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.kh_documents;

-- Drop the function
DROP FUNCTION IF EXISTS public.is_kh_document_owner(uuid);

-- Change created_by to text
ALTER TABLE public.kh_documents 
ALTER COLUMN created_by TYPE text;

-- Recreate helper function for text comparison
CREATE OR REPLACE FUNCTION public.is_kh_document_owner(doc_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.kh_documents
    WHERE id = doc_id AND (created_by = auth.uid()::text OR auth.uid() IS NULL)
  )
$$;

-- Recreate document policies
CREATE POLICY "Users can view their own documents"
  ON public.kh_documents FOR SELECT
  USING (created_by = auth.uid()::text OR auth.uid() IS NULL);

CREATE POLICY "Users can create documents"
  ON public.kh_documents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own documents"
  ON public.kh_documents FOR UPDATE
  USING (created_by = auth.uid()::text OR auth.uid() IS NULL);

CREATE POLICY "Users can delete their own documents"
  ON public.kh_documents FOR DELETE
  USING (created_by = auth.uid()::text OR auth.uid() IS NULL);

-- Recreate block policies
CREATE POLICY "Users can view blocks in their documents"
  ON public.kh_blocks FOR SELECT
  USING (public.is_kh_document_owner(document_id));

CREATE POLICY "Users can create blocks in their documents"
  ON public.kh_blocks FOR INSERT
  WITH CHECK (public.is_kh_document_owner(document_id));

CREATE POLICY "Users can update blocks in their documents"
  ON public.kh_blocks FOR UPDATE
  USING (public.is_kh_document_owner(document_id));

CREATE POLICY "Users can delete blocks in their documents"
  ON public.kh_blocks FOR DELETE
  USING (public.is_kh_document_owner(document_id));