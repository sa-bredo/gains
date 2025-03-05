
-- Function to get a user's Supabase UUID from their Clerk ID
CREATE OR REPLACE FUNCTION public.get_clerk_user_mapping(clerk_id TEXT)
RETURNS UUID
LANGUAGE sql
STABLE
AS $$
  SELECT supabase_user_id FROM public.clerk_user_mapping WHERE clerk_user_id = clerk_id LIMIT 1;
$$;

-- Function to create a mapping between Clerk ID and Supabase UUID
CREATE OR REPLACE FUNCTION public.create_clerk_user_mapping(
  clerk_id TEXT, 
  supabase_id UUID,
  user_email TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  inserted_id UUID;
BEGIN
  INSERT INTO public.clerk_user_mapping (clerk_user_id, supabase_user_id, email)
  VALUES (clerk_id, supabase_id, user_email)
  RETURNING supabase_user_id INTO inserted_id;
  
  RETURN inserted_id;
END;
$$;
