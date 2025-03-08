
import { supabase } from '@/integrations/supabase/client';
import { Location } from '../../../shift-templates/types';

// Fetch locations from Supabase with company_id filter
export const fetchLocations = async (companyId: string | null): Promise<Location[]> => {
  if (!companyId) return [];
  
  console.log('Fetching locations for company ID:', companyId);
  
  // Create a query to fetch locations
  let query = supabase
    .from('locations')
    .select('*');
    
  // Apply the company filter using .eq() method
  if (companyId) {
    query = query.eq('company_id', companyId);
  }
  
  // Add ordering
  query = query.order('name');
  
  // Execute the query
  const { data, error } = await query;

  if (error) {
    console.error('Error fetching locations:', error);
    throw error;
  }

  console.log('Fetched locations:', data);
  return data || [];
};
