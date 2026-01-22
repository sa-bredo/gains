-- Make RLS policies fully permissive for integration purposes
-- The integrating app will handle auth at its own layer

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own documents" ON public.kh_documents;
DROP POLICY IF EXISTS "Users can create documents" ON public.kh_documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON public.kh_documents;
DROP POLICY IF EXISTS "Users can delete their own documents" ON public.kh_documents;

DROP POLICY IF EXISTS "Users can view blocks in their documents" ON public.kh_blocks;
DROP POLICY IF EXISTS "Users can create blocks in their documents" ON public.kh_blocks;
DROP POLICY IF EXISTS "Users can update blocks in their documents" ON public.kh_blocks;
DROP POLICY IF EXISTS "Users can delete blocks in their documents" ON public.kh_blocks;

-- Create permissive policies for documents
CREATE POLICY "Allow all document operations"
  ON public.kh_documents FOR ALL
  USING (true)
  WITH CHECK (true);

-- Create permissive policies for blocks
CREATE POLICY "Allow all block operations"
  ON public.kh_blocks FOR ALL
  USING (true)
  WITH CHECK (true);