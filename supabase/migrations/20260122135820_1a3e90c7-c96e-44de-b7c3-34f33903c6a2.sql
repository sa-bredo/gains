-- Add doc_order column to kh_documents for drag-drop ordering
ALTER TABLE public.kh_documents 
ADD COLUMN doc_order integer NOT NULL DEFAULT 0;

-- Create index for faster ordering queries
CREATE INDEX idx_kh_documents_order ON public.kh_documents(parent_id, doc_order);

-- Populate existing rows with sequential order based on created_at
WITH ordered_docs AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid) ORDER BY created_at) - 1 as new_order
  FROM public.kh_documents
)
UPDATE public.kh_documents 
SET doc_order = ordered_docs.new_order
FROM ordered_docs 
WHERE public.kh_documents.id = ordered_docs.id;