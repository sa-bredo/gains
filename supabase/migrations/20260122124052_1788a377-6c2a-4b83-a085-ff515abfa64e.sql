-- Create kh_documents table
CREATE TABLE public.kh_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Untitled',
  icon TEXT DEFAULT '📄',
  cover_image TEXT,
  workspace_id TEXT NOT NULL DEFAULT 'default',
  parent_id UUID REFERENCES public.kh_documents(id) ON DELETE SET NULL,
  is_template BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create kh_blocks table
CREATE TABLE public.kh_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES public.kh_documents(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL DEFAULT '',
  properties JSONB,
  block_order INTEGER NOT NULL DEFAULT 0,
  table_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_kh_documents_created_by ON public.kh_documents(created_by);
CREATE INDEX idx_kh_documents_parent_id ON public.kh_documents(parent_id);
CREATE INDEX idx_kh_blocks_document_id ON public.kh_blocks(document_id);
CREATE INDEX idx_kh_blocks_order ON public.kh_blocks(document_id, block_order);

-- Enable RLS
ALTER TABLE public.kh_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kh_blocks ENABLE ROW LEVEL SECURITY;

-- Helper function to check document ownership
CREATE OR REPLACE FUNCTION public.is_kh_document_owner(doc_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.kh_documents
    WHERE id = doc_id AND created_by = auth.uid()
  )
$$;

-- RLS policies for kh_documents
CREATE POLICY "Users can view their own documents"
  ON public.kh_documents FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create their own documents"
  ON public.kh_documents FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own documents"
  ON public.kh_documents FOR UPDATE
  USING (created_by = auth.uid());

CREATE POLICY "Users can delete their own documents"
  ON public.kh_documents FOR DELETE
  USING (created_by = auth.uid());

-- RLS policies for kh_blocks
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

-- Trigger for updated_at on kh_documents
CREATE OR REPLACE FUNCTION public.update_kh_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_kh_documents_updated_at
  BEFORE UPDATE ON public.kh_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kh_updated_at();

CREATE TRIGGER update_kh_blocks_updated_at
  BEFORE UPDATE ON public.kh_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_kh_updated_at();