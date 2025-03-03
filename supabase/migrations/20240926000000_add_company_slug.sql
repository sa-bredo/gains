
-- Add slug column to companies table
ALTER TABLE IF EXISTS public.companies 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- Update existing companies to have a slug based on name
UPDATE public.companies 
SET slug = LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]', '-', 'g'))
WHERE slug IS NULL;

-- Make slug required for future inserts
ALTER TABLE public.companies 
ALTER COLUMN slug SET NOT NULL;

-- Add index for faster slug lookups
CREATE INDEX IF NOT EXISTS companies_slug_idx ON public.companies (slug);
