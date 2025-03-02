
-- Function to get template masters (grouped by location with latest version)
CREATE OR REPLACE FUNCTION public.get_shift_template_masters()
RETURNS TABLE (
  location_id uuid,
  location_name text,
  latest_version int,
  template_count bigint,
  created_at timestamptz
) LANGUAGE sql AS $$
  WITH template_versions AS (
    SELECT 
      t.location_id,
      l.name as location_name,
      t.version,
      COUNT(*) as template_count,
      MIN(t.created_at) as created_at,
      ROW_NUMBER() OVER (PARTITION BY t.location_id ORDER BY t.version DESC) as rn
    FROM shift_templates t
    JOIN locations l ON t.location_id = l.id
    GROUP BY t.location_id, l.name, t.version
  )
  SELECT 
    location_id,
    location_name,
    version as latest_version,
    template_count,
    created_at
  FROM template_versions
  WHERE rn = 1
  ORDER BY location_name ASC;
$$;
