-- Add editor_id column to kh_blocks for stable TipTap mapping
ALTER TABLE public.kh_blocks 
ADD COLUMN editor_id text;

-- Create index for faster lookups by editor_id
CREATE INDEX idx_kh_blocks_editor_id ON public.kh_blocks(editor_id);

-- Populate existing rows with a generated editor_id
UPDATE public.kh_blocks 
SET editor_id = substring(id::text from 1 for 8) || '_' || floor(random() * 1000000)::text
WHERE editor_id IS NULL;